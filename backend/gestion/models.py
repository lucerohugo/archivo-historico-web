from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password


# ================================================================
# Provincia
# ================================================================
class Provincia(models.Model):
    pci_codi = models.IntegerField(primary_key=True, editable=True)
    pci_nomb = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Provincia"
        verbose_name_plural = "Provincias"
        ordering = ["pci_nomb"]

    def __str__(self):
        return self.pci_nomb


# ================================================================
# Localidad
# ================================================================
class Localidad(models.Model):
    loc_codi = models.IntegerField(primary_key=True, editable=True)
    loc_nomb = models.CharField(max_length=100)
    loc_cpos = models.IntegerField(blank=True, null=True, help_text="Código postal")
    pci_codi = models.ForeignKey(Provincia, on_delete=models.PROTECT, related_name="localidades")

    class Meta:
        verbose_name = "Localidad"
        verbose_name_plural = "Localidades"
        ordering = ["pci_codi_id", "loc_nomb"]

    def __str__(self):
        return f"{self.loc_nomb} ({self.loc_cpos})" if self.loc_cpos else self.loc_nomb


# ================================================================
# General
# ================================================================
class General(models.Model):
    """Datos generales de la empresa"""
    gen_codi = models.IntegerField(primary_key=True, editable=True)
    gen_nomb = models.CharField(max_length=150, blank=True, help_text="Nombre de la empresa")
    gen_logo = models.ImageField(upload_to='logos/', blank=True, null=True, help_text="Logo de Centro Motos")
    gen_loge = models.ImageField(upload_to='logos/', blank=True, null=True, help_text="Logo de BrixSoft")

    class Meta:
        verbose_name = "General"
        verbose_name_plural = "General"

    def __str__(self):
        return self.gen_nomb



class Parroquia(models.Model):
    """Modelo para gestionar parroquias"""
    par_codi = models.CharField(max_length=10, unique=True, primary_key=True)
    par_nomb = models.CharField(max_length=100)
    par_desc = models.TextField(blank=True, null=True)
    par_ubi = models.CharField(max_length=255, blank=True, null=True)
    par_acti = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Parroquia"
        verbose_name_plural = "Parroquias"
        ordering = ['par_nomb']
    
    def __str__(self):
        return f"{self.par_codi} - {self.par_nomb}"


class Sacerdote(models.Model):
    """Modelo para gestionar sacerdotes"""
    sac_codi = models.CharField(max_length=10, unique=True, primary_key=True)
    sac_nomb = models.CharField(max_length=100)
    par_codi = models.ForeignKey(Parroquia, on_delete=models.SET_NULL, null=True, blank=True)
    sac_acti = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Sacerdote"
        verbose_name_plural = "Sacerdotes"
        ordering = ['sac_nomb']
    
    def __str__(self):
        return f"{self.sac_codi} - {self.sac_nomb}"


