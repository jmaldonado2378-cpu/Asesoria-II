from .clients import ClientViewSet
from .projects import ProjectViewSet, ProjectBudgetViewSet, BudgetItemViewSet, ProjectIngredientPriceViewSet
from .essays import EnsayoViewSet, EnsayoDetailViewSet, EnsayoImageViewSet
from .ingredients import IngredientViewSet
from .visits import VisitViewSet
from .complaints import ComplaintViewSet, ComplaintImageViewSet, generar_reporte_reclamo_estandar
from .reports import TechnicalReportViewSet, generar_informe_tecnico_estandar, serve_media_view
