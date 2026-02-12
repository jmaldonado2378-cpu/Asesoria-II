from django.db import models
from django.db.models import Sum
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError

# --- CLIENTES ---
class Client(models.Model):
    CLIENT_TYPES = [
        ('Molino', 'Molino'),
        ('Panificadora', 'Panificadora'),
        ('Panadería Artesanal', 'Panadería Artesanal'),
        ('Otro', 'Otro'),
    ]
    name = models.CharField("Nombre / Razón Social", max_length=255, unique=True)
    client_type = models.CharField("Tipo de Cliente", max_length=50, choices=CLIENT_TYPES, default='Otro')
    contact_1 = models.CharField("Contacto 1 (Nombre/Tel)", max_length=255, blank=True, null=True)
    contact_name = models.CharField("Nombre de Contacto", max_length=255, blank=True, null=True)
    position = models.CharField("Cargo / Puesto", max_length=255, blank=True, null=True)
    phone = models.CharField("Teléfono / WhatsApp", max_length=100, blank=True, null=True)
    contacts_data = models.JSONField("Agenda de Contactos", default=list, blank=True)
    contact_2 = models.CharField("Contacto 2 (Nombre/Tel)", max_length=255, blank=True, null=True)
    contact_3 = models.CharField("Contacto 3 (Nombre/Tel)", max_length=255, blank=True, null=True)
    cuit = models.CharField("CUIT", max_length=20, blank=True, null=True)
    address = models.CharField("Dirección", max_length=255, blank=True, null=True)
    maps_url = models.URLField("Enlace Google Maps", blank=True, null=True)
    email = models.EmailField("Email General", blank=True, null=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        return self.name

# --- INGREDIENTES ---
class Ingredient(models.Model):
    TYPE_CHOICES = [
        ('Harina', 'Harina'),
        ('Ingrediente General', 'Ingrediente General'),
        ('Aditivo', 'Aditivo'),
        ('Mejorador', 'Mejorador'),
        ('Enzimático', 'Enzimático'),
    ]
    name = models.CharField("Nombre del Ingrediente", max_length=255, unique=True)
    type = models.CharField("Tipo", max_length=50, choices=TYPE_CHOICES, default='Ingrediente General')
    brand = models.CharField("Marca / Proveedor", max_length=100, blank=True, null=True)
    unit = models.CharField("Unidad", max_length=10, default="KG")
    recommended_dosage_ppm = models.DecimalField("Dosis Recomendada (PPM)", max_digits=10, decimal_places=2, blank=True, null=True)
    observations = models.TextField("Observaciones técnicas", blank=True, null=True)
    technical_sheet = models.FileField("Ficha Técnica (PDF)", upload_to='tech_sheets/', blank=True, null=True)
    is_base_flour = models.BooleanField("Es Harina Base", default=False, help_text="Indica si se usa como base para cálculos de PPM")
    is_active = models.BooleanField(default=True)
    default_price = models.DecimalField("Precio Base", max_digits=10, decimal_places=4, default=Decimal('0.0000'))

    class Meta:
        verbose_name = "Ingrediente"
        verbose_name_plural = "Ingredientes"

    def __str__(self):
        return f"{self.name} ({self.brand or 'S/M'})"

# --- PROYECTOS ---
class Project(models.Model):
    PROJECT_TYPES = [
        ('Capacitación', 'Capacitación'),
        ('Seguimiento', 'Seguimiento'),
        ('Consulta', 'Consulta'),
        ('Desarrollo', 'Desarrollo'),
    ]
    FREQUENCY_CHOICES = [
        ('Semanal', 'Semanal'),
        ('Quincenal', 'Quincenal'),
        ('Mensual', 'Mensual'),
        ('Única', 'Única'),
    ]
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('En Curso', 'En Curso'),
        ('Terminado', 'Terminado'),
        ('Cancelado', 'Cancelado'),
    ]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="projects", verbose_name="Cliente")
    name = models.CharField("Nombre del Proyecto", max_length=255)
    project_type = models.CharField("Tipo de Proyecto", max_length=50, choices=PROJECT_TYPES, default='Consulta')
    frequency = models.CharField("Frecuencia", max_length=50, choices=FREQUENCY_CHOICES, default='Mensual')
    status = models.CharField("Estado", max_length=50, choices=STATUS_CHOICES, default='En Curso')
    start_date = models.DateField("Fecha de Inicio", default=timezone.now)
    end_date = models.DateField("Fecha de Cierre", blank=True, null=True)
    objective = models.TextField("Objetivo Principal", blank=True, null=True)
    technical_observations = models.TextField("Observaciones Técnicas / Conclusiones", blank=True, null=True)
    fixed_fee = models.DecimalField("Honorarios Fijos", max_digits=12, decimal_places=2, default=0.00)
    
    custom_prices = models.ManyToManyField('Ingredient', through='ProjectIngredientPrice')

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"

    def __str__(self):
        return f"{self.name} - {self.client.name}"

class ProjectIngredientPrice(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT)
    price = models.DecimalField("Precio Específico", max_digits=10, decimal_places=4)
    class Meta:
        unique_together = ('project', 'ingredient')
        verbose_name = "Precio por Proyecto"
        verbose_name_plural = "Precios por Proyecto"

# --- VISITAS ---
class Visit(models.Model):
    VISIT_TYPES = [
        ('Técnica', 'Técnica'),
        ('Comercial', 'Comercial'),
        ('Seguimiento', 'Seguimiento'),
        ('Otro', 'Otro'),
    ]
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Realizada', 'Realizada'),
        ('Cancelada', 'Cancelada'),
    ]
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="visits", verbose_name="Cliente", null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="visits", verbose_name="Proyecto", null=True, blank=True)
    date = models.DateField("Fecha de la Visita")
    start_time = models.TimeField("Hora Inicio")
    end_time = models.TimeField("Hora Fin")
    visit_type = models.CharField("Tipo de Visita", max_length=50, choices=VISIT_TYPES, default='Técnica')
    status = models.CharField("Estado", max_length=50, choices=STATUS_CHOICES, default='Pendiente')
    objective = models.CharField("Objetivo / Temática", max_length=255, blank=True, null=True)
    description = models.TextField("Bitácora / Reporte de Visita", blank=True, null=True)
    expenses = models.DecimalField("Gastos / Viáticos", max_digits=10, decimal_places=2, default=0.00)
    fees = models.DecimalField("Honorarios / Facturable", max_digits=10, decimal_places=2, default=0.00)
    kilometers = models.DecimalField("Kilómetros Recorridos", max_digits=10, decimal_places=2, default=0.00)

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("La hora de inicio debe ser anterior a la hora de fin.")
        # Superposición opcional - podríamos desactivarla para permitir múltiples asesores trabajando
        # overlapping_visits = Visit.objects.filter(
        #     date=self.date, start_time__lt=self.end_time, end_time__gt=self.start_time
        # )
        # if self.pk: overlapping_visits = overlapping_visits.exclude(pk=self.pk)
        # if overlapping_visits.exists():
        #     visit = overlapping_visits.first()
        #     raise ValidationError(f"Existe una superposición con otra visita: {visit.project.client.name}")

    class Meta:
        verbose_name = "Visita"
        verbose_name_plural = "Agenda de Visitas"

    def __str__(self):
        client_name = self.client.name if self.client else (self.project.client.name if self.project else "S/C")
        return f"{self.date} | {client_name}"

