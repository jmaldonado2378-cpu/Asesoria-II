from django.contrib import admin
from django.utils.html import format_html
from .models import Client, Ingredient, Project, Visit, Ensayo, EnsayoDetail, EnsayoImage, ProjectIngredientPrice

class EnsayoDetailInline(admin.TabularInline):
    model = EnsayoDetail
    extra = 1
    fields = ('ingredient', 'quantity', 'show_panadero', 'show_ppm', 'show_25kg')
    readonly_fields = ('show_panadero', 'show_ppm', 'show_25kg')

    def show_panadero(self, obj):
        return f"{obj.panadero_pct:.2f} %"
    show_panadero.short_description = "% Panadero"

    def show_ppm(self, obj):
        return f"{obj.ppm_calc:.0f} ppm"
    show_ppm.short_description = "Dosis PPM"

    def show_25kg(self, obj):
        return f"{obj.dosis_25kg:.2f} g"
    show_25kg.short_description = "Dosis p/ 25kg"

class EnsayoImageInline(admin.StackedInline): # Using Stacked for better photo preview layout
    model = EnsayoImage
    extra = 1

class ProjectIngredientPriceInline(admin.TabularInline):
    model = ProjectIngredientPrice
    extra = 1

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'client_type', 'contact_1', 'phone_display', 'view_on_maps')
    list_filter = ('client_type',)
    search_fields = ('name', 'contact_1', 'contact_2', 'contact_3', 'cuit')
    
    def phone_display(self, obj):
        return obj.contact_1 or "-"
    phone_display.short_description = "Contacto Principal"

    def view_on_maps(self, obj):
        if obj.maps_url:
            return format_html('<a href="{}" target="_blank">📍 Ver Mapa</a>', obj.maps_url)
        elif obj.address:
            url = f"https://www.google.com/maps/search/?api=1&query={obj.address.replace(' ', '+')}"
            return format_html('<a href="{}" target="_blank">🔍 Buscar</a>', url)
        return "-"
    view_on_maps.short_description = "Ubicación"

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'brand', 'is_base_flour', 'recommended_dosage_ppm', 'default_price')
    list_filter = ('type', 'is_base_flour', 'brand')
    search_fields = ('name', 'brand', 'observations')

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'client', 'project_type', 'status', 'frequency', 'start_date')
    list_filter = ('project_type', 'status', 'frequency', 'client')
    search_fields = ('name', 'client__name', 'objective')
    inlines = [ProjectIngredientPriceInline]

@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ('date', 'start_time', 'end_time', 'get_client', 'project', 'kilometers', 'status')
    list_filter = ('date', 'project__client', 'project', 'status')
    search_fields = ('description', 'project__name', 'project__client__name')
    ordering = ('-date', '-start_time')
    
    def get_client(self, obj):
        if obj.project and obj.project.client:
            return obj.project.client.name
        if obj.client:
            return obj.client.name
        return "S/C"
    get_client.short_description = "Cliente"

@admin.register(Ensayo)
class EnsayoAdmin(admin.ModelAdmin):
    list_display = ('code', 'project', 'date', 'baking_type')
    list_filter = ('date', 'baking_type', 'project__client', 'project')
    search_fields = ('code', 'description', 'conclusion')
    readonly_fields = ('code',)
    inlines = [EnsayoDetailInline, EnsayoImageInline]

    fieldsets = (
        ('Datos Generales', {
            'fields': (('project', 'date'), ('code', 'baking_type'))
        }),
        ('Análisis de Laboratorio', {
            'classes': ('collapse',),
            'description': 'Parámetros físico-químicos y reológicos de la harina/mezcla',
            'fields': (
                ('humidity_pct', 'ash_pct', 'protein_pct'),
                ('gluten_wet_pct', 'gluten_dry_pct', 'gluten_index_pct'),
                ('color_l', 'color_a', 'color_b'),
                ('w_value', 'p_value', 'l_value', 'pl_ratio'),
                ('falling_number_sec', 'water_absorption_pct'),
                ('development_time_min', 'stability_min'),
                ('starch_damage_pct', 'zeleny_ml', 'granulometry_pct'),
            )
        }),
        ('Proceso: FERMENTADOS (Panes)', {
            'classes': ('collapse',),
            'fields': (
                ('kneading_time_min', 'kneading_temp_c', 'sobado_turns'),
                ('piece_weight_g', 'fermentation_time_min', 'fermentation_temp_c'),
                ('fermentation_humidity_pct', 'scoring_score'),
                ('oven_temp_c', 'oven_time_min'),
                ('final_volume_cc', 'final_weight_g'),
            )
        }),
        ('Proceso: BATIDOS (Budines)', {
            'classes': ('collapse',),
            'fields': (
                ('batter_speed', 'batter_time_min', 'batter_density_g_cm3'),
                ('mold_diameter_cm', 'raw_weight_g'),
                ('baked_weight_g', 'baked_volume_height'),
            )
        }),
        ('Conclusiones', {
            'fields': ('description', 'conclusion')
        }),
    )

    def save_model(self, request, obj, form, change):
        # We handle auto-coding in models.py, but we can add meta-data here if needed
        super().save_model(request, obj, form, change)