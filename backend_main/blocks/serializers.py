from rest_framework import serializers

from .models import Block


class BlockSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    blocked_user = serializers.SerializerMethodField()

    class Meta:
        model = Block
        fields = ["user", "blocked_user", "created_at"]

    def get_user(self, obj):
        return obj.user.email

    def get_blocked_user(self, obj):
        return obj.blocked_user.email
