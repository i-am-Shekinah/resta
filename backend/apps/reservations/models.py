from django.db import models
from django.conf import settings
from apps.tables.models import Table


class Reservation(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations"
    )
    table = models.ForeignKey(
        Table, on_delete=models.CASCADE, related_name="reservations"
    )
    date = models.DateField()
    time = models.TimeField()
    party_size = models.PositiveIntegerField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-date", "-time")

    def __str__(self):
        return f"{self.customer.email} - {self.date} {self.time}"
