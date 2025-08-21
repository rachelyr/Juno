# authentication.py
import requests
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from junoapi.models import User
import os

class CognitoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None  # no token provided, DRF will try other auth classes

        token = auth_header.split(' ')[1]

        try:
            # Get Cognito public keys (JWKS)
            jwks_url = os.environ.get('COGNITO_JWKS_URL').strip('"')
            jwks = requests.get(jwks_url).json()['keys']

            # Extract the 'kid' from token headers
            headers = jwt.get_unverified_header(token)
            kid = headers['kid']

            # Find the correct key from JWKS
            key = next((k for k in jwks if k['kid'] == kid), None)
            if not key:
                raise exceptions.AuthenticationFailed("Public key not found in JWKS")

            # Construct the public key
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)

            # Decode & verify JWT
            claims = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                audience=os.environ.get('COGNITO_APP_CLIENT_ID')
            )

            # Lookup user by cognito_id
            try:
                user = User.objects.get(cognito_id=claims['sub'])
            except User.DoesNotExist:
                raise exceptions.AuthenticationFailed("User not found")

            return (user, None)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {str(e)}")