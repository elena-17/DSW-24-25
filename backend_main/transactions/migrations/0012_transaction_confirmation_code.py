# Generated by Django 5.1.7 on 2025-05-01 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("transactions", "0011_alter_transaction_status"),
    ]

    operations = [
        migrations.AddField(
            model_name="transaction",
            name="confirmation_code",
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
    ]
