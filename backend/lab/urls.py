from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, ProjectViewSet, IngredientViewSet,
    EnsayoViewSet, EnsayoDetailViewSet, EnsayoImageViewSet,
    ProjectIngredientPriceViewSet, VisitViewSet,
    TechnicalReportViewSet,
    ComplaintViewSet, ComplaintImageViewSet
)
from . import views

router = DefaultRouter()
router.register(r'clients', ClientViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'ensayos', EnsayoViewSet)
router.register(r'ensayo-details', EnsayoDetailViewSet)
router.register(r'ensayo-images', EnsayoImageViewSet)
router.register(r'project-ingredient-prices', ProjectIngredientPriceViewSet)
router.register(r'visits', VisitViewSet)
router.register(r'technical-reports', TechnicalReportViewSet)
router.register(r'complaints', ComplaintViewSet)
router.register(r'complaint-images', ComplaintImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generar-informe-tecnico-estandar/', views.generar_informe_tecnico_estandar, name='generar-informe-tecnico-estandar'),
    path('generar-reporte-reclamo-estandar/', views.generar_reporte_reclamo_estandar, name='generar-reporte-reclamo-estandar'),
]
