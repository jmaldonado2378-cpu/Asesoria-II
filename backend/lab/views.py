from rest_framework import viewsets, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import datetime
import io
import os
from .models import (
    Client, Project, Ensayo, Ingredient, 
    ProjectIngredientPrice, Visit, EnsayoDetail, EnsayoImage,
    TechnicalReport, Complaint, ComplaintImage
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
    TechnicalReportSerializer,
    ComplaintSerializer,
    ComplaintImageSerializer
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

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-loading_date', '-created_at')
    serializer_class = ComplaintSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class ComplaintImageViewSet(viewsets.ModelViewSet):
    queryset = ComplaintImage.objects.all()
    serializer_class = ComplaintImageSerializer

@api_view(['POST'])
@parser_classes([MultiPartParser])
def import_complaints_excel(request):
    """
    Importa reclamos desde un archivo Excel.
    Orden: 1. Cliente | 2. F. Entrega | 3. F. Carga | 4. Lote | 5. Harina | 6. Producto | 7. Proceso | 8. Descripción
    """
    file_obj = request.FILES.get('file')
    project_id = request.data.get('project')
    if not file_obj or not project_id:
        return Response({"error": "Se requiere archivo y ID de proyecto."}, status=400)
    
    project = get_object_or_404(Project, id=project_id)
    
    try:
        import openpyxl
        wb = openpyxl.load_workbook(file_obj)
        ws = wb.active
        
        def parse_date(val):
            if isinstance(val, datetime):
                return val.date()
            if isinstance(val, str):
                for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
                    try:
                        return datetime.strptime(val, fmt).date()
                    except ValueError:
                        continue
            return None

        complaints_created = 0
        # Saltamos encabezado (asumiendo fila 1 es header)
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row[0]: continue # Si no hay cliente, saltar
            
            # El usuario pide asociar al proyecto enviado, pero el Excel trae "Cliente_Nombre" en la col 1.
            # Verificamos si el cliente coincide por si acaso, pero la consigna dice "asociar automáticamente el reclamo al proyecto correspondiente".
            
            Complaint.objects.create(
                project=project,
                delivery_date=parse_date(row[1]),
                loading_date=parse_date(row[2]) or timezone.now().date(),
                batch=str(row[3]) if row[3] else "",
                flour_type=str(row[4]) if row[4] else "",
                product_made=str(row[5]) if row[5] else "",
                process_type=str(row[6]) if row[6] else "",
                description=str(row[7]) if row[7] else ""
            )
            complaints_created += 1
            
        return Response({"message": f"Se importaron {complaints_created} reclamos con éxito."}, status=201)
    except Exception as e:
        return Response({"error": f"Error importando Excel: {str(e)}"}, status=500)

@api_view(['GET'])
def download_complaint_template(request):
    """
    Generates a styled Excel template for technical complaints.
    """
    import openpyxl
    from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
    from django.http import HttpResponse
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Plantilla Reclamos"
    
    # Define styles
    header_fill = PatternFill(start_color="444444", end_color="444444", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)
    center_align = Alignment(horizontal="center", vertical="center")
    thin_border = Border(
        left=Side(style='thin'), 
        right=Side(style='thin'), 
        top=Side(style='thin'), 
        bottom=Side(style='thin')
    )
    
    headers = [
        "Cliente_Nombre", "Fecha_Entrega", "Fecha_Carga", "Lote_Partida", 
        "Tipo_Harina", "Producto_Elaborado", "Tipo_Proceso", "Descripcion_Reclamo"
    ]
    
    # Write headers
    for col_num, header_title in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_num)
        cell.value = header_title
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = center_align
        cell.border = thin_border
        
        # Adjust column width
        ws.column_dimensions[openpyxl.utils.get_column_letter(col_num)].width = 25
        
    # Add an example row (optional, but helpful)
    example_row = [
        "Cliente Ejemplo", "12/02/2026", "10/02/2026", "LOTE-123", 
        "0000", "Pan Francés", "Artesanal", "Falta de fuerza en la masa"
    ]
    for col_num, value in enumerate(example_row, 1):
        cell = ws.cell(row=2, column=col_num)
        cell.value = value
        cell.border = thin_border

    response = HttpResponse(
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = "attachment; filename=Plantilla_Reclamos_Tecnicos.xlsx"
    wb.save(response)
    return response

@api_view(['POST'])
def generate_technical_report_view(request):
    import io
    import openpyxl
    from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
    from openpyxl.utils import get_column_letter
    from django.template.loader import render_to_string
    try:
        from xhtml2pdf import pisa
    except ImportError:
        pisa = None
    from django.core.mail import EmailMessage

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
        complaints = Complaint.objects.filter(project=project, loading_date__range=[start_date, end_date]).order_by('loading_date')

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

        # --- GUARDAR EN HISTORIAL ---
        try:
            history = TechnicalReport.objects.create(
                project=project,
                report_date=timezone.now().date(),
                start_date=start_date,
                end_date=end_date,
                technical_observations=conclusions
            )
        except Exception as he:
            print(f"Error guardando historial: {str(he)}")

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
                'conclusions': str(conclusions) if conclusions else "",
                'essays': essays,  # Usamos queryset para que los filtros de template funcionen
                'visits': visits,
                'complaints': complaints,
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

        # 2. CUADROS DE INFORMACIÓN
        # CLIENTE
        ws.merge_cells('A4:B4')
        ws.cell(row=4, column=1, value="CLIENTE").font = label_font
        ws.cell(row=4, column=1).fill = info_box_fill
        ws.cell(row=4, column=1).border = Border(left=Side(style='thick', color="475569"))
        
        ws.merge_cells('A5:B5')
        ws.cell(row=5, column=1, value=project.client.name if project.client else "-").font = value_font
        ws.cell(row=5, column=1).fill = info_box_fill
        ws.cell(row=5, column=1).border = Border(left=Side(style='thick', color="475569"))

        # PROYECTO
        ws.merge_cells('C4:E4')
        ws.cell(row=4, column=3, value="PROYECTO").font = label_font
        ws.cell(row=4, column=3).fill = info_box_fill
        ws.cell(row=4, column=3).border = Border(left=Side(style='thick', color="475569"))
        
        ws.merge_cells('C5:E5')
        ws.cell(row=5, column=3, value=project.name).font = value_font
        ws.cell(row=5, column=3).fill = info_box_fill
        ws.cell(row=5, column=3).border = Border(left=Side(style='thick', color="475569"))

        # REFERENCIA / FECHA
        ws.merge_cells('F4:G4')
        ws.cell(row=4, column=6, value="REFERENCIA / FECHA").font = label_font
        ws.cell(row=4, column=6).fill = info_box_fill
        ws.cell(row=4, column=6).border = Border(left=Side(style='thick', color="475569"))
        
        ws.merge_cells('F5:G5')
        ws.cell(row=5, column=6, value=f"IT-{report_date_str.replace('-','') or ''}").font = value_font
        ws.cell(row=5, column=6).fill = info_box_fill
        ws.cell(row=5, column=6).border = Border(left=Side(style='thick', color="475569"))

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
        ws['A8'] = str(conclusions or '')
        ws['A8'].alignment = Alignment(horizontal='left', vertical='top', wrap_text=True)
        # Aplicar bordes
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
            from openpyxl.utils import get_column_letter
            ws.column_dimensions[get_column_letter(i)].width = width

        current_row += 1
        for ed in essays_data:
            ws.cell(row=current_row, column=1, value=str(ed.get('code', ''))).border = thin_border
            ws.cell(row=current_row, column=2, value=str(ed.get('date', ''))).border = thin_border
            ws.cell(row=current_row, column=3, value=str(ed.get('base_flour_name', ''))).border = thin_border
            ws.cell(row=current_row, column=4, value=str(ed.get('description', ''))).border = thin_border
            ws.cell(row=current_row, column=5, value=f"{ed.get('final_score',0)} / 10").border = thin_border
            ws.cell(row=current_row, column=6, value=str(ed.get('conclusion', ''))).border = thin_border
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
            ws.cell(row=current_row, column=2, value=str(v.visit_type)).border = thin_border
            ws.cell(row=current_row, column=3, value=str(v.objective)).border = thin_border
            ws.cell(row=current_row, column=4, value=str(v.status)).border = thin_border
            current_row += 1

        # RECLAMOS
        current_row += 1
        draw_section_header(current_row, "RECLAMOS TÉCNICOS EN EL PERÍODO")
        current_row += 1
        h_labels_c = ["FECHA", "LOTE", "HARINA", "DESCRIPCIÓN", "ESTADO", "CONCLUSIÓN"]
        for i, label in enumerate(h_labels_c, 1):
            cell = ws.cell(row=current_row, column=i, value=label)
            cell.font = table_header_font
            cell.border = Border(bottom=Side(style='medium', color="E2E8F0"))

        current_row += 1
        for c in complaints:
            ws.cell(row=current_row, column=1, value=str(c.loading_date or '')).border = thin_border
            ws.cell(row=current_row, column=2, value=str(c.batch or '')).border = thin_border
            ws.cell(row=current_row, column=3, value=str(c.flour_type or '')).border = thin_border
            ws.cell(row=current_row, column=4, value=str(c.description or '')).border = thin_border
            ws.cell(row=current_row, column=5, value=str(c.status or 'Abierto')).border = thin_border
            ws.cell(row=current_row, column=6, value=str(c.technical_conclusion or '---')).border = thin_border
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

        # --- ENVÍO AUTOMÁTICO DE EMAIL ---
        try:
            subject = f"Informe Técnico: {project.client.name} - {project.name}"
            body = f"Hola,\n\nSe adjunta el Informe Técnico de Gestión para el proyecto {project.name}.\n\nSaludos,\nBakery Lab ERP"
            recipients = ["jmaldonado2378@gmail.com"]
            if project.client and project.client.email:
                recipients.append(project.client.email)
            
            email = EmailMessage(
                subject,
                body,
                to=recipients,
            )
            email.attach(filename, buffer.getvalue(), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            email.send()
        except Exception as em:
            print(f"Error enviando email: {str(em)}")

        return FileResponse(buffer, as_attachment=True, filename=filename)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print("--- CRITICAL ERROR IN REPORT GENERATION ---")
        print(error_details)
        print("-------------------------------------------")
        # EXPOMEMOS EL TRACEBACK PARA DEPURACIÓN EN DESPLIEGUE
        return Response({
            "error": f"Error en generación final: {str(e)}",
            "traceback": error_details 
        }, status=500)
