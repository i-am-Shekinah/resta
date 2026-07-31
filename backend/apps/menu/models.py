from django.db import models
from cloudinary.models import CloudinaryField


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ("order", "name")
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = CloudinaryField("image", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    prep_time_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("category__order", "name")

    def __str__(self):
        return self.name


class Modifier(models.Model):
    name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    max_selections = models.PositiveIntegerField(default=1)
    menu_items = models.ManyToManyField(MenuItem, related_name="modifiers", blank=True)

    def __str__(self):
        return self.name
