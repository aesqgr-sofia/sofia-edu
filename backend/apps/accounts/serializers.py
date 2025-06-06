from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Include fields as needed. Here we include the role
        fields = ('id', 'username', 'school', 'email', 'first_name', 'last_name', 'role')