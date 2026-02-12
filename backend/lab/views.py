import io
import os
import xlsxwriter
from django.utils import timezone
from django.http import HttpResponse, FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from datetime import datetime
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
    Importa reclamos desde un archivo Excel con formato robusto.
    Busca la fila donde comienza 'Cliente_Nombre' para soportar encabezados decorativos.
    """
    file_obj = request.FILES.get('file')
    project_id = request.data.get('project')
    if not file_obj or not project_id:
        return Response({"error": "Se requiere archivo y ID de proyecto."}, status=400)
    
    project = get_object_or_404(Project, id=project_id)
    
    try:
        import openpyxl
        wb = openpyxl.load_workbook(file_obj, data_only=True)
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

        # 1. BUSCAR LA FILA DE ENCABEZADO
        header_row_index = 0
        for i, row in enumerate(ws.iter_rows(values_only=True), 1):
            # Normalizamos los nombres para buscar: minúsculas, sin espacios extras ni guiones bajos
            row_normalized = [str(cell).strip().lower().replace("_", " ") for cell in row if cell]
            if "cliente nombre" in row_normalized:
                header_row_index = i
                break
        
        if not header_row_index:
            return Response({"error": "No se encontró la cabecera 'Cliente_Nombre' en el archivo."}, status=400)

        complaints_created = 0
        # Empezamos a leer desde la fila SIGUIENTE al encabezado
        for row in ws.iter_rows(min_row=header_row_index + 1, values_only=True):
            if not row or not row[0]: continue # Saltar filas vacías o sin cliente
            
            # El ejemplo en el Excel debe saltarse si detectamos que es el ejemplo
            if "Panadería Los Abuelos" in str(row[0]): continue

            Complaint.objects.create(
                project=project,
                contact=str(row[1]) if row[1] else "",
                delivery_date=parse_date(row[2]),
                batch=str(row[3]) if row[3] else "",
                loading_date=parse_date(row[4]) or timezone.now().date(),
                flour_type=str(row[5]) if row[5] else "",
                product_made=str(row[6]) if row[6] else "",
                process_type=str(row[7]) if row[7] else "",
                description=str(row[8]) if row[8] else ""
            )
            complaints_created += 1
            
        return Response({"message": f"Se importaron {complaints_created} reclamos con éxito."}, status=201)
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return Response({"error": f"Error importando Excel: {str(e)}"}, status=500)

@api_view(['GET'])
def download_complaint_template(request):
    """
    PROTOCOL: FINAL CLONE OF USER TEMPLATE
    Reference: Google Sheets (la definitiva.xlsx)
    Motor: openpyxl
    Rules: 
    1. NO Ingredients/Bakery data.
    2. ONLY fill B6 (Client) and F6 (Project).
    3. Preserve EXACT user design.
    """
    import openpyxl
    project_id = request.query_params.get('project')
    project = None
    if project_id:
        project = Project.objects.filter(id=project_id).first()

    template_path = os.path.join(os.path.dirname(__file__), 'static', 'templates', 'reclamo.xlsx')
    
    if not os.path.exists(template_path):
        return Response({"error": "Template file not found."}, status=404)

    wb = openpyxl.load_workbook(template_path)
    # Seleccionamos la hoja del usuario (PLANTILLA_RECLAMOS o activa)
    if "PLANTILLA_RECLAMOS" in wb.sheetnames:
        ws = wb["PLANTILLA_RECLAMOS"]
    else:
        ws = wb.active

    # --- INYECCIÓN DINÁMICA MÍNIMA ---
    if project:
        ws['B6'] = project.client.name if project.client else "---"
        ws['F6'] = project.name
    else:
        ws['B6'] = "---"
        ws['F6'] = "---"

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    response = HttpResponse(
        output.read(), 
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    response["Content-Disposition"] = "attachment; filename=reclamo_oficial.xlsx"
    return response
    for col_num, (header, width) in enumerate(zip(headers, col_widths)):
        ws.set_column(col_num, col_num, width)
        ws.write(9, col_num, header, fmt_header)

    # 4. PIE DE PÁGINA (Fila 40)
    ws.merge_range('A40:I40', 'DOCUMENTO CONFIDENCIAL • PROPIEDAD INTELECTUAL GESTIÓN TÉCNICA Y DESARROLLO', fmt_legal)

    workbook.close()
    output.seek(0)
    
    response = HttpResponse(
        output.read(), 
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    # Nombre de archivo solicitado para cerrar el módulo
    response["Content-Disposition"] = "attachment; filename=la_definitiva.xlsx"
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
    save_to_history = request.data.get('save_to_history', False)

    if not project_id:
        return Response({"error": "ID de proyecto es requerido."}, status=400)

    try:
        project = get_object_or_404(Project, id=project_id)
        
        # Valores por defecto para evitar NotImplemented en filtros
        s_date = start_date if start_date else "2000-01-01"
        e_date = end_date if end_date else "2100-12-31"

        # Datos técnicos
        essays = Ensayo.objects.filter(project=project, date__range=[s_date, e_date]).order_by('date')
        visits = Visit.objects.filter(project=project, date__range=[s_date, e_date]).order_by('date')
        complaints = Complaint.objects.filter(project=project, loading_date__range=[s_date, e_date]).order_by('loading_date')

        # Nombre de archivo estandarizado
        client_name = str(project.client.name).replace(' ', '_') if project.client else "Sin_Cliente"
        proj_name = str(project.name).replace(' ', '_')
        report_date_str = str(request.data.get('report_date', timezone.now().strftime('%Y-%m-%d')))
        
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

        print(f"DEBUG: Generando reporte para proyecto {project.id}, save_to_history={save_to_history}")
        # --- GUARDAR EN HISTORIAL (Opcional) ---
        if save_to_history:
            try:
                TechnicalReport.objects.create(
                    project=project,
                    report_date=timezone.now().date(),
                    start_date=s_date,
                    end_date=e_date,
                    technical_observations=conclusions
                )
                print("DEBUG: Historial guardado.")
            except Exception as he:
                print(f"DEBUG ERROR: No se pudo guardar historial: {str(he)}")

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

        # --- LÓGICA EXCEL BURZACO RÍGIDA (MÉTODO ESTRICTO) ---
        import xlsxwriter
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        ws = workbook.add_worksheet("INFORME TÉCNICO")

        # Formatos
        fmt_title = workbook.add_format()
        fmt_title.set_bold()
        fmt_title.set_font_size(18)
        fmt_title.set_font_color('white')
        fmt_title.set_bg_color('#1A1A1A') # PRUEBA DE CONTROL
        fmt_title.set_align('center')
        fmt_title.set_valign('vcenter')
        fmt_title.set_border(1)

        fmt_subtitle = workbook.add_format()
        fmt_subtitle.set_font_size(12)
        fmt_subtitle.set_font_color('white')
        fmt_subtitle.set_bg_color('#404040') # PRUEBA DE CONTROL
        fmt_subtitle.set_align('center')
        fmt_subtitle.set_valign('vcenter')
        fmt_subtitle.set_border(1)

        fmt_label = workbook.add_format({'bold': True, 'bg_color': '#F1F5F9', 'border': 2})
        fmt_value = workbook.add_format({'border': 2, 'bg_color': 'white'})
        
        fmt_header = workbook.add_format()
        fmt_header.set_bold()
        fmt_header.set_font_color('white')
        fmt_header.set_bg_color('#333333')
        fmt_header.set_align('center')
        fmt_header.set_valign('vcenter')
        fmt_header.set_border(1)
        fmt_header.set_text_wrap()

        fmt_sec = workbook.add_format({'bold': True, 'font_color': 'white', 'bg_color': '#333333', 'border': 1})
        fmt_legal = workbook.add_format({'italic': True, 'font_size': 9, 'align': 'center'})

        # 1. ENCABEZADO
        ws.merge_range('A1:B5', "", workbook.add_format({'border': 2}))
        logo_path = os.path.join(os.path.dirname(__file__), 'static', 'images', 'logo_institucional.png')
        if os.path.exists(logo_path):
            ws.insert_image('A1', logo_path, {'x_offset': 20, 'y_offset': 10, 'x_scale': 0.75, 'y_scale': 0.75})

        ws.merge_range('C1:G3', "GESTIÓN TÉCNICA Y DESARROLLO", fmt_title)
        ws.merge_range('C4:G5', "Harinas y Panificados", fmt_subtitle)
        ws.merge_range('H1:I5', "REFERENCIA\n\nMOD-RECLAMO", workbook.add_format({'border': 2, 'align': 'center', 'valign': 'vcenter', 'text_wrap': True}))

        # 2. DATOS
        ws.write('A7', 'CLIENTE:', fmt_label)
        ws.merge_range('B7:D7', project.client.name if project.client else "---", fmt_value)
        ws.write('E7', 'PROYECTO:', fmt_label)
        ws.merge_range('F7:H7', project.name, fmt_value)

        # 3. CONTENIDO
        curr = 9
        ws.write(curr, 0, "CONCLUSIONES Y OBSERVACIONES TÉCNICAS", fmt_sec)
        ws.merge_range(curr, 0, curr, 8, "CONCLUSIONES Y OBSERVACIONES TÉCNICAS", fmt_sec)
        curr += 1
        ws.merge_range(curr, 0, curr+4, 8, str(conclusions or ''), workbook.add_format({'border': 1, 'valign': 'top', 'text_wrap': True}))
        curr += 6

        ws.merge_range(curr, 0, curr, 8, "RESULTADOS DE ENSAYOS", fmt_sec)
        curr += 1
        h_labels = ["CÓDIGO", "FECHA", "HARINA BASE", "DESCRIPCIÓN", "PUNTAJE", "CONCLUSIÓN"]
        col_widths = [25, 20, 15, 15, 15, 20, 20, 60]
        for i, (label, w) in enumerate(zip(h_labels, col_widths)):
            ws.set_column(i, i, w)
            ws.write(curr, i, label, fmt_header)
        
        curr += 1
        for ed in essays_data:
            ws.write(curr, 0, str(ed.get('code', '')), fmt_value)
            ws.write(curr, 1, str(ed.get('date', '')), fmt_value)
            ws.write(curr, 2, str(ed.get('base_flour_name', '')), fmt_value)
            ws.write(curr, 3, str(ed.get('description', '')), fmt_value)
            ws.write(curr, 4, str(ed.get('final_score', 0)), fmt_value)
            ws.write(curr, 5, str(ed.get('conclusion', '')), fmt_value)
            curr += 1

        # Pie legal
        ws.merge_range(40, 0, 40, 8, 'DOCUMENTO CONFIDENCIAL • PROPIEDAD INTELECTUAL GESTIÓN TÉCNICA Y DESARROLLO', fmt_legal)

        workbook.close()
        buffer = io.BytesIO()
        buffer.write(output.getvalue())
        buffer.seek(0)
        filename = f"IT_{client_name}_{proj_name}_{report_date_str}.xlsx"
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
