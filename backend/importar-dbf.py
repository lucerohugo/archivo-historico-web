import os
import django
from datetime import date
from dbfread import DBF

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from gestion.models import RegistroHistorico


# --------------------------
# UBICACIÓN DEL DBF
# --------------------------

DBF_FILE = os.path.join(
    os.path.dirname(__file__),
    "dbf",
    "arch.dbf"
)


# --------------------------
# CORREGIR CARACTERES
# --------------------------

REEMPLAZOS = {
    "�": "Ó",
    "�A": "Á",
    "�E": "É",
    "�I": "Í",
    "�O": "Ó",
    "�U": "Ú",
    "�N": "Ñ",
}


def limpiar(valor):

    if valor is None:
        return None

    valor = str(valor).strip()

    if valor == "":
        return None

    try:
        valor = valor.encode("latin1").decode("cp1252")
    except:
        pass

    for viejo, nuevo in REEMPLAZOS.items():
        valor = valor.replace(viejo, nuevo)

    return valor


# --------------------------
# FECHAS
# --------------------------

def fecha(valor):

    if valor in (None, "", "00000000"):
        return None

    if isinstance(valor, date):
        return valor

    return None


# --------------------------
# BOOLEANO
# --------------------------

def booleano(valor):

    if valor is None:
        return False

    valor = str(valor).strip().upper()

    return valor in (
        "S",
        "SI",
        "Y",
        "YES",
        "1",
        "T",
        "TRUE",
        "O",
        "ORIGINAL",
    )


print("Leyendo DBF...")

tabla = DBF(
    DBF_FILE,
    load=True,
    char_decode_errors="ignore"
)

cantidad = 0

for fila in tabla:

    RegistroHistorico.objects.update_or_create(

        arc_codi=fila["ARC_CODI"],

        defaults={

            "arc_titu": limpiar(fila["ARC_TITU"]),
            "arc_desc": limpiar(fila["ARC_DESC"]),

            "arc_orig": limpiar(fila["ARC_ORIC"]),
            "arc_año": fila["ARC_ANO"],
            "arc_npro": limpiar(fila["ARC_PROT"]),

            # IMPORTANTE
            "arc_fech": fecha(fila["ARC_FECR"]),
            "arc_fechE": fecha(fila["ARC_FECH"]),

            "arc_cate": limpiar(fila["ARC_CATE"]),
            "arc_tema": limpiar(fila["ART_TEMA"]),
            "arc_asun": limpiar(fila["ARC_ASUN"]),
            "arc_inic": limpiar(fila["ARC_INIC"]),
            "arc_dest": limpiar(fila["ARC_DEST"]),

            "arc_grup": limpiar(fila["ARC_GRUP"]),
            "arc_seri": limpiar(fila["ARC_GRUS"]),

            "arc_sopo": limpiar(fila["ARC_MATE"]),
            "arc_area": limpiar(fila["ARC_AREA"]),
            "arc_esta": limpiar(fila["ARC_ESTA"]),

            "arc_caja": limpiar(fila["ARC_CAJA"]),
            "arc_lega": limpiar(fila["ARC_LEGA"]),
            "arc_nume": limpiar(fila["ARC_NUME"]),
            "arc_foli": limpiar(fila["ARC_FOLI"]),
            "arc_hoja": limpiar(fila["ARC_HOJA"]),
            "arc_cari": limpiar(fila["ARC_CARI"]),
            "arc_medi": limpiar(fila["ARC_MEDI"]),

            "arc_ubsa": limpiar(fila["ARC_UBSE"]),
            "arc_estan": limpiar(fila["ARC_UBES"]),
            "arc_pasi": limpiar(fila["ARC_UBPA"]),
            "arc_casi": limpiar(fila["ARC_UBCA"]),

            "arc_obse": limpiar(fila["ARC_OBSE"]),

            "arc_conA": limpiar(fila["ARC_CONA"]),
            "arc_conR": limpiar(fila["ARC_CONR"]),

            "arc_leng": limpiar(fila["ARC_LENG"]),

            "arc_lugD": limpiar(fila["ARC_LUGD"]),

            "arc_orco": booleano(fila["ARC_ORCO"]),

        },
    )

    cantidad += 1

print(f"Se importaron {cantidad} registros correctamente.")