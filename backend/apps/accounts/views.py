from rest_framework import generics
from .models import User
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from apps.core.serializers import SchoolSerializer
from rest_framework.permissions import IsAuthenticated

class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = []  # Disable token authentication for this endpoint.
    permission_classes = []      # Allow any user to access the login endpoint.

    def post(self, request, format=None):
        username = request.data.get("username")
        password = request.data.get("password")
        
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            # Optionally, include the school data in the response.
            school_data = SchoolSerializer(user.school).data if user.school else None
            return Response({
                "token": token.key,
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "school": school_data,
                }
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can access this endpoint.

    def get(self, request, format=None):
        user = request.user
        if not user.school:
            return Response({"error": "User not associated with any school."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = SchoolSerializer(user.school)
        return Response(serializer.data)
