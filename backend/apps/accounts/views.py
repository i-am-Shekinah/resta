from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer
from .models import Profile

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "message": "Account created successfully",
            },
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        profile, _ = Profile.objects.get_or_create(user=user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "profile": ProfileSerializer(profile).data,
            }
        )
