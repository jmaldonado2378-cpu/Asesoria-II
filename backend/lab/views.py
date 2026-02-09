from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from django.template.loader import render_to_string
from xhtml2pdf import pisa
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

    if requested_format == 'pdf':
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
            return Response({"error": "Error al generar PDF"}, status=400)
            
        buffer.seek(0)
        filename = f"IT_{client_name}_{proj_name}_{report_date_str}.pdf"
        return FileResponse(buffer, as_attachment=True, filename=filename)

    # --- LÓGICA EXCEL (Mejorada) ---
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "INFORME TÉCNICO"

    # Configuración de Página (A4 Vertical, Márgenes Estrechos)
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = ws.ORIENTATION_PORTRAIT
    ws.page_margins = openpyxl.worksheet.pageutils.PageMargins(left=0.3, right=0.3, top=0.5, bottom=0.5)

    # Estilos de Alto Nivel
    title_font = Font(name='Arial', bold=True, size=18, color="0F172A")
    sec_title_font = Font(name='Arial', bold=True, size=10, color="FFFFFF")
    label_font = Font(name='Arial', bold=True, size=8, color="64748B")
    value_font = Font(name='Arial', bold=True, size=10, color="1E293B")
    table_header_font = Font(name='Arial', bold=True, size=9, color="475569")
    
    header_fill = PatternFill(start_color="475569", end_color="475569", fill_type="solid")
    info_box_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
    
    thin_border = Border(left=Side(style='thin', color="E2E8F0"), 
                         right=Side(style='thin', color="E2E8F0"), 
                         top=Side(style='thin', color="E2E8F0"), 
                         bottom=Side(style='thin', color="E2E8F0"))

    # 1. ENCABEZADO (Logo placeholder y Título)
    ws.merge_cells('A1:B2')
    ws['A1'] = "[ LOGO ]"
    ws['A1'].alignment = Alignment(horizontal='center', vertical='center')
    ws['A1'].fill = PatternFill(start_color="F8FAF6", end_color="F8FAF6", fill_type="solid")
    ws['A1'].font = Font(italic=True, color="94A3B8")

    ws.merge_cells('C1:G2')
    ws['C1'] = "INFORME TÉCNICO DE GESTIÓN"
    ws['C1'].font = title_font
    ws['C1'].alignment = Alignment(horizontal='right', vertical='center')

    # 2. CUADROS DE INFORMACIÓN (Estilo PDF)
    # CLIENTE
    ws.merge_cells('A4:B5')
    ws['A4'] = "CLIENTE"
    ws['A4'].font = label_font
    ws['A4'].alignment = Alignment(horizontal='left', vertical='top')
    ws['A4'].fill = info_box_fill
    ws['A4'].border = Border(left=Side(style='thick', color="475569"))
    
    ws.merge_cells('A5:B5')
    ws['A5'] = project.client.name if project.client else "-"
    ws['A5'].font = value_font
    ws['A5'].fill = info_box_fill

    # PROYECTO
    ws.merge_cells('C4:E5')
    ws['C4'] = "PROYECTO"
    ws['C4'].font = label_font
    ws['C4'].fill = info_box_fill
    ws['C4'].border = Border(left=Side(style='thick', color="475569"))
    ws['C5'] = project.name
    ws['C5'].font = value_font
    ws['C5'].fill = info_box_fill

    # REFERENCIA / FECHA
    ws.merge_cells('F4:G5')
    ws['F4'] = "REFERENCIA / FECHA"
    ws['F4'].font = label_font
    ws['F4'].fill = info_box_fill
    ws['F4'].border = Border(left=Side(style='thick', color="475569"))
    ws['F5'] = f"IT-{report_date_str.replace('-','')}"
    ws['F5'].font = value_font
    ws['F5'].fill = info_box_fill

    # 3. SECCIONES
    def draw_section_header(row, text):
        ws.merge_cells(f'A{row}:G{row}')
        cell = ws.cell(row=row, column=1, value=text)
        cell.font = sec_title_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='left', vertical='center', indent=1)

    # CONCLUSIONES
    draw_section_header(7, "CONCLUSIONES Y OBSERVACIONES TÉCNICAS")
    ws.merge_cells('A8:G12')
    ws['A8'] = conclusions
    ws['A8'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
    ws['A8'].border = thin_border
    # Forzar bordes en el rango mergeado
    for r in range(8, 13):
        for c in range(1, 8):
            ws.cell(row=r, column=c).border = thin_border

    # RESULTADOS
    current_row = 14
    draw_section_header(current_row, "RESULTADOS DE LABORATORIO / ENSAYOS")
    current_row += 1
    
    h_labels = ["CÓDIGO", "FECHA", "HARINA BASE", "DESCRIPCIÓN", "PUNTAJE", "CONCLUSIÓN"]
    h_widths = [12, 12, 18, 25, 10, 30]
    for i, (label, width) in enumerate(zip(h_labels, h_widths), 1):
        cell = ws.cell(row=current_row, column=i, value=label)
        cell.font = table_header_font
        cell.border = Border(bottom=Side(style='medium', color="E2E8F0"))
        ws.column_dimensions[openpyxl.utils.get_column_letter(i)].width = width

    current_row += 1
    for ed in essays_data:
        ws.cell(row=current_row, column=1, value=ed['code']).border = thin_border
        ws.cell(row=current_row, column=2, value=str(ed['date'])).border = thin_border
        ws.cell(row=current_row, column=3, value=ed['base_flour_name']).border = thin_border
        ws.cell(row=current_row, column=4, value=ed['description']).border = thin_border
        ws.cell(row=current_row, column=5, value=f"{ed['final_score']} / 10").border = thin_border
        ws.cell(row=current_row, column=6, value=ed['conclusion']).border = thin_border
        current_row += 1

    # AGENDA
    current_row += 1
    draw_section_header(current_row, "AGENDA DE VISITAS Y ACTIVIDADES")
    current_row += 1
    h_labels_v = ["FECHA", "TIPO", "OBJETIVO", "STATUS"]
    for i, label in enumerate(h_labels_v, 1):
        cell = ws.cell(row=current_row, column=i, value=label)
        cell.font = table_header_font
        cell.border = Border(bottom=Side(style='medium', color="E2E8F0"))

    current_row += 1
    for v in visits:
        ws.cell(row=current_row, column=1, value=str(v.date)).border = thin_border
        ws.cell(row=current_row, column=2, value=v.visit_type).border = thin_border
        ws.cell(row=current_row, column=3, value=v.objective).border = thin_border
        ws.cell(row=current_row, column=4, value=v.status).border = thin_border
        current_row += 1

    # 4. PIE DE PÁGINA (Firma y Confidencialidad)
    current_row += 3
    # Bloque de firma
    ws.merge_cells(start_row=current_row, start_column=2, end_row=current_row, end_column=3)
    ws.cell(row=current_row, column=2).border = Border(top=Side(style='thin', color="0F172A"))
    ws.cell(row=current_row+1, column=2, value="Firma del Profesional").font = label_font
    ws.cell(row=current_row+1, column=2).alignment = Alignment(horizontal='center')

    ws.merge_cells(start_row=current_row, start_column=5, end_row=current_row, end_column=6)
    ws.cell(row=current_row, column=5).border = Border(top=Side(style='thin', color="0F172A"))
    ws.cell(row=current_row+1, column=5, value="Recepción Cliente").font = label_font
    ws.cell(row=current_row+1, column=5).alignment = Alignment(horizontal='center')

    current_row += 3
    ws.merge_cells(f'A{current_row}:G{current_row}')
    ws.cell(row=current_row, column=1, value="DOCUMENTO CONFIDENCIAL • PROPIEDAD INTELECTUAL BAKERY LAB ERP").font = Font(size=7, color="94A3B8")
    ws.cell(row=current_row, column=1).alignment = Alignment(horizontal='center')

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    filename = f"IT_{client_name}_{proj_name}_{report_date_str}.xlsx"
    return FileResponse(buffer, as_attachment=True, filename=filename)
