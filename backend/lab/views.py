from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side
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
    Vista para generar un reporte técnico profesional en una sola hoja.
    """
    project_id = request.data.get('project')
    start_date = request.data.get('start_date')
    end_date = request.data.get('end_date')
    conclusions = request.data.get('technical_observations', '')

    project = get_object_or_404(Project, id=project_id)
    
    # Filtrar datos técnicos
    essays = Ensayo.objects.filter(project=project, date__range=[start_date, end_date]).order_by('date')
    visits = Visit.objects.filter(project=project, date__range=[start_date, end_date]).order_by('date')

    # Crear Excel
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "INFORME TÉCNICO"

    # Estilos Profesionales
    title_font = Font(name='Arial', bold=True, size=16, color="000000")
    header_font = Font(name='Arial', bold=True, size=11, color="FFFFFF")
    label_font = Font(name='Arial', bold=True, size=10)
    base_font = Font(name='Arial', size=10)
    
    header_fill = openpyxl.styles.PatternFill(start_color="333333", end_color="333333", fill_type="solid")
    section_fill = openpyxl.styles.PatternFill(start_color="EEEEEE", end_color="EEEEEE", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin'), 
        right=Side(style='thin'), 
        top=Side(style='thin'), 
        bottom=Side(style='thin')
    )
    
    center_aligned = Alignment(horizontal='center', vertical='center')
    left_aligned_wrap = Alignment(horizontal='left', vertical='top', wrap_text=True)

    # 1. TÍTULO PRINCIPAL (A1:G1)
    ws.merge_cells('A1:G1')
    ws['A1'] = "INFORME TÉCNICO DE SEGUIMIENTO Y RESULTADOS"
    ws['A1'].font = title_font
    ws['A1'].alignment = center_aligned
    
    # 2. DATOS DEL PROYECTO
    ws['A3'] = "PROYECTO:"
    ws['A3'].font = label_font
    ws['B3'] = project.name
    ws['B3'].font = base_font
    
    ws['A4'] = "CLIENTE:"
    ws['A4'].font = label_font
    ws['B4'] = project.client.name if project.client else "-"
    ws['B4'].font = base_font
    
    ws['E3'] = "FECHA REPORTE:"
    ws['E3'].font = label_font
    ws['F3'] = request.data.get('report_date', '-')
    
    ws['E4'] = "PERIODO:"
    ws['E4'].font = label_font
    ws['F4'] = f"{start_date} AL {end_date}"

    # 3. CONCLUSIONES TÉCNICAS
    ws['A6'] = "CONCLUSIONES Y OBSERVACIONES TÉCNICAS"
    ws.merge_cells('A6:G6')
    ws['A6'].font = header_font
    ws['A6'].fill = header_fill
    ws['A6'].alignment = center_aligned
    
    ws.merge_cells('A7:G11')
    ws['A7'] = conclusions
    ws['A7'].alignment = left_aligned_wrap
    ws['A7'].border = thin_border
    for row in ws.iter_rows(min_row=7, max_row=11, min_col=1, max_col=7):
        for cell in row:
            cell.border = thin_border

    # 4. TABLA DE ENSAYOS (Sección Laboratorio)
    current_row = 13
    ws.cell(row=current_row, column=1, value="RESULTADOS DE LABORATORIO / ENSAYOS").font = label_font
    ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=7)
    ws.cell(row=current_row, column=1).fill = section_fill
    
    current_row += 1
    headers = ["CÓDIGO", "FECHA", "DESCRIPCIÓN TÉCNICA", "PUNTAJE", "CONCLUSIÓN"]
    col_widths = [15, 12, 40, 10, 40]
    for i, h in enumerate(headers, 1):
        cell = ws.cell(row=current_row, column=i)
        cell.value = h
        cell.font = header_font
        cell.fill = header_fill
        cell.border = thin_border
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = col_widths[i-1]
    
    current_row += 1
    for e in essays:
        ws.cell(row=current_row, column=1, value=e.code).border = thin_border
        ws.cell(row=current_row, column=2, value=str(e.date)).border = thin_border
        ws.cell(row=current_row, column=3, value=e.description).border = thin_border
        ws.cell(row=current_row, column=4, value=e.final_score).border = thin_border
        ws.cell(row=current_row, column=5, value=e.conclusion).border = thin_border
        current_row += 1

    # 5. TABLA DE VISITAS (Agenda)
    current_row += 2
    ws.cell(row=current_row, column=1, value="AGENDA DE VISITAS Y ACTIVIDADES DE CAMPO").font = label_font
    ws.merge_cells(start_row=current_row, start_column=1, end_row=current_row, end_column=7)
    ws.cell(row=current_row, column=1).fill = section_fill
    
    current_row += 1
    headers_v = ["FECHA", "HORA", "TIPO", "OBJETIVO", "STATUS"]
    for i, h in enumerate(headers_v, 1):
        cell = ws.cell(row=current_row, column=i)
        cell.value = h
        cell.font = header_font
        cell.fill = header_fill
        cell.border = thin_border
    
    current_row += 1
    for v in visits:
        ws.cell(row=current_row, column=1, value=str(v.date)).border = thin_border
        ws.cell(row=current_row, column=2, value=str(v.start_time)[:5]).border = thin_border
        ws.cell(row=current_row, column=3, value=v.visit_type).border = thin_border
        ws.cell(row=current_row, column=4, value=v.objective).border = thin_border
        ws.cell(row=current_row, column=5, value=v.status).border = thin_border
        current_row += 1

    # Guardar en buffer
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    filename = f"Informe_Tecnico_{project.name.replace(' ', '_')}_{start_date}.xlsx"
    return FileResponse(buffer, as_attachment=True, filename=filename)
