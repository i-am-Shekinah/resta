from django.db import models


class Table(models.Model):
    class Location(models.TextChoices):
        INDOOR = "indoor", "Indoor"
        PATIO = "patio", "Patio"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        RESERVED = "reserved", "Reserved"
        OCCUPIED = "occupied", "Occupied"

    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField()
    location = models.CharField(
        max_length=20, choices=Location.choices, default=Location.INDOOR
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE
    )

    class Meta:
        ordering = ("number",)

    def __str__(self):
        return f"Table {self.number} ({self.get_capacity_display()})"
