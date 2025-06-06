from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Add the custom 'role' field to the admin view
    fieldsets = BaseUserAdmin.fieldsets + (
        (None, {'fields': ('role', 'school')}),
    )
    list_display = BaseUserAdmin.list_display + ('role', 'school')
