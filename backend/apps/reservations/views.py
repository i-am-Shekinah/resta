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

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def perform_update(self, serializer):
        if "status" in serializer.validated_data and self.request.user.role not in (
            "admin",
            "staff",
        ):
            raise permissions.PermissionDenied(
                "Only staff can update reservation status"
            )
        serializer.save()

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

        reserved_table_ids = Reservation.objects.filter(
            date=date, status__in=("pending", "confirmed")
        ).values_list("table_id", flat=True)

        available_tables = Table.objects.filter(
            capacity__gte=party_size, status="available"
        ).exclude(id__in=reserved_table_ids)

        return Response(
            {
                "date": date,
                "party_size": party_size,
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
