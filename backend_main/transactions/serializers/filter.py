from rest_framework import serializers


class TransactionFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["pending", "approved", "rejected"], required=False)
    type = serializers.ChoiceField(choices=["send", "request"], required=False)
    min_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    title = serializers.CharField(required=False)
    user = serializers.EmailField(required=False)
    date_start = serializers.DateField(required=False, input_formats=["%d-%m-%Y"])
    date_end = serializers.DateField(required=False, input_formats=["%d-%m-%Y"])
