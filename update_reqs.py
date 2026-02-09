requirements = """asgiref==3.11.1
diff-match-patch==20241021
dj-database-url==3.1.0
Django==5.1.6
django-cors-headers==4.9.0
django-import-export==4.4.0
djangorestframework==3.16.1
et_xmlfile==2.0.0
openpyxl==3.1.5
pillow==12.1.0
psycopg2-binary
python-dotenv==1.2.1
sqlparse==0.5.5
tablib==3.9.0
tzdata==2025.3
whitenoise==6.11.0
"""

with open('backend/requirements.txt', 'wb') as f:
    f.write(requirements.encode('utf-8'))

print("Updated backend/requirements.txt successfully with psycopg2-binary")
