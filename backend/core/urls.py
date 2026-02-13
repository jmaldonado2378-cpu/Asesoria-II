from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def health_check(request):
    return HttpResponse("Backend API is running. Ready for operations.", content_type="text/plain")

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/', include('lab.urls')),
]

# Servir archivos media siempre (necesario para la visualización de fotos en informes en Render)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
