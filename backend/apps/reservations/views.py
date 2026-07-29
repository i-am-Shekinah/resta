from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation
from .serializers import ReservationSerializer, AvailabilityQuerySerializer
from apps.tables.models import Table


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if user.role in ("admin", "staff"):
            return Reservation.objects.all()
        return Reservation.objects.filter(customer=user)

    def create(self, request, *args, **kwargs):
        table_id = request.data.get("table")
        date = request.data.get("date")
        time = request.data.get("time")
        if not request.data.get("confirm_overlap") and table_id and date and time:
            user_conflict = Reservation.objects.filter(
                customer=request.user,
                date=date,
                time=time,
                status__in=("pending", "confirmed"),
            ).exclude(table_id=table_id)
            if user_conflict.exists():
                return Response(
                    {
                        "overlap_warning": True,
                        "message": f"You already have a reservation at {time} on {date}. Book this table anyway?",
                    },
                    status=status.HTTP_409_CONFLICT,
                )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role in ("admin", "staff"):
            serializer.save()
            return

        allowed = {"status"}
        extra = set(serializer.validated_data.keys()) - allowed
        if extra:
            raise permissions.PermissionDenied(
                "Customers can only cancel their own reservations"
            )
        if serializer.validated_data.get("status") != "cancelled":
            raise permissions.PermissionDenied(
                "Customers can only cancel their own reservations"
            )
        serializer.save(status="cancelled")

    @action(detail=False, methods=["GET"])
    def my(self, request):
        reservations = Reservation.objects.filter(customer=request.user)
        serializer = self.get_serializer(reservations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["GET"])
    def availability(self, request):
        serializer = AvailabilityQuerySerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        date = serializer.validated_data["date"]
        party_size = serializer.validated_data["party_size"]
        time = serializer.validated_data.get("time")

        reserved = Reservation.objects.filter(
            date=date, status__in=("pending", "confirmed")
        )
        if time:
            reserved = reserved.filter(time=time)
        reserved_table_ids = reserved.values_list("table_id", flat=True)

        available_tables = Table.objects.filter(
            capacity__gte=party_size, status="available"
        ).exclude(id__in=reserved_table_ids)

        return Response(
            {
                "date": date,
                "party_size": party_size,
                "time": str(time) if time else None,
                "available_tables": [
                    {
                        "id": t.id,
                        "number": t.number,
                        "capacity": t.capacity,
                        "location": t.location,
                    }
                    for t in available_tables
                ],
            }
        )
