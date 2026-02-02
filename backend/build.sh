#!/usr/bin/env bash
set -o errexit

cd backend

# Forzamos la instalación de gunicorn junto con el resto
pip install -r requirements.txt
pip install gunicorn

python manage.py collectstatic --no-input
python manage.py migrate
# Crear superusuario automáticamente si no existe
# La contraseña quedará como 'admin123' temporalmente (puedes cambiarla luego)
echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
if not User.objects.filter(username='admin').exists(): \
    User.objects.create_superuser('admin', 'jmaldonado2378@gmail.com', 'admin123')" \
| python manage.py shell