from rest_framework import viewsets
from lab.models import Visit
from lab.serializers import VisitSerializer

class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.all().select_related('project', 'client').order_by('-date')
    serializer_class = VisitSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset
