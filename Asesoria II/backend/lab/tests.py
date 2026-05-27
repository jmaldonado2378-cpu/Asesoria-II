from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.db.models import ProtectedError
from .models import Client, Project, Ingredient, ProjectIngredientPrice, Ensayo, EnsayoDetail
from .services import BakeryCalculator

class BakeryLabTests(APITestCase):
    
    def setUp(self):
        # Base data for all tests
        self.client_a = Client.objects.create(name="Cliente A")
        self.project_a = Project.objects.create(name="Proyecto A", client=self.client_a)
        
        self.harina = Ingredient.objects.create(
            name="Harina 000", 
            is_base_flour=True, 
            default_price=Decimal('1.0000')
        )
        self.enzima = Ingredient.objects.create(
            name="Enzima Alpha", 
            is_base_flour=False, 
            default_price=Decimal('50.0000')
        )

    def test_scenario_1_ppm_math(self):
        """
        Verify that creating an Ensayo via API correctly calculates PPM dosage.
        Scenario: 10kg Flour + 1g Enzyme = 100 PPM
        Formula: (0.001 / 10) * 1,000,000 = 100.0000
        """
        url = reverse('ensayo-list') # Standard DRF router name for 'ensayos'
        data = {
            "project": self.project_a.id,
            "code": "ENS-TEST-001",
            "description": "Test de PPM Physics",
            "details": [
                {
                    "ingredient": self.harina.id,
                    "quantity": "10.0000"
                },
                {
                    "ingredient": self.enzima.id,
                    "quantity": "0.0010"
                }
            ]
        }
        
        # API Call (Triggers perform_create handles recalculate_ppms)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify the calculation in the database
        ensayo = Ensayo.objects.get(code="ENS-TEST-001")
        enzima_detail = ensayo.details.get(ingredient=self.enzima)
        
        # Check PPM value
        self.assertEqual(enzima_detail.dosage_ppm, Decimal('100.0000'))
        print(f"\n✅ Scenario 1 Passed: PPM calculated as {enzima_detail.dosage_ppm}")

    def test_scenario_2_contextual_price(self):
        """
        Verify financial logic: Project-specific price vs Default price.
        """
        mejorador = Ingredient.objects.create(
            name="Mejorador S500", 
            default_price=Decimal('10.0000')
        )
        
        client_b = Client.objects.create(name="Cliente B")
        project_b = Project.objects.create(name="Proyecto B", client=client_b)
        
        # 1. Set custom price for Project A ONLY ($8.00)
        ProjectIngredientPrice.objects.create(
            project=self.project_a, 
            ingredient=mejorador, 
            price=Decimal('8.0000')
        )
        
        # 2. Setup trial for Project A
        ensayo_a = Ensayo.objects.create(project=self.project_a, code="ENS-A")
        EnsayoDetail.objects.create(ensayo=ensayo_a, ingredient=mejorador, quantity=Decimal('1.0000'))
        
        # 3. Setup trial for Project B
        ensayo_b = Ensayo.objects.create(project=project_b, code="ENS-B")
        EnsayoDetail.objects.create(ensayo=ensayo_b, ingredient=mejorador, quantity=Decimal('1.0000'))
        
        # Assertion: Project A uses custom price ($8), Project B uses default ($10)
        cost_a = BakeryCalculator.calculate_total_cost(ensayo_a)
        cost_b = BakeryCalculator.calculate_total_cost(ensayo_b)
        
        self.assertEqual(cost_a, Decimal('8.0000'))
        self.assertEqual(cost_b, Decimal('10.0000'))
        print(f"✅ Scenario 2 Passed: Project A Cost (${cost_a}), Project B Cost (${cost_b})")

    def test_scenario_3_integrity_protection(self):
        """
        Ensure ingredients used in trials cannot be deleted from the master database.
        """
        ensayo = Ensayo.objects.create(project=self.project_a, code="ENS-HIST")
        EnsayoDetail.objects.create(ensayo=ensayo, ingredient=self.harina, quantity=Decimal('1.0000'))
        
        # Attempting to delete the ingredient must raise ProtectedError
        with self.assertRaises(ProtectedError):
            self.harina.delete()
        
        print("✅ Scenario 3 Passed: Ingredient deletion blocked by historical trial records.")
