# Generated by Django 5.1.6 on 2025-04-02 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("transactions", "0007_alter_transaction_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="transaction",
            name="type",
            field=models.CharField(choices=[("send", "Send"), ("request", "Request")], max_length=10),
        ),
    ]
