from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from django.template.loader import render_to_string
try:
    from xhtml2pdf import pisa
except ImportError:
    pisa = None
import io
from .models import (
    Client, Project, Ensayo, Ingredient, 
    ProjectIngredientPrice, Visit, EnsayoDetail, EnsayoImage,
    TechnicalReport
)
from .serializers import (
    ClientSerializer, 
    ProjectSerializer, 
    EnsayoSerializer, 
    IngredientSerializer,
    ProjectIngredientPriceSerializer, 
    VisitSerializer,
    EnsayoDetailSerializer,
    EnsayoImageSerializer,
    TechnicalReportSerializer
)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

class EnsayoViewSet(viewsets.ModelViewSet):
    queryset = Ensayo.objects.all().order_by('-date')
    serializer_class = EnsayoSerializer

class EnsayoDetailViewSet(viewsets.ModelViewSet):
    queryset = EnsayoDetail.objects.all()
    serializer_class = EnsayoDetailSerializer

class EnsayoImageViewSet(viewsets.ModelViewSet):
    queryset = EnsayoImage.objects.all()
    serializer_class = EnsayoImageSerializer

class ProjectIngredientPriceViewSet(viewsets.ModelViewSet):
    queryset = ProjectIngredientPrice.objects.all()
    serializer_class = ProjectIngredientPriceSerializer

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all().order_by('-date')
    serializer_class = VisitSerializer

class TechnicalReportViewSet(viewsets.ModelViewSet):
    queryset = TechnicalReport.objects.all().order_by('-report_date', '-created_at')
    serializer_class = TechnicalReportSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

@api_view(['POST'])
def generate_technical_report_view(request):
    """
    Genera un reporte técnico profesional. Soporta formatos Excel (default) y PDF.
    """
    project_id = request.data.get('project')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    conclusions = request.data.get('technical_observations', '')
    requested_format = request.data.get('format', 'excel').lower()

    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Datos técnicos
        essays = Ensayo.objects.filter(project=project, date__range=[start_date, end_date]).order_by('date')
        visits = Visit.objects.filter(project=project, date__range=[start_date, end_date]).order_by('date')

        # Nombre de archivo estandarizado
        client_name = project.client.name.replace(' ', '_') if project.client else "Sin_Cliente"
        proj_name = project.name.replace(' ', '_')
        report_date_str = request.data.get('report_date', timezone.now().strftime('%Y-%m-%d'))
        
        # Preparar datos para inyección dinámica de nombres de harina en ensayos
        essays_data = []
        for e in essays:
            base_flour_detail = e.details.filter(ingredient__is_base_flour=True).first()
            e_data = {
                'code': e.code,
                'date': e.date,
                'base_flour_name': base_flour_detail.ingredient.name if base_flour_detail else "No especificada",
                'description': e.description,
                'final_score': e.final_score,
                'conclusion': e.conclusion
            }
            essays_data.append(e_data)
    except Exception as e:
        return Response({"error": f"Error preparando datos: {str(e)}"}, status=500)

    try:
        if requested_format == 'pdf':
            if pisa is None:
                return Response({"error": "Librería xhtml2pdf no está instalada en el servidor."}, status=500)
                
            context = {
                'project': project,
                'start_date': start_date,
                'end_date': end_date,
                'date': timezone.now(),
                'conclusions': conclusions,
                'essays': essays_data,
                'visits': visits,
            }
            html = render_to_string('reports/gestion_reporte_pdf.html', context)
            buffer = io.BytesIO()
            pisa_status = pisa.CreatePDF(io.BytesIO(html.encode("utf-8")), dest=buffer)
            
            if pisa_status.err:
                return Response({"error": "Error al generar PDF vía xhtml2pdf"}, status=400)
                
            buffer.seek(0)
            filename = f"IT_{client_name}_{proj_name}_{report_date_str}.pdf"
            return FileResponse(buffer, as_attachment=True, filename=filename)

        # --- LÓGICA EXCEL (Mejorada y Corregida) ---
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "INFORME TÉCNICO"

        # Configuración de Página (Valores literales para robustez)
        ws.page_setup.paperSize = 9 # A4
        ws.page_setup.orientation = 'portrait'
        
        # Márgenes seguros
        ws.page_margins.left = 0.3
        ws.page_margins.right = 0.3
        ws.page_margins.top = 0.5
        ws.page_margins.bottom = 0.5

        # Estilos de Alto Nivel
        title_font = Font(name='Arial', bold=True, size=18, color="0F172A")
        sec_title_font = Font(name='Arial', bold=True, size=10, color="FFFFFF")
        label_font = Font(name='Arial', bold=True, size=8, color="64748B")
        value_font = Font(name='Arial', bold=True, size=10, color="1E293B")
        # 1. ENCABEZADO
        ws.cell(row=1, column=1, value="INFORME TÉCNICO DE GESTIÓN")

        # 2. INFORMACIÓN
        ws.cell(row=3, column=1, value="CLIENTE:")
        ws.cell(row=3, column=2, value=str(project.client.name if project.client else "-"))
        ws.cell(row=4, column=1, value="PROYECTO:")
        ws.cell(row=4, column=2, value=str(project.name))
        ws.cell(row=5, column=1, value="FECHA:")
        ws.cell(row=5, column=2, value=str(report_date_str))

        # 3. SECCIONES
        ws.cell(row=7, column=1, value="CONCLUSIONES:")
        ws.cell(row=8, column=1, value=str(conclusions or ''))

        # RESULTADOS
        current_row = 10
        ws.cell(row=current_row, column=1, value="ORDEN")
        ws.cell(row=current_row, column=2, value="FECHA")
        ws.cell(row=current_row, column=3, value="PUNTAJE")
        current_row += 1

        for ed in essays_data:
            ws.cell(row=current_row, column=1, value=str(ed.get('code', '')))
            ws.cell(row=current_row, column=2, value=str(ed.get('date', '')))
            ws.cell(row=current_row, column=3, value=f"{ed.get('final_score',0)}")
            current_row += 1

        # AGENDA
        current_row += 1
        ws.cell(row=current_row, column=1, value="AGENDA")
        current_row += 1
        for v in visits:
            ws.cell(row=current_row, column=1, value=str(v.date))
            ws.cell(row=current_row, column=2, value=str(v.objective))
            current_row += 1

        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        filename = f"IT_{client_name}_{proj_name}_{report_date_str}.xlsx"
        return FileResponse(buffer, as_attachment=True, filename=filename)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(error_details)
        # Devolvemos el traceback completo para ver exactamente qué línea falla en el frontend
        return Response({"error": f"Error en generación final:\n{error_details}"}, status=500)
