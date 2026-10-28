import re
import xml.etree.ElementTree as ET
from datetime import date

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from gestion.models import RegistroHistorico

NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}


def limpiar(valor):
    """Mismo criterio que importar-dbf.py: sin espacios sobrantes y en MAYÚSCULAS"""
    if valor is None:
        return None
    valor = re.sub(r'\s+', ' ', valor).strip()
    return valor.upper() if valor else None


def fecha(valor):
    """
    Las fechas del WordPress vienen mayormente como D/M/AAAA, pero algunas
    se cargaron como M/D/AAAA (ej: 1/13/1817). Solo se aceptan fechas completas.
    """
    m = re.fullmatch(r'(\d{1,2})/(\d{1,2})/(\d{4})', (valor or '').strip())
    if not m:
        return None
    dia, mes, anio = int(m[1]), int(m[2]), int(m[3])
    if mes > 12 and dia <= 12:
        dia, mes = mes, dia
    try:
        return date(anio, mes, dia)
    except ValueError:
        return None


def anio(valor):
    valor = (valor or '').strip()
    return int(valor) if re.fullmatch(r'\d{4}', valor) and int(valor) >= 1500 else None


def clave(npro, caja, legajo, folio):
    return (str(npro or ''), str(caja or ''), str(legajo or ''), (folio or '').strip().upper())


class Command(BaseCommand):
    help = (
        'Importa los documentos del export de WordPress (WXR). Los que ya existen '
        '(mismo N° protocolar, caja, legajo y folio) solo completan campos vacíos.'
    )

    def add_arguments(self, parser):
        parser.add_argument('archivo', help='Ruta al .xml exportado de WordPress')
        parser.add_argument(
            '--aplicar', action='store_true',
            help='Graba los cambios. Sin esta opción solo muestra lo que haría.'
        )

    def leer_posts(self, ruta):
        try:
            raiz = ET.parse(ruta).getroot()
        except (OSError, ET.ParseError) as e:
            raise CommandError(f'No se pudo leer {ruta}: {e}')

        for item in raiz.findall('channel/item'):
            if item.findtext('wp:post_type', namespaces=NS) != 'post':
                continue
            if item.findtext('wp:status', namespaces=NS) != 'publish':
                continue
            meta = {
                m.findtext('wp:meta_key', namespaces=NS): (m.findtext('wp:meta_value', namespaces=NS) or '').strip()
                for m in item.findall('wp:postmeta', NS)
            }
            codigo = (item.findtext('title') or '').strip()   # ej: 01-0101
            categorias = [c.text for c in item.findall('category') if c.get('domain') == 'category' and c.text]
            etiquetas = [c.text for c in item.findall('category') if c.get('domain') == 'post_tag' and c.text]
            npro = codigo.split('-')[0].lstrip('0') if '-' in codigo else None

            datos = {
                'arc_titu': limpiar(item.findtext('excerpt:encoded', namespaces=NS)),
                'arc_desc': limpiar(meta.get('contenido')),
                'arc_orig': limpiar(meta.get('fondo')),
                'arc_area': limpiar(', '.join(categorias)),
                'arc_npro': npro,
                'arc_año': anio(meta.get('ano')),
                'arc_fechE': fecha(meta.get('fecha')),
                'arc_fini': limpiar(meta.get('fecha_inicial')),
                'arc_ffin': limpiar(meta.get('fecha_final')),
                'arc_inic': limpiar(meta.get('iniciador')),
                'arc_dest': limpiar(meta.get('destinatario')),
                'arc_obse': limpiar(meta.get('observaciones')),
                'arc_caja': limpiar(meta.get('caja')),
                'arc_lega': limpiar(meta.get('legajo')),
                'arc_foli': limpiar(meta.get('folio')),
                'arc_hoja': limpiar(meta.get('cantidad_de_folios')),
                'arc_pcla': limpiar(', '.join(etiquetas)),
            }
            # Si no hay fecha completa, el año puede venir en el campo fecha
            if datos['arc_año'] is None:
                datos['arc_año'] = anio(meta.get('fecha')) or (datos['arc_fechE'].year if datos['arc_fechE'] else None)

            for campo, valor in datos.items():
                max_len = RegistroHistorico._meta.get_field(campo).max_length
                if max_len and isinstance(valor, str) and len(valor) > max_len:
                    self.stdout.write(self.style.WARNING(f'  {codigo}: {campo} truncado a {max_len} caracteres'))
                    datos[campo] = valor[:max_len]

            yield codigo, datos

    def handle(self, *args, **options):
        aplicar = options['aplicar']

        existentes = {}
        usados = set()
        for r in RegistroHistorico.objects.order_by('arc_codi'):
            existentes.setdefault(clave(r.arc_npro, r.arc_caja, r.arc_lega, r.arc_foli), []).append(r)

        creados, actualizados, sin_cambios = [], 0, 0
        completados = {}
        conflictos, ambiguos = [], []

        with transaction.atomic():
            for codigo, datos in self.leer_posts(options['archivo']):
                k = clave(datos['arc_npro'], datos['arc_caja'], datos['arc_lega'], datos['arc_foli'])

                candidatos = [r for r in existentes.get(k, []) if r.arc_codi not in usados]
                # Hay documentos distintos con la misma caja/legajo/folio: se desempata por título,
                # y si también coincide el título se toman en orden de carga
                if len(existentes.get(k, [])) > 1:
                    candidatos = [r for r in candidatos if limpiar(r.arc_titu) == datos['arc_titu']]
                    if not candidatos:
                        ambiguos.append(codigo)
                        continue

                registro = candidatos[0] if candidatos else None
                if registro is not None:
                    usados.add(registro.arc_codi)
                if registro is None:
                    creados.append(codigo)
                    if aplicar:
                        RegistroHistorico.objects.create(**datos)
                    continue

                cambios = []
                for campo, valor in datos.items():
                    if valor in (None, ''):
                        continue
                    actual = getattr(registro, campo)
                    if actual in (None, ''):
                        setattr(registro, campo, valor)
                        cambios.append(campo)
                        completados[campo] = completados.get(campo, 0) + 1
                    elif campo == 'arc_fechE' and actual != valor:
                        conflictos.append((codigo, registro.arc_codi, actual, valor))

                if cambios:
                    actualizados += 1
                    if aplicar:
                        registro.save(update_fields=cambios + ['arc_fechm'])
                else:
                    sin_cambios += 1

            if not aplicar:
                transaction.set_rollback(True)

        self.stdout.write('')
        self.stdout.write(f'Registros nuevos: {len(creados)}' + (f'  ({", ".join(creados)})' if creados else ''))
        self.stdout.write(f'Registros completados: {actualizados}')
        for campo, n in sorted(completados.items(), key=lambda x: -x[1]):
            self.stdout.write(f'    {campo}: {n}')
        self.stdout.write(f'Sin cambios: {sin_cambios}')

        if ambiguos:
            self.stdout.write(self.style.WARNING(
                f'Omitidos por haber más de un registro con la misma caja/legajo/folio: {", ".join(ambiguos)}'
            ))
        if conflictos:
            self.stdout.write(self.style.WARNING('Fechas distintas (no se modificaron, revisar a mano):'))
            for codigo, arc_codi, actual, nueva in conflictos:
                self.stdout.write(f'    {codigo} (registro {arc_codi}): base {actual} / WordPress {nueva}')

        if aplicar:
            self.stdout.write(self.style.SUCCESS('✓ Cambios grabados'))
        else:
            self.stdout.write(self.style.WARNING('Modo prueba: no se grabó nada. Usá --aplicar para guardar.'))
