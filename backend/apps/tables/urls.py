from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.TableViewSet, basename="table")

urlpatterns = [
    path("", include(router.urls)),
]
