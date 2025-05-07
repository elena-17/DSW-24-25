from django.db import connection
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def health_check(request):
    try:
        connection.ensure_connection()  # db
        return Response({"status": "ok"}, status=200)
    except Exception as e:
        return Response({"status": "error", "details": str(e)}, status=500)
