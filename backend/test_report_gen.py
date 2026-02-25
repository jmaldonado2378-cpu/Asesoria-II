import os
import django
import sys

# Configurar entorno Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from lab.views import generar_informe_tecnico_estandar
from lab.models import Project
from rest_framework.test import APIRequestFactory
import io

def test_pdf_generation():
    factory = APIRequestFactory()
    project = Project.objects.first()
    if not project:
        print("No hay proyectos en la DB para testear.")
        return

    data = {
        'project': project.id,
        'start_date': '2020-01-01',
        'end_date': '2030-01-01',
        'technical_observations': 'Test de depuración',
        'format': 'pdf',
        'save_to_history': False
    }

    print(f"Testeando generación de PDF para Proyecto: {project.name} (ID: {project.id})...")
    request = factory.post('/api/generar-informe-tecnico-estandar/', data, format='json')
    response = generar_informe_tecnico_estandar(request)
    
    if response.status_code == 200:
        print("✅ ÉXITO: Reporte PDF generado correctamente.")
        # Guardar para inspección manual
        with open('test_output.pdf', 'wb') as f:
            for chunk in response.streaming_content:
                f.write(chunk)
        print("Archivo guardado como 'test_output.pdf'")
    else:
        print(f"❌ FALLO: Código {response.status_code}")
        print(f"Error: {response.data}")

if __name__ == "__main__":
    test_pdf_generation()
