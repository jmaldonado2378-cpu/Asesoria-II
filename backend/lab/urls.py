from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, 
    ProjectViewSet, 
    IngredientViewSet, 
    ProjectIngredientPriceViewSet, 
    EnsayoViewSet,
    VisitViewSet
)
from . import views

router = DefaultRouter()
router.register(r'clients', views.ClientViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'ingredients', views.IngredientViewSet)
router.register(r'project-prices', views.ProjectIngredientPriceViewSet)
router.register(r'ensayos', views.EnsayoViewSet)
router.register(r'ensayo-details', views.EnsayoDetailViewSet)
router.register(r'ensayo-images', views.EnsayoImageViewSet)
router.register(r'visits', views.VisitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
