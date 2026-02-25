import requests

url = "https://app-asesoria.onrender.com/api/generar-informe-tecnico-estandar/"
data = {
    "project": 4,
    "start_date": "2024-02-01",
    "end_date": "2024-02-28",
    "technical_observations": "Test ping",
    "save_to_history": False,
    "format": "pdf"
}

try:
    print(f"Pinging {url}...")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Error: {e}")
