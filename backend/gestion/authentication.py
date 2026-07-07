from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import Login


class LoginJWTAuthentication(JWTAuthentication):
    """
    JWTAuthentication resuelve request.user contra el modelo auth.User de Django.
    Acá el usuario real es el modelo custom Login, así que se resuelve manualmente
    contra esa tabla usando el claim 'user_id' que LoginView escribe en el token.
    """

    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
        except KeyError:
            raise InvalidToken('El token no contiene identificación de usuario')

        try:
            return Login.objects.get(log_codi=user_id, log_acti=True)
        except Login.DoesNotExist:
            raise AuthenticationFailed('Usuario no encontrado o inactivo', code='user_not_found')
