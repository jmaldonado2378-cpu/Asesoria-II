from rest_framework import viewsets
from lab.models import Project, ProjectBudget, BudgetItem, ProjectIngredientPrice
from lab.serializers import ProjectSerializer, ProjectBudgetSerializer, BudgetItemSerializer, ProjectIngredientPriceSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class ProjectBudgetViewSet(viewsets.ModelViewSet):
    queryset = ProjectBudget.objects.all()
    serializer_class = ProjectBudgetSerializer

    def get_queryset(self):
        queryset = self.queryset
        project_id = self.request.query_params.get('project')
        if project_id is not None:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class BudgetItemViewSet(viewsets.ModelViewSet):
    queryset = BudgetItem.objects.all()
    serializer_class = BudgetItemSerializer

    def get_queryset(self):
        queryset = self.queryset
        budget_id = self.request.query_params.get('budget')
        if budget_id is not None:
            queryset = queryset.filter(budget_id=budget_id)
        return queryset

class ProjectIngredientPriceViewSet(viewsets.ModelViewSet):
    queryset = ProjectIngredientPrice.objects.all()
    serializer_class = ProjectIngredientPriceSerializer
