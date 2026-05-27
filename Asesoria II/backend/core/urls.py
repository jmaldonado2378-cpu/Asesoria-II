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

# Los archivos estáticos se manejan con whitenoise
# Las imágenes ahora se sirven directamente desde Supabase Storage CDN
