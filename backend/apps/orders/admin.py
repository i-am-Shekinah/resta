from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem


class CartItemInline(admin.TabularInline):
    model = CartItem


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "payment_status", "total", "created_at")
    list_filter = ("status", "payment_status")
    list_editable = ("status",)
    search_fields = ("user__email",)
    inlines = [OrderItemInline]
    readonly_fields = ("subtotal", "tax", "total", "created_at", "updated_at")
