from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocalidadViewSet, ProvinciaViewSet, GeneralViewSet,
    ParroquiaViewSet, SacerdoteViewSet, RegistroHistoricoViewSet, ArchivoAdjuntoViewSet,
    PublicRegistroHistoricoViewSet,
    LoginView, RegisterView, RefreshTokenView, LogoutView
)

# Router para API privada
router = DefaultRouter()
router.register(r'localidades', LocalidadViewSet, basename='localidad')
router.register(r'provincias', ProvinciaViewSet, basename='provincia')
router.register(r'generales', GeneralViewSet, basename='general')
router.register(r'parroquias', ParroquiaViewSet, basename='parroquia')
router.register(r'sacerdotes', SacerdoteViewSet, basename='sacerdote')
router.register(r'registros', RegistroHistoricoViewSet, basename='registro')
router.register(r'archivos', ArchivoAdjuntoViewSet, basename='archivo')

# Router para API pública
public_router = DefaultRouter()
public_router.register(r'registros', PublicRegistroHistoricoViewSet, basename='public-registro')

urlpatterns = [
    # API privada
    path('', include(router.urls)),
    
    # API pública
    path('public/', include(public_router.urls)),
    
    # Autenticación
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='refresh'),
]
