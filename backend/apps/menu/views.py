from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from .models import Category, MenuItem, Modifier
from .serializers import CategorySerializer, MenuItemSerializer, ModifierSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_available=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"
    permission_classes = (permissions.AllowAny,)


class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MenuItem.objects.filter(is_available=True)
    serializer_class = MenuItemSerializer
    lookup_field = "slug"
    permission_classes = (permissions.AllowAny,)
    filter_backends = (DjangoFilterBackend, SearchFilter)
    filterset_fields = ("category__slug", "is_featured")
    search_fields = ("name", "description")


class ModifierViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Modifier.objects.all()
    serializer_class = ModifierSerializer
    permission_classes = (permissions.AllowAny,)
