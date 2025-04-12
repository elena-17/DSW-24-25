from rest_framework import serializers

from account.models import Account

class AccountSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = "__all__"

    def get_user(self, obj):
        return obj.user.email
