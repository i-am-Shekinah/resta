from rest_framework import serializers
from django.db import models
from .models import Cart, CartItem, Order, OrderItem
from apps.menu.models import MenuItem
from apps.menu.serializers import MenuItemListSerializer


def _calculate_modifier_extra(modifiers):
    if not modifiers:
        return 0
    from apps.menu.models import Modifier

    ids = []
    for m in modifiers:
        if isinstance(m, dict):
            ids.append(m.get("id"))
        elif isinstance(m, (int, str)):
            ids.append(int(m))
    ids = [i for i in ids if i is not None]
    if not ids:
        return 0
    extra = (
        Modifier.objects.filter(id__in=ids).aggregate(total_price=models.Sum("price"))[
            "total_price"
        ]
        or 0
    )
    return extra


class CartItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemListSerializer(source="menu_item", read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = (
            "id",
            "menu_item",
            "menu_item_detail",
            "quantity",
            "modifiers",
            "subtotal",
        )

    def get_subtotal(self, obj):
        total = obj.menu_item.price * obj.quantity
        extra = _calculate_modifier_extra(obj.modifiers)
        total += extra * obj.quantity
        return total


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("id", "user", "items", "total", "created_at", "updated_at")
        read_only_fields = ("user",)

    def get_total(self, obj):
        total = 0
        for item in obj.items.all():
            total += item.menu_item.price * item.quantity
            extra = _calculate_modifier_extra(item.modifiers)
            total += extra * item.quantity
        return total


class AddToCartSerializer(serializers.Serializer):
    menu_item = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.filter(is_available=True)
    )
    quantity = serializers.IntegerField(min_value=1, default=1)
    modifiers = serializers.ListField(default=list)


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source="menu_item.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "menu_item",
            "menu_item_name",
            "quantity",
            "unit_price",
            "modifiers",
        )


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "user",
            "status",
            "subtotal",
            "tax",
            "total",
            "payment_method",
            "payment_status",
            "notes",
            "items",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "user",
            "status",
            "subtotal",
            "tax",
            "total",
            "payment_status",
            "created_at",
            "updated_at",
        )


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.CharField(default="dummy")
    notes = serializers.CharField(required=False, allow_blank=True)
    table_id = serializers.IntegerField(required=False, allow_null=True)
