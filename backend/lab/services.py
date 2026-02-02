from decimal import Decimal
from django.db.models import Sum
from .models import Ensayo, ProjectIngredientPrice

class BakeryCalculator:
    @staticmethod
    def calculate_total_cost(ensayo: Ensayo) -> Decimal:
        """
        Calculates cost based on Project Context.
        Priority: 1. ProjectSpecificPrice -> 2. IngredientDefaultPrice
        """
        total_cost = Decimal('0.0000')
        project = ensayo.project
        # Fetch custom prices in one query for performance
        custom_prices = {
            p.ingredient_id: p.price 
            for p in ProjectIngredientPrice.objects.filter(project=project)
        }

        for line in ensayo.details.select_related('ingredient').all():
            price = custom_prices.get(line.ingredient.id, line.ingredient.default_price)
            total_cost += line.quantity * price
        
        return total_cost

    @staticmethod
    def recalculate_ppms(ensayo: Ensayo):
        """
        Formula: (Additive Weight / Total Base Flour Weight) * 1,000,000
        """
        total_flour = ensayo.get_total_flour_weight()
        # Ensure we don't divide by zero
        if not total_flour or total_flour == Decimal('0.0000'): 
            return

        updates = []
        for line in ensayo.details.all():
            if not line.ingredient.is_base_flour:
                line.dosage_ppm = (line.quantity / total_flour) * Decimal('1000000')
                updates.append(line)
        
        if updates:
            ensayo.details.model.objects.bulk_update(updates, ['dosage_ppm'])
