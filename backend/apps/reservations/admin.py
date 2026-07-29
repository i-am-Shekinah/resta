from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("customer", "table", "date", "time", "party_size", "status")
    list_filter = ("status", "date")
    list_editable = ("status",)
    search_fields = ("customer__email", "notes")
    date_hierarchy = "date"
