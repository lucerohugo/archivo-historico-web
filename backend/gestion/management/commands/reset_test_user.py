from django.core.management.base import BaseCommand
from gestion.models import Login
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = 'Crea o reinicia un usuario de prueba'

    def handle(self, *args, **options):
        # Eliminar usuario existente si existe
        Login.objects.filter(log_usua='hugo').delete()
        
        # Crear nuevo usuario
        usuario = Login.objects.create(
            log_usua='hugo',
            log_clav=make_password('hugo123'),
            log_rol=Login.ADMIN,
            log_acti=True
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'✓ Usuario "{usuario.log_usua}" creado exitosamente')
        )
        self.stdout.write(f'  Usuario: hugo')
        self.stdout.write(f'  Contraseña: hugo123')