# --- ENSAYOS ---
class Ensayo(models.Model):
    BAKING_TYPES = [
        ('Fermentado', 'Fermentado'),
        ('Batido', 'Batido'),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="ensayos", verbose_name="Proyecto")
    code = models.CharField("Código de Ensayo", max_length=50, unique=True, editable=False)
    date = models.DateField("Fecha", default=timezone.now)
    description = models.TextField("Descripción del Problema/Objetivo", blank=True, null=True)
    conclusion = models.TextField("Conclusión Técnica", blank=True, null=True)
    baking_type = models.CharField("Tipo de Panificación", max_length=50, choices=BAKING_TYPES, blank=True, null=True)

    # Labs
    humidity_pct = models.DecimalField("Humedad (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    ash_pct = models.DecimalField("Cenizas (%)", max_digits=6, decimal_places=4, null=True, blank=True)
    protein_pct = models.DecimalField("Proteína (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    gluten_wet_pct = models.DecimalField("Gluten Húmedo (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    gluten_dry_pct = models.DecimalField("Gluten Seco (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    gluten_index_pct = models.DecimalField("Gluten Index", max_digits=6, decimal_places=2, null=True, blank=True)
    color_l = models.DecimalField("Color L*", max_digits=6, decimal_places=2, null=True, blank=True)
    color_a = models.DecimalField("Color a*", max_digits=6, decimal_places=2, null=True, blank=True)
    color_b = models.DecimalField("Color b*", max_digits=6, decimal_places=2, null=True, blank=True)
    w_value = models.DecimalField("Valor W", max_digits=10, decimal_places=2, null=True, blank=True)
    p_value = models.DecimalField("Valor P (Tenacidad)", max_digits=10, decimal_places=2, null=True, blank=True)
    l_value = models.DecimalField("Valor L (Extensibilidad)", max_digits=10, decimal_places=2, null=True, blank=True)
    pl_ratio = models.DecimalField("Relación P/L", max_digits=6, decimal_places=2, null=True, blank=True)
    falling_number_sec = models.IntegerField("Falling Number (seg)", null=True, blank=True)
    water_absorption_pct = models.DecimalField("Absorción de Agua (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    development_time_min = models.DecimalField("Tiempo Desarrollo (min)", max_digits=6, decimal_places=2, null=True, blank=True)
    stability_min = models.DecimalField("Estabilidad (min)", max_digits=6, decimal_places=2, null=True, blank=True)
    starch_damage_pct = models.DecimalField("Daño Almidón (%)", max_digits=6, decimal_places=2, null=True, blank=True)
    zeleny_ml = models.DecimalField("Zeleny (ml)", max_digits=6, decimal_places=2, null=True, blank=True)
    granulometry_pct = models.DecimalField("Granulometría (%)", max_digits=6, decimal_places=2, null=True, blank=True)

    # Proceso
    kneading_time_v1_min = models.DecimalField("Amasado Vel 1 (min)", max_digits=5, decimal_places=2, null=True, blank=True)
    kneading_time_v2_min = models.DecimalField("Amasado Vel 2 (min)", max_digits=5, decimal_places=2, null=True, blank=True)
    kneading_temp_c = models.DecimalField("Temp. Masa (°C)", max_digits=5, decimal_places=2, null=True, blank=True)
    sobado_turns = models.IntegerField("Vueltas de Sobado", null=True, blank=True)
    piece_weight_g = models.DecimalField("Peso Pieza (g)", max_digits=10, decimal_places=2, null=True, blank=True)
    fermentation_time_min = models.DecimalField("Tiempo Fermentación (min)", max_digits=6, decimal_places=2, null=True, blank=True)
    fermentation_temp_c = models.DecimalField("Temp. Fermentación (°C)", max_digits=5, decimal_places=2, null=True, blank=True)
    fermentation_humidity_pct = models.DecimalField("Humedad Cámara (%)", max_digits=5, decimal_places=2, null=True, blank=True)
    scoring_score = models.IntegerField("Calificación Greñado (1-10)", null=True, blank=True)
    oven_temp_c = models.DecimalField("Temp. Horno (°C)", max_digits=5, decimal_places=2, null=True, blank=True)
    oven_time_min = models.DecimalField("Tiempo Horno (min)", max_digits=6, decimal_places=2, null=True, blank=True)
    final_volume_cc = models.DecimalField("Volumen Final (cc)", max_digits=10, decimal_places=2, null=True, blank=True)
    final_weight_g = models.DecimalField("Peso Cocido (g)", max_digits=10, decimal_places=2, null=True, blank=True)

    # Batido
    batter_speed = models.CharField("Velocidad Batido", max_length=50, blank=True, null=True)
    batter_time_min = models.DecimalField("Tiempo Batido (min)", max_digits=6, decimal_places=2, null=True, blank=True)
    batter_density_g_cm3 = models.DecimalField("Densidad Batido (g/cm3)", max_digits=6, decimal_places=3, null=True, blank=True)
    mold_diameter_cm = models.DecimalField("Diámetro Molde (cm)", max_digits=6, decimal_places=2, null=True, blank=True)
    raw_weight_g = models.DecimalField("Peso Crudo (g)", max_digits=10, decimal_places=2, null=True, blank=True)
    baked_weight_g = models.DecimalField("Peso Horneado (g)", max_digits=10, decimal_places=2, null=True, blank=True)
    baked_volume_height = models.DecimalField("Altura Horneado (cm)", max_digits=6, decimal_places=2, null=True, blank=True)

    # Compatibilidad Legacy
    humedad = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    gluten = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    w_fuerza = models.IntegerField(null=True, blank=True)
    pl_relacion = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    # Evaluación
    evaluation_data = models.JSONField("Datos de Evaluación", default=dict, blank=True)
    final_score = models.DecimalField("Puntaje Final", max_digits=4, decimal_places=2, null=True, blank=True)

    class Meta:
        verbose_name = "Ensayo"
        verbose_name_plural = "Ensayos de Laboratorio"

    def __str__(self):
        return f"{self.code} - {self.project.client.name}"
    
    def get_base_flour_name(self):
        """Devuelve el nombre de la harina base del ensayo."""
        detail = self.details.filter(ingredient__is_base_flour=True).first()
        return detail.ingredient.name if detail else "No especificada"

    def save(self, *args, **kwargs):
        if not self.code:
            current_year = timezone.now().year
            count = Ensayo.objects.filter(date__year=current_year).count() + 1
            self.code = f"ENS-{current_year}-{count:03d}"
        super().save(*args, **kwargs)

    def get_total_flour_weight(self):
        total = self.details.filter(ingredient__is_base_flour=True).aggregate(sum=models.Sum('quantity'))['sum']
        return total or Decimal('0.0000')

class EnsayoImage(models.Model):
    ensayo = models.ForeignKey(Ensayo, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField("Imagen", upload_to='ensayo_photos/')
    caption = models.CharField("Nota", max_length=255, blank=True, null=True)

# --- RECETA ---
class EnsayoDetail(models.Model):
    ensayo = models.ForeignKey(Ensayo, on_delete=models.CASCADE, related_name="details")
    ingredient = models.ForeignKey(Ingredient, on_delete=models.PROTECT, verbose_name="Ingrediente")
    # AUMENTAMOS PRECISIÓN A 9 DECIMALES (permite 0.000000001 KG)
    quantity = models.DecimalField("Cantidad (KG)", max_digits=15, decimal_places=9)
    # NUEVO: PRECIO POR KG POR ENSAYO
    price_per_kg = models.DecimalField("Precio por KG ($)", max_digits=15, decimal_places=4, default=Decimal('0.0000'))

    class Meta:
        verbose_name = "Línea de Receta"
        verbose_name_plural = "Formulación de la Receta"

    def __str__(self):
        return f"{self.ingredient.name}: {self.quantity}"

    def _get_total_harina_kg(self):
        total = self.ensayo.details.filter(ingredient__is_base_flour=True).aggregate(Sum('quantity'))['quantity__sum']
        return total if total else Decimal(0)

    @property
    def panadero_pct(self):
        if self.quantity is None: return 0
        total_kg = self._get_total_harina_kg()
        if total_kg == 0: return 0
        return (self.quantity / total_kg) * 100

    @property
    def ppm_calc(self):
        if self.quantity is None: return 0
        total_harina_kg = self._get_total_harina_kg()
        if total_harina_kg == 0: return 0
        return (self.quantity / total_harina_kg) * 1000000

    @property
    def dosis_25kg(self):
        if self.quantity is None: return 0
        total_harina_kg = self._get_total_harina_kg()
        if total_harina_kg == 0: return 0
        return (self.quantity / total_harina_kg) * 25000

class TechnicalReport(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="reports", verbose_name="Proyecto")
    report_date = models.DateField("Fecha del Informe", default=timezone.now)
    start_date = models.DateField("Fecha Inicio Rango")
    end_date = models.DateField("Fecha Fin Rango")
    technical_observations = models.TextField("Observaciones Técnicas / Conclusiones")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Informe Técnico"
        verbose_name_plural = "Historial de Informes Técnicos"
        ordering = ['-report_date', '-created_at']

    def __str__(self):
        return f"Informe {self.project.name} - {self.report_date}"
# --- RECLAMOS TÉCNICOS ---
class Complaint(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="complaints", verbose_name="Proyecto")
    delivery_date = models.DateField("Fecha Entrega", null=True, blank=True)
    loading_date = models.DateField("Fecha Carga", default=timezone.now)
    batch = models.CharField("Lote / Partida", max_length=100, blank=True, null=True)
    flour_type = models.CharField("Tipo de Harina", max_length=255, blank=True, null=True)
    product_made = models.CharField("Producto Elaborado", max_length=255, blank=True, null=True)
    process_type = models.CharField("Tipo de Proceso", max_length=255, blank=True, null=True)
    description = models.TextField("Descripción del Reclamo", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reclamo"
        verbose_name_plural = "Reclamos Técnicos"
        ordering = ['-loading_date', '-created_at']

    def __str__(self):
        return f"Reclamo - {self.project.client.name} - {self.loading_date}"

class ComplaintImage(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField("Imagen Reclamo", upload_to='complaint_photos/')
    caption = models.CharField("Nota", max_length=255, blank=True, null=True)
