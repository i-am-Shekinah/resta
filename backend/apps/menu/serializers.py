from rest_framework import serializers
from .models import Category, MenuItem, Modifier


class ModifierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modifier
        fields = ("id", "name", "price", "max_selections")


class MenuItemSerializer(serializers.ModelSerializer):
    modifiers = ModifierSerializer(many=True, read_only=True)
    image = serializers.ImageField(read_only=True)

    class Meta:
        model = MenuItem
        fields = (
            "id",
            "category",
            "name",
            "slug",
            "description",
            "price",
            "image",
            "is_available",
            "is_featured",
            "prep_time_minutes",
            "modifiers",
        )


class MenuItemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = (
            "id",
            "category",
            "name",
            "slug",
            "description",
            "price",
            "image",
            "is_available",
            "is_featured",
            "prep_time_minutes",
        )


class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemListSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "order", "is_available", "items")
