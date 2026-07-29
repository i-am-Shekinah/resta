from django.urls import path
from . import views

urlpatterns = [
    path(
        "",
        views.CartViewSet.as_view({"get": "list", "delete": "clear"}),
        name="cart-detail",
    ),
    path("add/", views.CartViewSet.as_view({"post": "add"}), name="cart-add"),
    path("clear/", views.CartViewSet.as_view({"delete": "clear"}), name="cart-clear"),
    path(
        "items/<int:pk>/",
        views.CartItemViewSet.as_view({"patch": "partial_update", "delete": "destroy"}),
        name="cart-item-detail",
    ),
]
