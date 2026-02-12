from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, ProjectViewSet, IngredientViewSet,
    EnsayoViewSet, EnsayoDetailViewSet, EnsayoImageViewSet,
    ProjectIngredientPriceViewSet, VisitViewSet,
    TechnicalReportViewSet, generate_technical_report_view,
    ComplaintViewSet, ComplaintImageViewSet, import_complaints_excel
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
    path('generate-technical-report/', generate_technical_report_view, name='generate-technical-report'),
    path('import-complaints/', import_complaints_excel, name='import-complaints'),
]
