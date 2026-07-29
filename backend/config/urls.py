from django.contrib import admin
from django.urls import path, include
from apps.core.views import api_root

urlpatterns = [
    path("", api_root, name="api-root"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/menu/", include("apps.menu.urls")),
    path("api/cart/", include("apps.orders.urls_cart")),
    path("api/orders/", include("apps.orders.urls_order")),
    path("api/tables/", include("apps.tables.urls")),
    path("api/reservations/", include("apps.reservations.urls")),
]
