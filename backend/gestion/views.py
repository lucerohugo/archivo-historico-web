from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django_filters.rest_framework import DjangoFilterBackend
import mimetypes
import posixpath
from urllib.parse import quote
from django.conf import settings
from django.core import signing
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.http import content_disposition_header
from django.views.decorators.http import require_GET
from .models import Localidad, Provincia, General, Parroquia, Sacerdote, RegistroHistorico, ArchivoAdjunto, Login
from .filters import RegistroHistoricoFilter
from .permissions import IsAdmin
from .serializers import (
    LocalidadSerializer, ProvinciaSerializer, GeneralSerializer,
    ParroquiaSerializer, SacerdoteSerializer, RegistroHistoricoSerializer, ArchivoAdjuntoSerializer,
    RegisterSerializer, AuthLoginSerializer, LoginSerializer,
    ARCHIVO_SIGNING_SALT,
)


# ================================================================
# Permisos compartidos
# ================================================================
class AdminWriteMixin:
    """Lectura: cualquier usuario autenticado. Crear/editar/borrar: solo rol ADMIN."""

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


# ================================================================
# Autenticación - Endpoints JWT
# ================================================================
class LoginView(APIView):
    """
    Endpoint para login con JWT.
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'login'

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
                    'log_rol': usuario.log_rol,
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
    Endpoint para renovar la sesión.
    POST /api/auth/refresh/  {refresh} -> {access, refresh}

    No usa TokenRefreshSerializer de simplejwt: ese busca el usuario en auth.User,
    y acá el usuario es el modelo Login. Devuelve también un refresh nuevo, así la
    sesión se mantiene mientras haya actividad (vence tras un día sin uso).
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    throttle_scope = 'refresh'

    def post(self, request):
        try:
            refresh = RefreshToken(request.data.get('refresh', ''))
            usuario = Login.objects.get(log_codi=refresh['user_id'], log_acti=True)
        except (TokenError, KeyError, Login.DoesNotExist):
            return Response({'detail': 'Sesión vencida o inválida'}, status=status.HTTP_401_UNAUTHORIZED)

        nuevo = RefreshToken()
        nuevo['user_id'] = usuario.log_codi
        nuevo['username'] = usuario.log_usua
        return Response({
            'access': str(nuevo.access_token),
            'refresh': str(nuevo),
        }, status=status.HTTP_200_OK)


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
    search_fields = ['arc_titu', 'arc_año']
    filterset_class = RegistroHistoricoFilter
    ordering_fields = ['arc_fech', 'arc_año', 'arc_codi']
    ordering = ['-arc_fech']

    def get_queryset(self):
        """Solo documentos públicos y activos, con archivos precargados"""
        return RegistroHistorico.objects.filter(
            arc_visw=True,
            arc_acti=True
        ).prefetch_related('archivos').order_by('-arc_fech')

    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Lista de categorías distintas presentes en los registros públicos"""
        cats = self.get_queryset().exclude(arc_cate__isnull=True).exclude(arc_cate='') \
            .values_list('arc_cate', flat=True).distinct().order_by('arc_cate')
        return Response(list(cats))


# ================================================================
# API Privada - Registros (con autenticación)
# ================================================================
class RegistroHistoricoViewSet(AdminWriteMixin, viewsets.ModelViewSet):
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
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['arc_codi', 'arc_titu', 'arc_año']
    filterset_class = RegistroHistoricoFilter
    ordering_fields = ['arc_fech', 'arc_año', 'arc_fechr', 'arc_codi', 'arc_visw']
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

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Conteos totales de registros públicos/privados, calculados en la base de datos"""
        total = RegistroHistorico.objects.count()
        publicos = RegistroHistorico.objects.filter(arc_visw=True).count()
        return Response({'total': total, 'publicos': publicos, 'privados': total - publicos})

    @action(detail=False, methods=['get'])
    def categorias(self, request):
        """Lista de categorías distintas presentes en todos los registros"""
        cats = RegistroHistorico.objects.exclude(arc_cate__isnull=True).exclude(arc_cate='') \
            .values_list('arc_cate', flat=True).distinct().order_by('arc_cate')
        return Response(list(cats))


# ================================================================
# ViewSets Auxiliares
# ================================================================
class LocalidadViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Localidad.objects.all()
    serializer_class = LocalidadSerializer
    search_fields = ['loc_codi', 'loc_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['pci_codi']


class ProvinciaViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Provincia.objects.all()
    serializer_class = ProvinciaSerializer
    search_fields = ['pci_codi', 'pci_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class GeneralViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = General.objects.all()
    serializer_class = GeneralSerializer
    search_fields = ['gen_codi', 'gen_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class ParroquiaViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Parroquia.objects.filter(par_acti=True)
    serializer_class = ParroquiaSerializer
    search_fields = ['par_codi', 'par_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]


class SacerdoteViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Sacerdote.objects.filter(sac_acti=True)
    serializer_class = SacerdoteSerializer
    search_fields = ['sac_codi', 'sac_nomb']
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['par_codi']


class ArchivoAdjuntoViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = ArchivoAdjunto.objects.all()
    serializer_class = ArchivoAdjuntoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['registro', 'tipo']
    search_fields = ['nombre', 'descripcion']


# ================================================================
# Descarga protegida de archivos adjuntos
# ================================================================
# Tipos que el navegador puede mostrar sin riesgo; el resto (html, svg, etc.) se fuerza
# a descarga para que un archivo subido nunca ejecute código dentro del sitio.
TIPOS_INLINE = {'application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'}


@require_GET
def ver_archivo(request, pk):
    """
    GET /api/archivos/<id>/ver/?t=<token>

    Los adjuntos no se sirven desde /media/: pasan por acá para controlar el acceso.
    - Registro público y activo: cualquiera puede verlo.
    - Registro privado: exige el token firmado que solo reciben usuarios logueados
      (ver ArchivoAdjuntoSerializer) y que vence a las ARCHIVO_URL_MAX_AGE segundos.
    Responde 404 (no 403) para no revelar qué archivos existen.
    """
    archivo = get_object_or_404(ArchivoAdjunto.objects.select_related('registro'), pk=pk)
    registro = archivo.registro

    if not (registro.arc_visw and registro.arc_acti):
        try:
            token_pk = signing.loads(
                request.GET.get('t', ''),
                salt=ARCHIVO_SIGNING_SALT,
                max_age=settings.ARCHIVO_URL_MAX_AGE,
            )
        except signing.BadSignature:  # incluye SignatureExpired
            raise Http404
        if token_pk != archivo.pk:
            raise Http404

    nombre = archivo.nombre or posixpath.basename(archivo.archivo.name)
    content_type = mimetypes.guess_type(archivo.archivo.name)[0] or 'application/octet-stream'

    if settings.MEDIA_X_ACCEL:
        # Producción: nginx entrega el archivo desde una location "internal"
        response = HttpResponse(content_type=content_type)
        response['X-Accel-Redirect'] = '/protected-media/' + quote(archivo.archivo.name)
    else:
        try:
            response = FileResponse(archivo.archivo.open('rb'), content_type=content_type)
        except FileNotFoundError:
            raise Http404

    response['Content-Disposition'] = content_disposition_header(content_type not in TIPOS_INLINE, nombre)
    response['X-Content-Type-Options'] = 'nosniff'
    response['Cache-Control'] = 'private, no-store'
    return response
