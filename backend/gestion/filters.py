import django_filters
from .models import RegistroHistorico


class RegistroHistoricoFilter(django_filters.FilterSet):
    arc_año_min = django_filters.NumberFilter(field_name='arc_año', lookup_expr='gte')
    arc_año_max = django_filters.NumberFilter(field_name='arc_año', lookup_expr='lte')
    arc_fech_desde = django_filters.DateFilter(field_name='arc_fech', lookup_expr='gte')
    arc_fech_hasta = django_filters.DateFilter(field_name='arc_fech', lookup_expr='lte')

    class Meta:
        model = RegistroHistorico
        fields = [
            'arc_año_min', 'arc_año_max',
            'arc_fech_desde', 'arc_fech_hasta',
            'arc_cate', 'arc_tema', 'arc_parroquia',
        ]
