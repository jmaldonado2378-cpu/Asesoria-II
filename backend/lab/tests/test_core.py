from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from django.db.models import ProtectedError
from lab.models import Client, Project, Ingredient, ProjectIngredientPrice, Ensayo, EnsayoDetail
from lab.services import BakeryCalculator

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
        Verify that creating an Ensayo and details via API correctly calculates PPM dosage.
        Scenario: 10kg Flour + 1g Enzyme = 100 PPM
        Formula: (0.001 / 10) * 1,000,000 = 100.0
        """
        # 1. Create the trial (Ensayo) via API
        url_ensayo = reverse('ensayo-list')
        data_ensayo = {
            "project": self.project_a.id,
            "description": "Test de PPM Physics"
        }
        res_ensayo = self.client.post(url_ensayo, data_ensayo, format='json')
        self.assertEqual(res_ensayo.status_code, status.HTTP_201_CREATED)
        ensayo_id = res_ensayo.data['id']

        # 2. Add details via API
        url_detail = reverse('ensayodetail-list')
        
        # Harina detail (10 kg)
        data_flour = {
            "ensayo": ensayo_id,
            "ingredient": self.harina.id,
            "quantity": "10.000000000"
        }
        res_flour = self.client.post(url_detail, data_flour, format='json')
        self.assertEqual(res_flour.status_code, status.HTTP_201_CREATED)

        # Enzyme detail (0.001 kg = 1 g)
        data_enzyme = {
            "ensayo": ensayo_id,
            "ingredient": self.enzima.id,
            "quantity": "0.001000000"
        }
        res_enzyme = self.client.post(url_detail, data_enzyme, format='json')
        self.assertEqual(res_enzyme.status_code, status.HTTP_201_CREATED)

        # 3. Retrieve the enzyme detail and verify the calculated PPM value
        ensayo_obj = Ensayo.objects.get(id=ensayo_id)
        enzima_detail = ensayo_obj.details.get(ingredient=self.enzima)
        
        # Check PPM value property
        self.assertEqual(float(enzima_detail.ppm_calc), 100.0)
        print(f"\n[OK] Scenario 1 Passed: PPM calculated as {enzima_detail.ppm_calc}")

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
        print(f"[OK] Scenario 2 Passed: Project A Cost (${cost_a}), Project B Cost (${cost_b})")

    def test_scenario_3_integrity_protection(self):
        """
        Ensure ingredients used in trials cannot be deleted from the master database.
        """
        ensayo = Ensayo.objects.create(project=self.project_a, code="ENS-HIST")
        EnsayoDetail.objects.create(ensayo=ensayo, ingredient=self.harina, quantity=Decimal('1.0000'))
        
        # Attempting to delete the ingredient must raise ProtectedError
        with self.assertRaises(ProtectedError):
            self.harina.delete()
        
        print("[OK] Scenario 3 Passed: Ingredient deletion blocked by historical trial records.")
