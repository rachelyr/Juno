from rest_framework import generics
from junoapi.serializers import UserSerializer
from junoapi.models import User

from django.db import IntegrityError

from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from junoapi.authentication import CognitoJWTAuthentication

class GetUserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

#writes user into DB from cognito data
class CreateUserView(APIView):
    permission_classes=[AllowAny]
    
    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)

            if serializer.is_valid():
                user_data = serializer.validated_data
                new_user = User.objects.create(
                    username= user_data['username'],
                    cognito_id=user_data['cognito_id'],
                    profilepicture_id = user_data['profilepicture_id']
                )

                return Response({
                    'message': 'User Created Successfully',
                    'new_user': {
                        'id': new_user.id,
                        'username': new_user.username,
                        'cognito_id': new_user.cognito_id
                    }
                }, status=status.HTTP_201_CREATED)
            
            else:
                return Response({
                    'message': 'Validation error',
                    'error': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError as e:
            return Response({
                'message': 'Error creating user: Duplicate cognito_id detected',
                'error': str(e)
            }, status=status.HTTP_409_CONFLICT)  # 409 Conflict for duplicate resource
        except ValidationError as e:
            return Response({
                'message': 'Validation error',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'message': f'Error creating user: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GetUserById(APIView):
    authentication_classes = [CognitoJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_sub):
        try:
            user = User.objects.get(cognito_id=user_sub)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)