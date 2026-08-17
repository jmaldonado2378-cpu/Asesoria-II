from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum, F, Value, DecimalField
from django.db.models.functions import Coalesce

from ..models import Project, Visit, ProjectExpense, Ensayo
from ..serializers import ProjectExpenseSerializer

class ProjectExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectExpenseSerializer
    
    def get_queryset(self):
        qs = ProjectExpense.objects.all().select_related('project__client')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        return qs

@api_view(['GET'])
def financial_summary(request):
    """Returns aggregated financial data across all projects or filtered by project."""
    project_id = request.query_params.get('project')
    
    visits_qs = Visit.objects.all()
    expenses_qs = ProjectExpense.objects.all()
    
    if project_id:
        visits_qs = visits_qs.filter(project_id=project_id)
        expenses_qs = expenses_qs.filter(project_id=project_id)
    
    revenue = visits_qs.aggregate(
        total=Coalesce(Sum('fees'), Value(0), output_field=DecimalField())
    )['total']
    
    visit_expenses = visits_qs.aggregate(
        total=Coalesce(Sum('expenses'), Value(0), output_field=DecimalField())
    )['total']
    
    material_expenses = expenses_qs.aggregate(
        total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
    )['total']
    
    # Per-project breakdown
    projects_qs = Project.objects.all()
    if project_id:
        projects_qs = projects_qs.filter(id=project_id)
    
    project_breakdown = []
    for p in projects_qs.select_related('client'):
        p_revenue = Visit.objects.filter(project=p).aggregate(
            total=Coalesce(Sum('fees'), Value(0), output_field=DecimalField())
        )['total']
        p_visit_exp = Visit.objects.filter(project=p).aggregate(
            total=Coalesce(Sum('expenses'), Value(0), output_field=DecimalField())
        )['total']
        p_mat_exp = ProjectExpense.objects.filter(project=p).aggregate(
            total=Coalesce(Sum('amount'), Value(0), output_field=DecimalField())
        )['total']
        margin = p_revenue - p_visit_exp - p_mat_exp
        if p_revenue > 0 or p_visit_exp > 0 or p_mat_exp > 0:
            project_breakdown.append({
                'project_id': p.id,
                'project_name': p.name,
                'client_name': p.client.name,
                'status': p.status,
                'revenue': float(p_revenue),
                'visit_expenses': float(p_visit_exp),
                'material_expenses': float(p_mat_exp),
                'margin': float(margin),
            })
    
    return Response({
        'totals': {
            'revenue': float(revenue),
            'visit_expenses': float(visit_expenses),
            'material_expenses': float(material_expenses),
            'total_expenses': float(visit_expenses + material_expenses),
            'net_margin': float(revenue - visit_expenses - material_expenses),
        },
        'projects': project_breakdown,
    })
