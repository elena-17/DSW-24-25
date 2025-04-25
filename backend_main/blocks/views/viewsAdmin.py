from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import LimitOffsetPagination

from users.models import User
from ..models import Block
from ..serializers import BlockSerializer


# GET: List all block relations (paginated)
@api_view(["GET"])
def get_all_block_pairs(request):
    blocks = Block.objects.select_related("user", "blocked_user").all().order_by("id")
    paginator = LimitOffsetPagination()
    paginated_qs = paginator.paginate_queryset(blocks, request)
    serializer = BlockSerializer(paginated_qs, many=True)
    return Response({
        "data": serializer.data,
        "total": paginator.count,
    }, status=status.HTTP_200_OK)


# POST: Admin creates a block relation between two users
@api_view(["POST"])
def admin_add_block_relation(request):
    user_email = request.data.get("user")
    blocked_email = request.data.get("blocked_user")

    if not user_email or not blocked_email:
        return Response({"error": "Both 'user' and 'blocked_user' emails are required."}, status=status.HTTP_400_BAD_REQUEST)

    if user_email == blocked_email:
        return Response({"error": "A user cannot block themselves."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=user_email)
        blocked_user = User.objects.get(email=blocked_email)

        if Block.objects.filter(user=user, blocked_user=blocked_user).exists():
            return Response(
                {"error": "This block relation already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        block = Block.objects.create(user=user, blocked_user=blocked_user)
        BlockSerializer(block)
        return Response({"message": f"Block relation added: {user_email} 🚫 {blocked_email}"}, status=status.HTTP_201_CREATED)
    except User.DoesNotExist:
        return Response({"error": "One or both users not found."}, status=status.HTTP_404_NOT_FOUND)


# DELETE: Admin removes a block relation between two users
@api_view(["DELETE"])
def admin_remove_block_relation(request):
    user_email = request.data.get("user")
    blocked_email = request.data.get("blocked_user")

    if not user_email or not blocked_email:
        return Response({"error": "Both 'user' and 'blocked_user' emails are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=user_email)
        blocked_user = User.objects.get(email=blocked_email)
        block = Block.objects.get(user=user, blocked_user=blocked_user)
        BlockSerializer(block)  # Optional: serialize before deleting
        block.delete()
        return Response({"message": f"Block relation removed: {user_email} ❌ {blocked_email}"}, status=status.HTTP_200_OK)
    except (User.DoesNotExist, Block.DoesNotExist):
        return Response({"error": "Block relation not found."}, status=status.HTTP_404_NOT_FOUND)