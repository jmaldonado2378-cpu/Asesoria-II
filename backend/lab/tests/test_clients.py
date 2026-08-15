from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from lab.models import Client

class ClientTests(APITestCase):

    def setUp(self):
        self.url = reverse('client-list')
        self.valid_data = {
            "name": "Cliente Nuevo",
            "contact_name": "Juan Perez",
            "email": "juan@example.com",
            "phone": "123456789"
        }

    def test_create_client_valid_data(self):
        res = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Client.objects.count(), 1)
        self.assertEqual(Client.objects.get().name, 'Cliente Nuevo')

    def test_create_client_duplicate_name(self):
        self.client.post(self.url, self.valid_data, format='json')
        # Intentar crear otro con el mismo nombre
        res = self.client.post(self.url, self.valid_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', res.data)

    def test_create_client_invalid_email(self):
        data = self.valid_data.copy()
        data['email'] = "correo-invalido"
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_create_client_with_contacts_data_syncs_legacy(self):
        data = {
            "name": "Cliente Complejo",
            "contacts_data": [
                {
                    "name": "Contacto Principal",
                    "position": "Gerente",
                    "phone": "987654321",
                    "email": "gerente@example.com"
                }
            ]
        }
        res = self.client.post(self.url, data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        
        # Verificar que sincronizó los campos legacy
        client_obj = Client.objects.get(id=res.data['id'])
        self.assertEqual(client_obj.contact_name, "Contacto Principal")
        self.assertEqual(client_obj.position, "Gerente")
        self.assertEqual(client_obj.phone, "987654321")
        self.assertEqual(client_obj.email, "gerente@example.com")

    def test_update_client_preserves_contacts(self):
        # Crear primero
        data = {
            "name": "Cliente Update",
            "contacts_data": [
                {
                    "name": "Contacto 1",
                    "position": "Rol",
                    "phone": "111",
                    "email": "1@1.com"
                }
            ]
        }
        create_res = self.client.post(self.url, data, format='json')
        client_id = create_res.data['id']
        
        # Actualizar
        update_url = reverse('client-detail', args=[client_id])
        update_data = {
            "name": "Cliente Update Modificado"
        }
        update_res = self.client.patch(update_url, update_data, format='json')
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        
        # Verificar preservación
        client_obj = Client.objects.get(id=client_id)
        self.assertEqual(client_obj.name, "Cliente Update Modificado")
        self.assertEqual(client_obj.contact_name, "Contacto 1")
        self.assertEqual(len(client_obj.contacts_data), 1)

    def test_delete_client(self):
        create_res = self.client.post(self.url, self.valid_data, format='json')
        client_id = create_res.data['id']
        
        delete_url = reverse('client-detail', args=[client_id])
        res = self.client.delete(delete_url)
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Client.objects.count(), 0)
