#!/usr/bin/env bash
set -o errexit

cd backend

# Forzamos la instalación de gunicorn junto con el resto
pip install -r requirements.txt
pip install gunicorn

python manage.py collectstatic --no-input
python manage.py migrate
# Crear o actualizar superusuario
echo "from django.contrib.auth import get_user_model; \
User = get_user_model(); \
u, created = User.objects.get_or_create(username='admin', defaults={'email': 'jmaldonado2378@gmail.com'}); \
u.set_password('admin123'); \
u.is_superuser = True; \
u.is_staff = True; \
u.save(); \
print('>>> Superusuario admin actualizado con exito')" | python manage.py shell