from rest_framework import serializers
from .models import Localidad, Provincia, General, Parroquia, Sacerdote, RegistroHistorico, ArchivoAdjunto, Login


class LocalidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Localidad
        fields = '__all__'


class ProvinciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provincia
        fields = '__all__'


class GeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = General
        fields = '__all__'


class ParroquiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Parroquia
        fields = '__all__'


class SacerdoteSerializer(serializers.ModelSerializer):
    par_codi = ParroquiaSerializer(read_only=True)
    par_codi_id = serializers.PrimaryKeyRelatedField(
        queryset=Parroquia.objects.all(),
        source='par_codi',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Sacerdote
        fields = '__all__'


class ArchivoAdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivoAdjunto
        fields = '__all__'
        read_only_fields = ('fecha_carga',)


class RegistroHistoricoSerializer(serializers.ModelSerializer):
    arc_parroquia = ParroquiaSerializer(read_only=True)
    arc_parroquia_id = serializers.PrimaryKeyRelatedField(
        queryset=Parroquia.objects.all(),
        source='arc_parroquia',
        write_only=True,
        required=False
    )
    arc_sacerdote = SacerdoteSerializer(read_only=True)
    arc_sacerdote_id = serializers.PrimaryKeyRelatedField(
        queryset=Sacerdote.objects.all(),
        source='arc_sacerdote',
        write_only=True,
        required=False
    )
    archivos = ArchivoAdjuntoSerializer(many=True, read_only=True)
    
    class Meta:
        model = RegistroHistorico
        fields = '__all__'
        read_only_fields = ('arc_codi', 'arc_fechr', 'arc_fechm', 'archivos')


# ================================================================
# Serializers de Autenticación
# ================================================================
class LoginSerializer(serializers.ModelSerializer):
    """Serializer para el modelo Login"""
    class Meta:
        model = Login
        fields = ('log_codi', 'log_usua', 'log_acti', 'log_fech')
        read_only_fields = ('log_codi', 'log_fech')


class AuthLoginSerializer(serializers.Serializer):
    """Serializer para login con JWT"""
    log_usua = serializers.CharField(required=True)
    log_clav = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        log_usua = data.get('log_usua')
        log_clav = data.get('log_clav')
        
        try:
            usuario = Login.objects.get(log_usua=log_usua, log_acti=True)
        except Login.DoesNotExist:
            raise serializers.ValidationError("Usuario o contraseña inválidos")
        
        if not usuario.check_password(log_clav):
            raise serializers.ValidationError("Usuario o contraseña inválidos")
        
        data['usuario'] = usuario
        return data


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer para registro de nuevos usuarios"""
    log_clav = serializers.CharField(write_only=True, required=True, min_length=6)
    log_usua = serializers.CharField(required=True)
    
    class Meta:
        model = Login
        fields = ('log_usua', 'log_clav')
    
    def validate_log_usua(self, value):
        """Valida que el usuario no exista"""
        if Login.objects.filter(log_usua=value).exists():
            raise serializers.ValidationError("Este usuario ya existe")
        return value
    
    def create(self, validated_data):
        user = Login.objects.create(
            log_usua=validated_data['log_usua']
        )
        user.set_password(validated_data['log_clav'])
        user.save()
        return user
