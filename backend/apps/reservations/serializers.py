from rest_framework import serializers
from django.utils import timezone
from .models import Reservation
from apps.tables.models import Table


class TableInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ("id", "number", "capacity", "location")


class ReservationSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    table_detail = TableInfoSerializer(source="table", read_only=True)
    confirm_overlap = serializers.BooleanField(
        write_only=True, required=False, default=False
    )

    class Meta:
        model = Reservation
        fields = (
            "id",
            "customer",
            "customer_email",
            "table",
            "table_detail",
            "date",
            "time",
            "party_size",
            "status",
            "notes",
            "created_at",
            "confirm_overlap",
        )
        read_only_fields = ("customer", "created_at")

    def validate(self, data):
        data.pop("confirm_overlap", False)
        table = data.get("table") or self.instance.table
        date = data.get("date") or self.instance.date
        time = data.get("time") or self.instance.time

        if date < timezone.now().date():
            raise serializers.ValidationError("Reservation date cannot be in the past")

        if table.capacity < data.get(
            "party_size", self.instance.party_size if self.instance else 0
        ):
            raise serializers.ValidationError(
                "Table capacity is too small for this party size"
            )

        conflicting = Reservation.objects.filter(
            table=table, date=date, time=time, status__in=("pending", "confirmed")
        )
        if self.instance:
            conflicting = conflicting.exclude(id=self.instance.id)
        if conflicting.exists():
            raise serializers.ValidationError(
                "This table is already reserved at that time"
            )

        return data


class AvailabilityQuerySerializer(serializers.Serializer):
    date = serializers.DateField()
    party_size = serializers.IntegerField(min_value=1)
    time = serializers.TimeField(required=False)
