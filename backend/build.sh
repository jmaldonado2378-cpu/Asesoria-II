#!/usr/bin/env bash
set -o errexit

# Entrar a la carpeta donde está el código real
cd backend

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate