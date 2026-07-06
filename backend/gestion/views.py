from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from .models import Localidad, Provincia, General, Parroquia, Sacerdote, RegistroHistorico, ArchivoAdjunto, Login
from .serializers import (
    LocalidadSerializer, ProvinciaSerializer, GeneralSerializer,
    ParroquiaSerializer, SacerdoteSerializer, RegistroHistoricoSerializer, ArchivoAdjuntoSerializer,
    RegisterSerializer, AuthLoginSerializer, LoginSerializer
)


# ================================================================
# Nota: Permisos personalizados removidos (redundantes con DRF)
# Usar directamente: permissions.IsAuthenticated, permissions.AllowAny
# ================================================================


# ================================================================
# Autenticación - Endpoints JWT
# ================================================================
class LoginView(APIView):
    """
    Endpoint para login con JWT.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = AuthLoginSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.validated_data['usuario']
            
            # Generar tokens JWT
            refresh = RefreshToken()
            refresh['user_id'] = usuario.log_codi
            refresh['username'] = usuario.log_usua
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'usuario': {
                    'id': usuario.log_codi,
                    'log_usua': usuario.log_usua,
                }
            }, status=status.HTTP_200_OK)
        
        # Retornar errores detallados
        return Response({
            'detail': 'Credenciales inválidas',
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)


class RegisterView(APIView):
    """
    Endpoint para registrar nuevos usuarios.
    POST /api/auth/register/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            
            # Generar tokens JWT
            refresh = RefreshToken()
            refresh['user_id'] = usuario.log_codi
            refresh['username'] = usuario.log_usua
            
            return Response({
                'message': 'Usuario registrado exitosamente',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'usuario': {
                    'id': usuario.log_codi,
                    'log_usua': usuario.log_usua,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    """
    Endpoint para refrescar el token JWT.
    POST /api/auth/refresh/
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        serializer = TokenRefreshSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Endpoint para logout (invalidar refresh token).
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'message': 'Logout exitoso'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Token inválido'}, status=status.HTTP_400_BAD_REQUEST)


# ================================================================
# API Pública - Registros (sin autenticación)
# ================================================================
class PublicRegistroHistoricoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pública para visualizar registros históricos públicos.
    GET /api/public/registros/
    GET /api/public/registros/{id}/
    
    Solo retorna documentos con arc_visw=True y arc_acti=True
    """
    serializer_class = RegistroHistoricoSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['arc_codi', 'arc_titu', 'arc_desc', 'arc_asun']
    filterset_fields = ['arc_año', 'arc_cate', 'arc_tema', 'arc_parroquia']
    ordering_fields = ['arc_fech', 'arc_año']
    ordering = ['-arc_fech']
    
    def get_queryset(self):
        """Solo documentos públicos y activos, con archivos precargados"""
        return RegistroHistorico.objects.filter(
            arc_visw=True,
            arc_acti=True
        ).prefetch_related('archivos').order_by('-arc_fech')


# ================================================================
# API Privada - Registros (con autenticación)
# ================================================================
class RegistroHistoricoViewSet(viewsets.ModelViewSet):
    """
    API privada para gestionar registros históricos.
    GET /api/registros/ - Listar
    POST /api/registros/ - Crear
    GET /api/registros/{id}/ - Detalle
    PUT /api/registros/{id}/ - Actualizar
    DELETE /api/registros/{id}/ - Eliminar
    
    Usuarios autenticados ven todos los registros.
    """
    serializer_class = RegistroHistoricoSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['arc_codi', 'arc_titu', 'arc_desc', 'arc_asun']
    filterset_fields = ['arc_año', 'arc_cate', 'arc_tema', 'arc_parroquia', 'arc_sacerdote', 'arc_visw', 'arc_acti']
    ordering_fields = ['arc_fech', 'arc_año', 'arc_fechr']
    ordering = ['-arc_fech']
    
    def get_queryset(self):
        """Todos los registros para usuarios autenticados, con archivos precargados"""
        return RegistroHistorico.objects.prefetch_related('archivos').all().order_by('-arc_fech')
    
    @action(detail=False, methods=['get'])
    def next_code(self, request):
        """Retorna el siguiente código autonumérico"""
        last_registro = RegistroHistorico.objects.order_by('-arc_codi').first()
        next_code = (last_registro.arc_codi + 1) if last_registro else 1
        return Response({'next_code': next_code})


# ================================================================
# ViewSets Auxiliares
# ================================================================
class LocalidadViewSet(viewsets.ModelViewSet):
    queryset = Localidad.objects.all()
    serializer_class = LocalidadSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    search_fields = ['loc_codi', 'loc_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['pci_codi']


class ProvinciaViewSet(viewsets.ModelViewSet):
    queryset = Provincia.objects.all()
    serializer_class = ProvinciaSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    search_fields = ['pci_codi', 'pci_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class GeneralViewSet(viewsets.ModelViewSet):
    queryset = General.objects.all()
    serializer_class = GeneralSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    search_fields = ['gen_codi', 'gen_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class ParroquiaViewSet(viewsets.ModelViewSet):
    queryset = Parroquia.objects.filter(par_acti=True)
    serializer_class = ParroquiaSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    search_fields = ['par_codi', 'par_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class SacerdoteViewSet(viewsets.ModelViewSet):
    queryset = Sacerdote.objects.filter(sac_acti=True)
    serializer_class = SacerdoteSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    search_fields = ['sac_codi', 'sac_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['par_codi']


class ArchivoAdjuntoViewSet(viewsets.ModelViewSet):
    queryset = ArchivoAdjunto.objects.all()
    serializer_class = ArchivoAdjuntoSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily AllowAny - PHASE 5
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['registro', 'tipo']
    search_fields = ['nombre', 'descripcion']
