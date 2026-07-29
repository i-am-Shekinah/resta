from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models, transaction
from decimal import Decimal
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    OrderSerializer,
    CheckoutSerializer,
)
from apps.menu.models import MenuItem, Modifier


class CartViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart = self._get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=["POST"])
    def add(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = self._get_cart(request.user)

        existing = CartItem.objects.filter(
            cart=cart,
            menu_item=serializer.validated_data["menu_item"],
            modifiers=serializer.validated_data["modifiers"],
        ).first()

        if existing:
            existing.quantity += serializer.validated_data["quantity"]
            existing.save()
        else:
            CartItem.objects.create(
                cart=cart,
                menu_item=serializer.validated_data["menu_item"],
                quantity=serializer.validated_data["quantity"],
                modifiers=serializer.validated_data["modifiers"],
            )

        return Response(CartSerializer(cart).data)

    @action(detail=False, methods=["DELETE"])
    def clear(self, request):
        cart = self._get_cart(request.user)
        cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        return CartItem.objects.filter(cart=cart)

    def perform_destroy(self, instance):
        instance.delete()


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "staff"):
            return Order.objects.all()
        return Order.objects.filter(user=user)

    @action(detail=True, methods=["PATCH"])
    def status(self, request, pk=None):
        order = self.get_object()
        if request.user.role not in ("admin", "staff"):
            return Response(
                {"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get("status")
        if new_status not in dict(Order.Status.choices):
            return Response(
                {"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST
            )
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=["POST"])
    def checkout(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response(
                {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            subtotal = Decimal("0")
            for item in cart_items:
                item_total = item.menu_item.price * item.quantity
                if item.modifiers:
                    modifier_ids = [
                        m.get("id") for m in item.modifiers if isinstance(m, dict)
                    ]
                    if modifier_ids:
                        extra = (
                            Modifier.objects.filter(id__in=modifier_ids).aggregate(
                                total_price=models.Sum("price")
                            )["total_price"]
                            or 0
                        )
                        item_total += extra * item.quantity
                subtotal += item_total

            tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))
            total = subtotal + tax

            order = Order.objects.create(
                user=request.user,
                subtotal=subtotal,
                tax=tax,
                total=total,
                payment_method=serializer.validated_data.get("payment_method", "dummy"),
                payment_status="paid",
                notes=serializer.validated_data.get("notes", ""),
            )

            for item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    menu_item=item.menu_item,
                    quantity=item.quantity,
                    unit_price=item.menu_item.price,
                    modifiers=item.modifiers,
                )

            cart_items.delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
