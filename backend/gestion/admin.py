from django.contrib import admin
from .models import Localidad, Provincia, General, Parroquia, Sacerdote, RegistroHistorico, ArchivoAdjunto, Login


@admin.register(Localidad)
class LocalidadAdmin(admin.ModelAdmin):
    list_display = ['loc_codi', 'loc_nomb', 'pci_codi']
    list_filter = ['pci_codi']
    search_fields = ['loc_codi', 'loc_nomb']
    fieldsets = (
        ('Información Principal', {
            'fields': ('loc_codi', 'loc_nomb', 'pci_codi')
        }),
        ('Detalles', {
            'fields': ('loc_cpos',)
        }),
    )


@admin.register(Provincia)
class ProvinciaAdmin(admin.ModelAdmin):
    list_display = ['pci_codi', 'pci_nomb']
    search_fields = ['pci_codi', 'pci_nomb']
    fieldsets = (
        ('Información Principal', {
            'fields': ('pci_codi', 'pci_nomb')
        }),
    )


@admin.register(General)
class GeneralAdmin(admin.ModelAdmin):
    list_display = ['gen_codi', 'gen_nomb']
    search_fields = ['gen_codi', 'gen_nomb']
    fieldsets = (
        ('Información Principal', {
            'fields': ('gen_codi', 'gen_nomb')
        }),
        ('Logos', {
            'fields': ('gen_logo', 'gen_loge')
        }),
    )


@admin.register(Parroquia)
class ParroquiaAdmin(admin.ModelAdmin):
    list_display = ['par_codi', 'par_nomb', 'par_ubi', 'par_acti']
    list_filter = ['par_acti']
    search_fields = ['par_codi', 'par_nomb']
    fieldsets = (
        ('Información Principal', {
            'fields': ('par_codi', 'par_nomb')
        }),
        ('Detalles', {
            'fields': ('par_desc', 'par_ubi', 'par_acti')
        }),
    )


@admin.register(Sacerdote)
class SacerdoteAdmin(admin.ModelAdmin):
    list_display = ['sac_codi', 'sac_nomb', 'par_codi', 'sac_acti']
    list_filter = ['sac_acti', 'par_codi']
    search_fields = ['sac_codi', 'sac_nomb']
    fieldsets = (
        ('Información Principal', {
            'fields': ('sac_codi', 'sac_nomb')
        }),
        ('Asignación', {
            'fields': ('par_codi', 'sac_acti')
        }),
    )


@admin.register(RegistroHistorico)
class RegistroHistoricoAdmin(admin.ModelAdmin):
    list_display = ['arc_codi', 'arc_titu', 'arc_fech', 'arc_año', 'arc_visw','arc_fechE', 'arc_acti']
    list_filter = ['arc_acti', 'arc_visw', 'arc_año', 'arc_cate', 'arc_tema', 'arc_orig']
    search_fields = ['arc_codi', 'arc_titu', 'arc_desc', 'arc_asun']
    readonly_fields = ['arc_codi', 'arc_fechr', 'arc_fechm']
    date_hierarchy = 'arc_fech'
    
    fieldsets = (
        ('Datos Principales', {
            'fields': ('arc_codi', 'arc_fech', 'arc_titu', 'arc_desc')
        }),
        ('Referencias y Clasificación', {
            'fields': ('arc_orig', 'arc_cate')
        }),
        ('Numeración y Fechas', {
            'fields': ('arc_año', 'arc_npro','arc_fechE', 'arc_seg')
        }),
        ('Asunto y Alcances', {
            'fields': ('arc_tema', 'arc_area', 'arc_asun', 'arc_inic', 'arc_dest')
        }),
        ('Grupos y Series', {
            'fields': ('arc_grup', 'arc_seri', 'arc_sser')
        }),
        ('Conservación y Ubicación', {
            'fields': (
                'arc_sopo', 'arc_esta', 'arc_conA', 'arc_conR',
                'arc_leng', 'arc_orco', 'arc_lugD'
            )
        }),
        ('Ubicación Física', {
            'fields': ('arc_ubsa', 'arc_pasi', 'arc_estan', 'arc_caja')
        }),
        ('Numeración de Documentos', {
            'fields': ('arc_lega', 'arc_nume', 'arc_foli', 'arc_hoja','arc_casi', 'arc_medi')
        }),
        ('Observaciones', {
            'fields': ('arc_obse',)
        }),
        ('Relaciones', {
            'fields': ('arc_parroquia', 'arc_sacerdote')
        }),
        ('Control', {
            'fields': ('arc_fechr', 'arc_fechm', 'arc_exp', 'arc_visw', 'arc_acti'),
            'classes': ('collapse',)
        }),
    )
    
    def get_search_results(self, request, queryset, search_term):
        queryset, use_distinct = super().get_search_results(request, queryset, search_term)
        return queryset, use_distinct


@admin.register(ArchivoAdjunto)
class ArchivoAdjuntoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'registro', 'tipo', 'fecha_carga']
    list_filter = ['tipo', 'fecha_carga', 'registro']
    search_fields = ['nombre', 'descripcion', 'registro__arc_codi']
    readonly_fields = ['fecha_carga']
    fieldsets = (
        ('Información', {
            'fields': ('registro', 'nombre', 'archivo')
        }),
        ('Detalles', {
            'fields': ('tipo', 'descripcion')
        }),
        ('Control', {
            'fields': ('fecha_carga',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Login)
class LoginAdmin(admin.ModelAdmin):
    list_display = ['log_codi', 'log_usua', 'log_rol', 'log_acti', 'log_fech']
    list_filter = ['log_rol', 'log_acti', 'log_fech']
    search_fields = ['log_usua', 'log_codi']
    readonly_fields = ['log_codi', 'log_fech', 'log_fechm']
    fieldsets = (
        ('Información de Usuario', {
            'fields': ('log_codi', 'log_usua', 'log_clav', 'log_rol')
        }),
        ('Estado', {
            'fields': ('log_acti',)
        }),
        ('Control', {
            'fields': ('log_fech', 'log_fechm'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Hashea la contraseña antes de guardar"""
        if 'log_clav' in form.changed_data:
            obj.set_password(form.cleaned_data['log_clav'])
        super().save_model(request, obj, form, change)
