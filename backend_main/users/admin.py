from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # Define fields to be displayed in the list of users
    list_display = ("email", "phone_number", "name", "id_number", "rol")

    # Add filters for email and phone number
    list_filter = ("email", "phone_number")

    # Add options for searching users by email, phone number, or name
    search_fields = ("email", "phone_number", "name")
