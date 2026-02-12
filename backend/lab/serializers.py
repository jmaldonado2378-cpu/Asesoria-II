from rest_framework import serializers
from .models import (
    Client, Project, Ensayo, Ingredient, 
    ProjectIngredientPrice, Visit, EnsayoDetail, EnsayoImage,
    TechnicalReport, Complaint, ComplaintImage
)

# --- CLIENTES ---
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

# --- PROYECTOS ---
class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    class Meta:
        model = Project
        fields = '__all__'

# --- INGREDIENTES ---
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = '__all__'

# --- IMÁGENES DE ENSAYO ---
class EnsayoImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnsayoImage
        fields = '__all__'

# --- DETALLE DE RECETA (CORREGIDO) ---
class EnsayoDetailSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    is_base_flour = serializers.ReadOnlyField(source='ingredient.is_base_flour')
    ppm_calc = serializers.ReadOnlyField()
    dosis_25kg = serializers.ReadOnlyField()
    panadero_pct = serializers.ReadOnlyField()
    quantity_grams = serializers.SerializerMethodField()
    line_cost = serializers.SerializerMethodField()

    class Meta:
        model = EnsayoDetail
        # SE AGREGA 'ensayo' A LA LISTA PARA PERMITIR EL GUARDADO DEL ID PADRE
        fields = ['id', 'ensayo', 'ingredient', 'ingredient_name', 'is_base_flour', 'quantity', 'quantity_grams', 'price_per_kg', 'line_cost', 'ppm_calc', 'dosis_25kg', 'panadero_pct']
    
    def get_quantity_grams(self, obj):
        return float(obj.quantity) * 1000

    def get_line_cost(self, obj):
        if obj.quantity and obj.price_per_kg:
            return float(obj.quantity * obj.price_per_kg)
        return 0.0

# --- ENSAYO PRINCIPAL ---
class EnsayoSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='project.client.name')
    project_name = serializers.ReadOnlyField(source='project.name')
    
    details = EnsayoDetailSerializer(many=True, read_only=True)
    images = EnsayoImageSerializer(many=True, read_only=True)
    
    total_harina_grams = serializers.SerializerMethodField()
    total_cost = serializers.SerializerMethodField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=4, read_only=True) 

    class Meta:
        model = Ensayo
        fields = '__all__'

    def get_total_harina_grams(self, obj):
        total_kg = obj.get_total_flour_weight()
        return float(total_kg) * 1000

    def get_total_cost(self, obj):
        total = sum(d.quantity * d.price_per_kg for d in obj.details.all() if d.quantity and d.price_per_kg)
        return float(total)

# --- PRECIOS ---
class ProjectIngredientPriceSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    class Meta:
        model = ProjectIngredientPrice
        fields = '__all__'

# --- VISITAS ---
class VisitSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    project_name = serializers.ReadOnlyField(source='project.name')
    
    class Meta:
        model = Visit
        fields = '__all__'

    def get_client_name(self, obj):
        if obj.client:
            return obj.client.name
        if obj.project:
            return obj.project.client.name
        return "N/A"

# --- INFORMES TÉCNICOS ---
class TechnicalReportSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source='project.name')
    class Meta:
        model = TechnicalReport
        fields = '__all__'
# --- RECLAMOS ---
class ComplaintImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplaintImage
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    images = ComplaintImageSerializer(many=True, read_only=True)
    client_name = serializers.ReadOnlyField(source='project.client.name')
    project_name = serializers.ReadOnlyField(source='project.name')
    
    class Meta:
        model = Complaint
        fields = '__all__'
