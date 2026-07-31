from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ("email", "password", "first_name", "last_name", "phone")

    def create(self, validated_data):
        profile_data = {
            "first_name": validated_data.pop("first_name", ""),
            "last_name": validated_data.pop("last_name", ""),
            "phone": validated_data.pop("phone", ""),
        }
        user = User.objects.create_user(**validated_data)

        profile = user.profile
        profile.first_name = profile_data.get("first_name", "")
        profile.last_name = profile_data.get("last_name", "")
        profile.phone = profile_data.get("phone", "")
        profile.save()

        return user


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        user = self.context.get("user")
        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {"current_password": "Current password is incorrect."}
            )
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": "New password must be different from the current password."
                }
            )
        return attrs

    def save(self, **kwargs):
        user = self.context.get("user")
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user


class UserSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="profile.first_name", default="")
    last_name = serializers.CharField(source="profile.last_name", default="")
    phone = serializers.CharField(source="profile.phone", default="")
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "role",
            "is_active",
            "created_at",
            "first_name",
            "last_name",
            "phone",
            "avatar",
        )

    def get_avatar(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            return obj.profile.avatar.url
        return None


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ("first_name", "last_name", "phone", "avatar")
