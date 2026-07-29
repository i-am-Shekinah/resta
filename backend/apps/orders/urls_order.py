from django.urls import path
from . import views

urlpatterns = [
    path("", views.OrderViewSet.as_view({"get": "list"}), name="order-list"),
    path(
        "checkout/",
        views.OrderViewSet.as_view({"post": "checkout"}),
        name="order-checkout",
    ),
    path(
        "<int:pk>/",
        views.OrderViewSet.as_view({"get": "retrieve"}),
        name="order-detail",
    ),
    path(
        "<int:pk>/status/",
        views.OrderViewSet.as_view({"patch": "status"}),
        name="order-status",
    ),
]
