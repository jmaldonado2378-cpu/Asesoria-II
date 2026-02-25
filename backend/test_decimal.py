import os, sys, django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from decimal import Decimal
from lab.models import EnsayoDetail, Ensayo, Ingredient

try:
    e = Ensayo.objects.first()
    i = Ingredient.objects.first()
    if not e or not i:
        print("No ensayo or ingredient found")
        sys.exit(0)
    
    # Let's try to simulate what the frontend sends for 0,24 grams:
    # 0,24 g -> 0.00024 kg
    val_kg = Decimal('0.00024')
    
    d = EnsayoDetail(ensayo=e, ingredient=i, quantity=val_kg, price_per_kg=Decimal('0'))
    d.full_clean()
    d.save()
    print("SAVED SUCCESSFULLY. ID:", d.id)
    d.delete()
except Exception as ex:
    print("ERROR CAUGHT:")
    print(ex)
