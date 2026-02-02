#!/usr/bin/env bash
set -o errexit

cd backend

# Forzamos la instalación de gunicorn junto con el resto
pip install -r requirements.txt
pip install gunicorn

python manage.py collectstatic --no-input
python manage.py migrate