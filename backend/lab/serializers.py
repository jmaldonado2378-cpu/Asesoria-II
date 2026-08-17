from rest_framework import serializers
from .models import (
    Client, Project, Ensayo, Ingredient, 
    ProjectIngredientPrice, Visit, EnsayoDetail, EnsayoImage,
    TechnicalReport, Complaint, ComplaintImage, ProjectBudget, BudgetItem
)

# --- CLIENTES ---
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

    def validate_name(self, value):
        if value:
            return value.strip()
        return value

    def validate_email(self, value):
        if value == '':
            return None
        return value

    def validate_contacts_data(self, value):
        if value is not None:
            if not isinstance(value, list):
                raise serializers.ValidationError("contacts_data must be a list")
            for item in value:
                if not isinstance(item, dict):
                    raise serializers.ValidationError("each contact must be a dict")
                if not all(k in item for k in ('name', 'position', 'phone', 'email')):
                    raise serializers.ValidationError("contact must have name, position, phone, email")
        return value

    def create(self, validated_data):
        contacts_data = validated_data.get('contacts_data')
        if contacts_data and isinstance(contacts_data, list) and len(contacts_data) > 0:
            first = contacts_data[0]
            validated_data.setdefault('contact_name', first.get('name', ''))
            validated_data.setdefault('position', first.get('position', ''))
            validated_data.setdefault('phone', first.get('phone', ''))
            validated_data.setdefault('email', first.get('email', ''))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        contacts_data = validated_data.get('contacts_data', instance.contacts_data)
        if contacts_data and isinstance(contacts_data, list) and len(contacts_data) > 0:
            first = contacts_data[0]
            if 'contact_name' not in validated_data:
                validated_data['contact_name'] = first.get('name', instance.contact_name)
            if 'position' not in validated_data:
                validated_data['position'] = first.get('position', instance.position)
            if 'phone' not in validated_data:
                validated_data['phone'] = first.get('phone', instance.phone)
            if 'email' not in validated_data:
                validated_data['email'] = first.get('email', instance.email)
        return super().update(instance, validated_data)

# --- PRESUPUESTOS ---
class BudgetItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetItem
        fields = '__all__'

class ProjectBudgetSerializer(serializers.ModelSerializer):
    items = BudgetItemSerializer(many=True, read_only=True)
    class Meta:
        model = ProjectBudget
        fields = '__all__'

# --- PROYECTOS ---
class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.ReadOnlyField(source='client.name')
    budget = ProjectBudgetSerializer(read_only=True)
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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Usar la propiedad full_url del modelo para devolver la URL completa al leer
        ret['image'] = instance.full_url
        return ret

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
        total_kg = sum(d.quantity for d in obj.details.all() if d.ingredient.is_base_flour and d.quantity)
        return float(total_kg) * 1000 if total_kg else 0.0

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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Usar la propiedad full_url del modelo para devolver la URL completa al leer
        ret['image'] = instance.full_url
        return ret

class ComplaintSerializer(serializers.ModelSerializer):
    images = ComplaintImageSerializer(many=True, read_only=True)
    client_name = serializers.ReadOnlyField(source='project.client.name')
    project_name = serializers.ReadOnlyField(source='project.name')
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'project', 'loading_date', 'delivery_date', 'batch', 
            'flour_type', 'product_made', 'process_type', 'description', 
            'status', 'technical_conclusion', 'corrective_action', 
            'direct_client', 'contact', 'images', 'client_name', 'project_name'
        ]
