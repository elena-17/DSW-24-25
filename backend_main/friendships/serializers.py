from rest_framework import serializers
from .models import Favorite

class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    favorite_user = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = ['user', 'favorite_user', 'created_at']

    def get_user(self, obj):
        return obj.user.email

    def get_favorite_user(self, obj):
        return obj.favorite_user.email