from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "phone")
        extra_kwargs = {
            "first_name": {"required": False},
            "last_name": {"required": False},
            "phone": {"required": False},
        }

    def create(self, validated_data):
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        phone = validated_data.pop("phone", "")
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(
            user=user, first_name=first_name, last_name=last_name, phone=phone
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "role", "is_active", "created_at")


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("first_name", "last_name", "phone")
