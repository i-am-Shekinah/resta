from django.contrib import admin
from .models import Category, MenuItem, Modifier


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order", "is_available")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("order", "is_available")


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_available", "is_featured")
    list_filter = ("category", "is_available", "is_featured")
    list_editable = ("price", "is_available", "is_featured")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")


@admin.register(Modifier)
class ModifierAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "max_selections")
    filter_horizontal = ("menu_items",)
