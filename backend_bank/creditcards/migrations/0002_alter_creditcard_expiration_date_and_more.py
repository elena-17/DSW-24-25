# Generated by Django 5.1.6 on 2025-03-03 18:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("creditcards", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="creditcard",
            name="expiration_date",
            field=models.DateField(verbose_name="expiration date"),
        ),
        migrations.AlterField(
            model_name="creditcard",
            name="owner_name",
            field=models.CharField(max_length=100, verbose_name="owner name"),
        ),
    ]
