from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view,  permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from users.models import User
from rest_framework_simplejwt.views import TokenObtainPairView 

from users.serializers.register import RegisterSerializer
from users.serializers.token import CustomTokenObtainPairSerializer
from users.serializers.user import UserProfileSerializer
from users.serializers.bulkDelete import BulkDeleteSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    # Obtain all users
    @action(detail=False, methods=['get'])
    def get_all_users(self, _):
        users = User.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
    #Update one user
    
    #Change password

    #Eliminate one user
    #Reuse the function from viewsUser.py

    #Eliminate multiple users
    @action(detail=False, methods=['delete'])
    def bulk_delete(self, request):
        serializer = BulkDeleteSerializer(data=request.data)
        if serializer.is_valid():
            emails = serializer.validated_data['emails']  
            users = User.objects.filter(email__in=emails) 
            count = users.delete()[0]  
            return Response({"message": f"Successfully deleted {count} users."}, status=status.HTTP_204_NO_CONTENT)      
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    #Register a new user
    #Reuse the function from register.py