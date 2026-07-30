import json

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import Q
from .models import Reservation
from .serializers import ReservationSerializer, AvailabilityQuerySerializer
from apps.tables.models import Table

CONDITION_MAP = {
    "eq": "exact",
    "neq": "exact",
    "icontains": "icontains",
    "gte": "gte",
    "lte": "lte",
    "gt": "gt",
    "lt": "lt",
}


class ReservationFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")
    status = django_filters.CharFilter(method="filter_status_list")
    filters = django_filters.CharFilter(method="filter_advanced")

    def filter_search(self, queryset, name, value):
        q = Q(notes__icontains=value)
        if value.isdigit():
            q |= Q(table__number=int(value))
        return queryset.filter(q)

    def filter_status_list(self, queryset, name, value):
        statuses = [s.strip() for s in value.split(",") if s.strip()]
        if statuses:
            return queryset.filter(status__in=statuses)
        return queryset

    def filter_advanced(self, queryset, name, value):
        try:
            rules = json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return queryset
        if not isinstance(rules, list):
            return queryset

        q_total = Q()
        for rule in rules:
            field = rule.get("field")
            cond = rule.get("condition", "eq")
            val = rule.get("value")
            logic = rule.get("logic", "and")
            if not field or val in (None, ""):
                continue

            if field not in ("status", "date", "time", "party_size", "notes"):
                continue

            lookup = CONDITION_MAP.get(cond, "exact")
            if lookup == "exact" and cond == "neq":
                q = ~Q(**{field: val})
            else:
                q = Q(**{f"{field}__{lookup}": val})

            if logic == "or":
                q_total |= q
            else:
                q_total &= q

        return queryset.filter(q_total)

    class Meta:
        model = Reservation
        fields = []


class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = (permissions.IsAuthenticated,)
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = ReservationFilter
    ordering_fields = ("date", "time", "created_at")
    ordering = ("-created_at",)

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
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
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
