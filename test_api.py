import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    'https://app-asesoria.onrender.com/api/ensayo-details/',
    data=json.dumps({
        "ensayo": 7,
        "ingredient": 10, # Assuming 10 could be some test ingredient. We just need to check if 0.000240000 fails validation on backend
        "quantity": "0.000240000",
        "price_per_kg": "0.0000"
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        print("SUCCESS:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code, e.read().decode())
except Exception as e:
    print("ERROR:", e)
