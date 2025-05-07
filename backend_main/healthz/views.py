from django.db import connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    try:
        connection.ensure_connection()  # db
        return Response({"status": "ok"}, status=200)
    except Exception as e:
        return Response({"status": "error", "details": str(e)}, status=500)
