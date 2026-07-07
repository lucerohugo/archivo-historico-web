from rest_framework.permissions import BasePermission

from .models import Login


class IsAdmin(BasePermission):
    """Permite la acción solo a usuarios Login con log_rol == ADMIN."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and getattr(user, 'is_authenticated', False)
            and getattr(user, 'log_rol', None) == Login.ADMIN
        )
