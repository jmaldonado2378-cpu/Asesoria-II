import os
import urllib.request
import urllib.error
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.response import Response
from lab.models import Ensayo, EnsayoDetail, EnsayoImage
from lab.serializers import EnsayoSerializer, EnsayoDetailSerializer, EnsayoImageSerializer

class EnsayoViewSet(viewsets.ModelViewSet):
    queryset = Ensayo.objects.all().select_related('project', 'project__client').prefetch_related('details__ingredient', 'images').order_by('-date')
    serializer_class = EnsayoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class EnsayoDetailViewSet(viewsets.ModelViewSet):
    queryset = EnsayoDetail.objects.all()
    serializer_class = EnsayoDetailSerializer

class EnsayoImageViewSet(viewsets.ModelViewSet):
    queryset = EnsayoImage.objects.all()
    serializer_class = EnsayoImageSerializer

    def create(self, request, *args, **kwargs):
        if 'image' in request.FILES:
            file_obj = request.FILES['image']
            
            supabase_url = settings.SUPABASE_URL
            supabase_key = settings.SUPABASE_KEY
            if not supabase_url or not supabase_key:
                return Response({'error': 'Supabase no configurado en el backend'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            try:
                ext = os.path.splitext(file_obj.name)[1]
                safe_name = file_obj.name.replace(' ', '_')
                filename = f"{timezone.now().strftime('%Y%m%d_%H%M%S')}_{safe_name}"
                
                bucket_name = "ensayo_photos"
                upload_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{filename}"
                req_upload = urllib.request.Request(upload_url, data=file_obj.read(), method="POST")
                req_upload.add_header("Authorization", f"Bearer {supabase_key}")
                req_upload.add_header("apikey", supabase_key)
                req_upload.add_header("Content-Type", file_obj.content_type or "application/octet-stream")
                
                try:
                    with urllib.request.urlopen(req_upload, timeout=15.0) as res:
                        pass
                except urllib.error.HTTPError as e:
                    import traceback
                    print(f"Supabase upload error: {e.read().decode('utf-8', errors='ignore')}")
                    raise Exception(f"HTTPError {e.code}: {e.reason}")
                
                # Guardar solo el nombre del archivo (la propiedad full_url del modelo reconstruirá el resto)
                data = request.data.copy()
                data['image'] = filename
                
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
                
            except Exception as e:
                import traceback
                print(traceback.format_exc())
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
                
        # Fallback if no file is sent, or if it's sent as a URL string directly
        return super().create(request, *args, **kwargs)
