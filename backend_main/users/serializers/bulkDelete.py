from rest_framework import serializers

class BulkDeleteSerializer(serializers.Serializer):
    emails = serializers.ListField(
        child=serializers.EmailField(),
        required=True
    )
