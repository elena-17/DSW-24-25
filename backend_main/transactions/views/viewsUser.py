import random
import string
import threading
import uuid

from datetime import datetime, time
from email.utils import quote
from zoneinfo import ZoneInfo

from blocks.models import Block
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.core.signing import TimestampSigner
from django.db.models import Q
from django.shortcuts import get_object_or_404
from itsdangerous import BadSignature
from mercure.mercure import publish_to_mercure
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User

from transactions.models import Transaction
from transactions.serializers.filter import TransactionFilterSerializer
from transactions.serializers.send_request import (
    RequestTransactionSerializer,
    SendTransactionSerializer,
)
from transactions.serializers.status import TransactionStatusUpdateSerializer
from transactions.serializers.transactions import TransactionSerializer

signer = TimestampSigner()
confirmation_codes = {}


@api_view(["GET"])
def get_transaction(request, id):
    """
    get transaction by id
    """
    transaction = get_object_or_404(Transaction, pk=id)
    serializer = TransactionSerializer(transaction)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_all_transactions(request):
    """
    Endpoint unificado para transacciones de usuario:
    /api/transactions/&type=send|request
        &status=pending,approved,rejected
        &title=&user=
        &min_amount=&max_amount=
        &date_start=DD-MM-YYYY
        &date_end=DD-MM-YYYY
        &limit=&offset=
    """
    pending_type = request.GET.get("pending_type")
    params = request.GET.copy()
    params.pop("pending_type", None)
    filter_serializer = TransactionFilterSerializer(data=params)

    if not filter_serializer.is_valid():
        return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    data = filter_serializer.validated_data
    user = request.user
    other_user_email = data.get("user")
    user_tz_str = request.headers.get("X-Timezone", "UTC")
    try:
        user_tz = ZoneInfo(user_tz_str)
    except KeyError:  # Si la zona horaria no es válida
        user_tz = ZoneInfo("UTC")

    if pending_type == "pendingMyApproval":
        queryset = Transaction.objects.filter(
            (Q(type="send") & Q(receiver=user)) | (Q(type="request") & Q(sender=user))
        )
    elif pending_type == "pendingOthers":
        queryset = Transaction.objects.filter(
            (Q(type="send") & Q(sender=user)) | (Q(type="request") & Q(receiver=user))
        )
    else:
        if data.get("type") == "send":
            queryset = Transaction.objects.filter(sender=user)
        elif data.get("type") == "request":
            queryset = Transaction.objects.filter(receiver=user)
        else:
            queryset = Transaction.objects.filter(Q(sender=user) | Q(receiver=user))

    if other_user_email:
        queryset = queryset.filter(Q(sender__email=other_user_email) | Q(receiver__email=other_user_email))

    filter_fields = {
        "min_amount": "amount__gte",
        "max_amount": "amount__lte",
        "title": "title__icontains",
        "status": "status__in",
    }

    for field, lookup in filter_fields.items():
        if field in data:
            queryset = queryset.filter(**{lookup: data[field]})

    if "date_start" in data:
        start_dt_local = datetime.combine(data["date_start"], time.min).replace(tzinfo=user_tz)
        start_dt_utc = start_dt_local.astimezone(ZoneInfo("UTC"))
        queryset = queryset.filter(created_at__gte=start_dt_utc)

    if "date_end" in data:
        end_dt_local = datetime.combine(data["date_end"], time.max).replace(tzinfo=user_tz)
        end_dt_utc = end_dt_local.astimezone(ZoneInfo("UTC"))
        queryset = queryset.filter(created_at__lte=end_dt_utc)

    paginator = LimitOffsetPagination()
    paginator.default_limit = 30
    paginated_qs = paginator.paginate_queryset(queryset.order_by("-created_at"), request)

    serializer = TransactionSerializer(paginated_qs, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
def number_pending(request):
    """
    get number of pending transactions
    """
    transactions = Transaction.objects.filter(
        (
            (Q(receiver=request.user) & Q(status="pending") & Q(type="send"))
            | (Q(sender=request.user) & Q(status="pending") & Q(type="request"))
        )
    )
    serializer = TransactionSerializer(transactions, many=True)
    return Response({"number_pending": len(serializer.data)}, status=status.HTTP_200_OK)


def is_blocked(blocker_email, blocked_email):
    blocker = User.objects.filter(email=blocker_email).first()
    blocked = User.objects.filter(email=blocked_email).first()

    if not blocker or not blocked:
        return False

    return Block.objects.filter(user=blocker, blocked_user=blocked).exists()


def is_seller(email):
    user = User.objects.filter(email=email).first()
    if not user:
        return False
    return User.objects.filter(email=email, role="seller").exists()


def is_admin(email):
    user = User.objects.filter(email=email).first()
    if not user:
        return False
    return User.objects.filter(email=email, role="admin").exists()


@api_view(["POST"])
def send_money(request):
    request_data = request.data.copy()
    request_data["sender"] = request.user
    receivers = request_data.get("receivers")
    print(f"Receivers: {receivers}")

    for receiver_user in receivers:
        if is_blocked(receiver_user, request.user):
            return Response(
                {"error": f"You are blocked by the recipient ({receiver_user}). Transaction cannot be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if is_seller(receiver_user) or is_admin(receiver_user):
            return Response(
                {
                    "error": f"You cannot send money to a seller or admin ({receiver_user}). Transaction cannot be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
    serializer = SendTransactionSerializer(data=request_data, context={"request": request})

    if serializer.is_valid():
        transactions = serializer.save()
        tr_serialized = TransactionSerializer(transactions, many=True)
        for transaction in tr_serialized.data:
            topic = f"user/{transaction['receiver']}"
            publish_to_mercure(topic, transaction)
        return Response(
            {"message": "Transaction successful", "transactions": tr_serialized.data},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def request_money(request):
    request_data = request.data.copy()
    request_data["receiver"] = request.user

    senders = request_data.get("senders")
    for sender_user in senders:
        if is_blocked(sender_user, request.user):
            return Response(
                {"error": f"You are blocked by the sender ({sender_user}). Transaction cannot be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if is_seller(sender_user) or is_admin(sender_user):
            return Response(
                {
                    "error": f"You cannot request money from a seller or admin ({sender_user}). Transaction cannot be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    serializer = RequestTransactionSerializer(data=request_data, context={"request": request})

    if serializer.is_valid():
        transactions = serializer.save()
        tr_serialized = TransactionSerializer(transactions, many=True)
        if is_seller(request.user):
            handle_seller_request(transactions)
            return Response(
                {"message": "Payment request sent to user or users.", "transactions": tr_serialized.data},
                status=status.HTTP_201_CREATED,
            )

        else:
            for transaction in tr_serialized.data:
                topic = f"user/{transaction['sender']}"
                publish_to_mercure(topic, transaction)
            return Response(
                {"message": "Transaction successful", "transactions": tr_serialized.data},
                status=status.HTTP_201_CREATED,
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def handle_seller_request(transactions):
    for transaction in transactions:
        transaction.status = "processing"
        transaction.confirmation_token = str(uuid.uuid4())
        transaction.save()

        sender_email = transaction.sender.email
        receiver_email = transaction.receiver.email

        # Token firmado que solo el backend puede desencriptar
        signed_token = signer.sign(f"{sender_email}:{transaction.confirmation_token}")

        threading.Thread(
            target=send_seller_transaction_email,
            args=(sender_email, receiver_email, transaction.amount, transaction.title, signed_token),
        ).start()


def generate_payment_link(receiver_email: str, sender_email: str, confirmation_token: str) -> str:
    encoded_email = quote(sender_email)
    encoded_receiver_email = quote(receiver_email)
    payment_link = f"http://localhost:4200/loginPayment/?email={encoded_email}&receiver={encoded_receiver_email}&confirmation_token={confirmation_token}"
    return payment_link


def send_seller_transaction_email(
    sender_email: str, receiver_email: str, amount: float, title: str, confirmation_token: str
) -> None:
    payment_link = generate_payment_link(receiver_email, sender_email, confirmation_token)

    subject = "You have a new payment request on ZAP"
    message = f"""
        <html>
        <body>
            <p><strong>{receiver_email}</strong> has requested a payment of <strong>{amount}€</strong> with concept <strong>{title}</strong>.</p>
            <p>Please log in to the platform to review and approve the request:</p>
            <a href="{payment_link}" style="background-color:#00b8c4;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Review Request</a>
            <p>If you were not expecting this, please contact support or ignore this email.</p>
        </body>
        </html>
    """
    send_mail(subject, "", settings.DEFAULT_FROM_EMAIL, [sender_email], html_message=message)


def generate_code(length=6):
    return "".join(random.choices(string.digits, k=length))


@api_view(["POST"])
def send_confirmation_code(request):
    email = request.data.get("email")
    confirmation_token = request.data.get("confirmationToken")

    if not email or not confirmation_token:
        return Response(
            {"error": "Both email and confirmationToken are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        raw = signer.unsign(confirmation_token)
        email, confirmation_token = raw.split(":")
    except BadSignature:
        return Response({"error": "Invalid or tampered token."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction = Transaction.objects.get(
            sender__email=email, confirmation_token=confirmation_token, status="processing"
        )
    except Transaction.DoesNotExist:
        return Response(
            {"error": "Transaction not found or already confirmed."},
            status=status.HTTP_404_NOT_FOUND,
        )
    code = generate_code()
    transaction.confirmation_code = code
    transaction.save()

    threading.Thread(
        target=send_confirmation_code_email,
        args=(email, code),
    ).start()

    return Response({"message": "Confirmation code sent successfully."}, status=status.HTTP_200_OK)


def send_confirmation_code_email(email: str, code: str) -> None:
    subject = "ZAP Payment Confirmation Code"
    html_message = f"""
    <html>
    <body>
        <p>You are about to confirm a payment.</p>
        <p>Your confirmation code is:</p>
        <h2 style="color:#00b8c4;">{code}</h2>
        <p>Enter this code to complete your transaction.</p>
    </body>
    </html>
    """
    send_mail(subject, "", settings.DEFAULT_FROM_EMAIL, [email], html_message=html_message)


@api_view(["POST"])
def confirm_transaction_code(request):
    receiver_email = request.data.get("receiver")
    sender_email = request.data.get("sender")
    code = request.data.get("code")

    if not all([receiver_email, sender_email, code]):
        return Response({"error": "receiver, sender, and code are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        transaction = Transaction.objects.get(
            sender__email=sender_email, receiver__email=receiver_email, confirmation_code=code, status="processing"
        )
    except Transaction.DoesNotExist:
        return Response(
            {"error": "No matching transaction found or code is invalid."}, status=status.HTTP_404_NOT_FOUND
        )

    transaction.approveRequest()  # Actualiza saldos, cambia estado a "approved", guarda
    transaction.confirmation_code = None  # Limpiamos el código
    transaction.save()

    serialized = TransactionSerializer(transaction)

    return Response(
        {"message": "Transaction approved successfully.", "transaction": serialized.data}, status=status.HTTP_200_OK
    )


@api_view(["PUT"])
def update_transaction_status(request, id):
    transaction = get_object_or_404(Transaction, pk=id)

    if transaction.sender != request.user and transaction.receiver != request.user:
        return Response(
            {"error": "You are not authorized to update this transaction."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = TransactionStatusUpdateSerializer(transaction, data=request.data, partial=True)

    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_and_request_money(request):
    email = request.data.get("email")
    password = request.data.get("password")
    senders = request.data.get("senders")
    title = request.data.get("title")
    amount = request.data.get("amount")
    if not all([email, password, senders, title, amount]):
        return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Authenticate user
    user = authenticate(request, email=email, password=password)
    if not user:
        return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.is_confirmed:
        return Response({"error": "User is not confirmed."}, status=status.HTTP_403_FORBIDDEN)
    if not is_seller(user):
        return Response({"error": "Only sellers can use this endpoint."}, status=status.HTTP_403_FORBIDDEN)

    # 2. Generate token JWT
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)

    # 3. Simulate request data
    request_data = {
        "senders": senders,
        "title": title,
        "amount": amount,
        "receiver": user.email,
    }
    request._full_data = request_data
    request.user = user

    # 4. Validate if the sender is blocked or is a seller/admin
    for sender_email in senders:
        if is_blocked(sender_email, user):
            return Response(
                {"error": f"You are blocked by the sender ({sender_email}). Transaction cannot be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if is_seller(sender_email) or is_admin(sender_email):
            return Response(
                {
                    "error": f"You cannot request money from a seller or admin ({sender_email}). Transaction cannot be completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # 5. Create transaction
    serializer = RequestTransactionSerializer(data=request_data, context={"request": request})
    if serializer.is_valid():
        transactions = serializer.save()
        tr_serialized = TransactionSerializer(transactions, many=True)
        handle_seller_request(transactions)
        return Response(
            {
                "message": "Login successful. Payment request sent.",
                "token": {
                    "access": access_token,
                    "refresh": str(refresh),
                },
                "transactions": tr_serialized.data,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
