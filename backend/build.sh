# --- FRONTEND BUILD ---
echo ">>> Iniciando construcción de Frontend (React/Vite)..."
cd frontend
npm install
npm run build
cd ..

# --- BACKEND BUILD ---
echo ">>> Iniciando construcción de Backend (Django)..."
cd backend

# Forzamos la instalación de gunicorn junto con el resto
pip install -r requirements.txt
pip install gunicorn

python manage.py collectstatic --no-input
python manage.py makemigrations
python manage.py migrate

# Crear o actualizar superusuario
echo "from django.contrib.auth import get_user_model; \
User = get_user_model(); \
username = 'joseadmin'; \
email = 'jmaldonado2378@gmail.com'; \
password = 'admin123'; \
u, created = User.objects.get_or_create(username=username, defaults={'email': email}); \
u.set_password(password); \
u.is_superuser = True; \
u.is_staff = True; \
u.save(); \
status = 'CREADO' if created else 'ACTUALIZADO'; \
print(f'>>> Superusuario {username} {status} con exito')" | python manage.py shell