class RegistroHistorico(models.Model):
    """Modelo para gestionar registros históricos del archivo"""
    
    # Datos principales
    arc_codi = models.AutoField(primary_key=True)
    arc_fech = models.DateField(verbose_name="Fecha",blank=True, null=True)
    arc_titu = models.CharField(max_length=255, verbose_name="Título", blank=True, null=True)
    arc_desc = models.TextField(verbose_name="Descripción", blank=True, null=True)
    
    # Referencias y clasificación
    arc_orig = models.CharField(max_length=100, verbose_name="Origen", blank=True, null=True)
    arc_cate = models.CharField(max_length=100, verbose_name="Categoría", blank=True, null=True)
    
    # Numeración y fechas
    arc_año = models.IntegerField(
        verbose_name="Año",
        validators=[MinValueValidator(1500)],
        blank=True,
        null=True
    )
    arc_npro = models.CharField(max_length=50, verbose_name="Número Protocolar", blank=True, null=True)
    arc_fechE = models.DateField(verbose_name="Fecha Exacta", null=True)
    arc_seg = models.CharField(max_length=50, verbose_name="Segmento", blank=True, null=True)
    
    # Asunto y alcances
    arc_tema = models.CharField(max_length=100, verbose_name="Tema", blank=True, null=True)
    arc_area = models.CharField(max_length=100, verbose_name="Área", blank=True, null=True)
    arc_asun = models.CharField(max_length=255, verbose_name="Asunto", blank=True, null=True)
    arc_inic = models.CharField(max_length=255, verbose_name="Iniciador", blank=True, null=True)
    arc_dest = models.CharField(max_length=255, verbose_name="Destinatario", blank=True, null=True)
    
    # Grupos y series
    arc_grup = models.CharField(max_length=100, verbose_name="Grupo", blank=True, null=True)
    arc_seri = models.CharField(max_length=100, verbose_name="Serie", blank=True, null=True)
    arc_sser = models.CharField(max_length=100, verbose_name="Subserie", blank=True, null=True)
    
    # Conservacion y ubicacion
    arc_sopo = models.CharField(max_length=100, verbose_name="Soporte", blank=True, null=True)
    arc_esta = models.CharField(max_length=100, verbose_name="Estado", blank=True, null=True)
    arc_conA = models.CharField(max_length=255, verbose_name="Condicion de Acceso", blank=True, null=True)
    arc_conR = models.CharField(max_length=255, verbose_name="Condicion de Reproducción", blank=True, null=True)
    arc_leng = models.CharField(max_length=50, verbose_name="Lengua", blank=True, null=True)
    arc_orco = models.BooleanField(verbose_name="Original/Copia", default=True)
    arc_lugD = models.CharField(max_length=255, verbose_name="Lugar Destino", blank=True, null=True)
    
    # Ubicacion 
    arc_ubsa = models.CharField(max_length=100, verbose_name="Ubicación Sala", blank=True, null=True)
    arc_pasi = models.CharField(max_length=100, verbose_name="Pasillo", blank=True, null=True)
    arc_estan = models.CharField(max_length=100, verbose_name="Estanteria", blank=True, null=True)
    arc_casi = models.CharField(max_length=100, verbose_name="Casillero", blank=True, null=True)
    arc_caja = models.CharField(max_length=100, verbose_name="Caja Numero", blank=True, null=True)
    
    # Numeracion de documentos
    arc_lega = models.CharField(max_length=100, verbose_name="Legajo", blank=True, null=True)
    arc_nume = models.CharField(max_length=100, verbose_name="Numero", blank=True, null=True)
    arc_foli = models.CharField(max_length=100, verbose_name="Folios", blank=True, null=True)
    arc_hoja = models.CharField(max_length=100, verbose_name="Hoja", blank=True, null=True)
    arc_cari = models.CharField(max_length=100, verbose_name="Carillas", blank=True, null=True)
    arc_medi = models.CharField(max_length=100, verbose_name="Medidas", blank=True, null=True)
    
    # Metadata
    # arc_meta = models.TextField(verbose_name="Metadata", blank=True, null=True)
    
    # Observaciones
    arc_obse = models.TextField(verbose_name="Nota Archivero", blank=True, null=True)
    
    # Relaciones
    arc_parroquia = models.ForeignKey(
        Parroquia,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Parroquia"
    )
    arc_sacerdote = models.ForeignKey(
        Sacerdote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Sacerdote"
    )
    
    # Control
    arc_fechr= models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Registro")
    arc_fechm = models.DateTimeField(auto_now=True, verbose_name="Fecha Modificacion")
    arc_exp = models.BooleanField( #muestra si el registro fue enviado o no
        default=False,
        help_text="Indica si el registro fue enviado o no"
    )
    arc_visw = models.BooleanField(
        default=True,
        verbose_name="Visible al público",
        help_text="Si está desmarcado, solo usuarios logueados pueden verlo"
    )
    arc_acti = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Registro Histórico"
        verbose_name_plural = "Registros Históricos"
        ordering = ['-arc_fech']
        indexes = [
            models.Index(fields=['arc_año']),
            models.Index(fields=['arc_tema']),
            models.Index(fields=['arc_cate']),
            models.Index(fields=['arc_parroquia']),
        ]
    
    def __str__(self):
        return f"{self.arc_codi} - {self.arc_titu}"


# ================================================================
# Archivo Adjunto
# ================================================================
class ArchivoAdjunto(models.Model):
    """Modelo para almacenar archivos adjuntos a registros históricos"""
    
    registro = models.ForeignKey(
        RegistroHistorico,
        on_delete=models.CASCADE,
        related_name='archivos',
        verbose_name="Registro"
    )
    archivo = models.FileField(
        upload_to='registros/%Y/%m/%d/',
        verbose_name="Archivo"
    )
    nombre = models.CharField(
        max_length=255,
        verbose_name="Nombre del archivo",
        blank=True
    )
    tipo = models.CharField(
        max_length=50,
        verbose_name="Tipo de archivo",
        choices=[
            ('pdf', 'PDF'),
            ('imagen', 'Imagen'),
            ('documento', 'Documento'),
            ('otro', 'Otro'),
        ],
        default='otro'
    )
    fecha_carga = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de carga"
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name="Descripción"
    )
    
    class Meta:
        verbose_name = "Archivo Adjunto"
        verbose_name_plural = "Archivos Adjuntos"
        ordering = ['-fecha_carga']
    
    def __str__(self):
        return f"{self.nombre} - {self.registro.arc_codi}"


# ================================================================
# Login - Modelo personalizado de usuario
# ================================================================
class Login(models.Model):
    """Modelo personalizado para autenticación de usuarios"""
    log_codi = models.AutoField(primary_key=True)
    log_usua = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Usuario"
    )
    log_clav = models.CharField(
        max_length=255,
        verbose_name="Contraseña"
    )
    log_acti = models.BooleanField(
        default=True,
        verbose_name="Activo"
    )
    log_fech = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de creación"
    )
    log_fechm = models.DateTimeField(
        auto_now=True,
        verbose_name="Fecha de modificación"
    )
    
    class Meta:
        verbose_name = "Usuario del Archivo"
        verbose_name_plural = "Usuarios del Archivo"
        ordering = ['-log_fech']
    
    def __str__(self):
        return self.log_usua
    
    def set_password(self, raw_password):
        """Hashea y almacena la contraseña"""
        self.log_clav = make_password(raw_password)
    
    def check_password(self, raw_password):
        """Verifica la contraseña contra el hash almacenado"""
        return check_password(raw_password, self.log_clav)
