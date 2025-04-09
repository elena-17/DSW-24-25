from rest_framework import serializers
from users.models import User

from transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    sender = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="email")
    receiver = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field="email")

    class Meta:
        model = Transaction
        fields = "__all__"
        extra_kwargs = {
            "sender": {"required": True},
            "receiver": {"required": True},
            "amount": {"required": True},
            "title": {"required": True},
        }
        read_only_fields = ["id", "created_at", "updated_at"]
