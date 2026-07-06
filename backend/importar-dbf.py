import os
import sys
import django
from dbfread import DBF
from pathlib import Path

# =========================
# CONFIG DJANGO
# =========================
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from gestion.models import RegistroHistorico

# =========================
# ARCHIVO DBF
# =========================
DBF_FILE = Path(__file__).resolve().parent / "dbf" / "arch.dbf"

# =========================
# MAPEO DBF -> DJANGO
# =========================
FIELD_MAP = {
    "arc_codi": "arc_codi",
    "arc_titu": "arc_titu",
    "arc_desc": "arc_desc",
    "arc_oriC": "arc_orig",
    "arc_ano": "arc_año",
    "arc_prot": "arc_npro",
    "arc_fecR": "arc_fech",
    "arc_fech": "arc_fechE",
    "arc_cate": "arc_cate",
    "art_tema": "arc_tema",
    "arc_asun": "arc_asun",
    "arc_inic": "arc_inic",
    "arc_dest": "arc_dest",
    "arc_grup": "arc_grup",
    "arc_gruS": "arc_seri",
    "arc_mate": "arc_sopo",
    "arc_area": "arc_area",
    "arc_esta": "arc_esta",
    "arc_caja": "arc_caja",
    "arc_lega": "arc_lega",
    "arc_nume": "arc_nume",
    "arc_foli": "arc_foli",
    "arc_hoja": "arc_hoja",
    "arc_cari": "arc_cari",
    "arc_medi": "arc_medi",
    "arc_ubSe": "arc_ubsa",
    "arc_ubEs": "arc_estan",
    "arc_ubPa": "arc_pasi",
    "arc_ubCa": "arc_casi",
    "arc_obse": "arc_obse",
    "arc_conA": "arc_conA",
    "arc_conR": "arc_conR",
    "arc_leng": "arc_leng",
    "arc_lugD": "arc_lugD",
    "arc_orco": "arc_orco",
}

IGNORE_FIELDS = {
    "arc_anod",
    "arc_anoh",
    "arc_meta",
    "arc_obs2",
    "arc_arch",
    "arc_ima1",
    "arc_ima2",
    "arc_ima3",
    "arc_ima4",
    "arc_ima5",
    "arc_ima6",
}

# =========================
# FIX TEXTO (acentos / ñ / �)
# =========================
def fix_text(value):
    if isinstance(value, bytes):
        value = value.decode("latin1", errors="ignore")

    if isinstance(value, str):
        value = value.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")

        # arreglar caracter roto
        value = value.replace("�", "Á")  # fallback general

        # arreglos comunes DBF
        value = (
            value.replace("Ã¡", "á")
                 .replace("Ã©", "é")
                 .replace("Ã­", "í")
                 .replace("Ã³", "ó")
                 .replace("Ãº", "ú")
                 .replace("Ã±", "ñ")
                 .replace("Ã", "Ñ")
        )

    return value

# =========================
# BOOLEAN FIX
# =========================
def fix_bool(value):
    if value in [1, "1", "S", "s", True, "T"]:
        return True
    return False

# =========================
# IMPORTACIÓN
# =========================
def importar():
    table = DBF(
    DBF_FILE,
    encoding="latin1",
    ignore_missing_memofile=True
)

    contador = 0

    for row in table:
        data = {}

        for dbf_field, value in row.items():

            if dbf_field in IGNORE_FIELDS:
                continue

            if dbf_field not in FIELD_MAP:
                continue

            django_field = FIELD_MAP[dbf_field]

            # limpiar texto
            value = fix_text(value)

            # boolean especial
            if dbf_field == "arc_orco":
                value = fix_bool(value)

            data[django_field] = value

        # =========================
        # INSERT / UPDATE
        # =========================
        obj, created = RegistroHistorico.objects.update_or_create(
            arc_codi=data.get("arc_codi"),
            defaults=data
        )

        contador += 1
        print(f"{'CREADO' if created else 'ACTUALIZADO'}: {obj.arc_codi}")

    print(f"\n✔ Importación finalizada: {contador} registros")

# =========================
# RUN
# =========================
if __name__ == "__main__":
    importar()