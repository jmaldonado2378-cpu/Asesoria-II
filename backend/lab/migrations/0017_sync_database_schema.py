from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0016_complaint_complaintimage'),
    ]

    def database_check(apps, schema_editor):
        if schema_editor.connection.vendor != 'postgresql':
            print("Skipping sync_database_schema for non-postgresql database.")
            return

    operations = [
        # Usamos RunSQL con una lista vacía si no es postgresql para evitar errores de sintaxis en el parser de sqlite
        migrations.RunSQL(
            sql="SELECT 1;", 
            reverse_sql="SELECT 1;"
        ),
    ]

    # Solo añadimos las operaciones reales si es PostgreSQL (Render)
    # En local (SQLite), las tablas ya se crearon con las migraciones 0015 y 0016 estándar
    import sys
    if 'postgresql' in sys.argv or any('postgres' in arg for arg in sys.argv) or True:
        # Nota: En Django, las operaciones se definen en la clase.
        # Mejor usamos una función que ejecute el SQL solo si es postgres
        def sync_if_postgres(apps, schema_editor):
            if schema_editor.connection.vendor != 'postgresql':
                return
            
            cursor = schema_editor.connection.cursor()
            sql_statements = [
                "ALTER TABLE lab_project ADD COLUMN IF NOT EXISTS technical_observations text;",
                "CREATE TABLE IF NOT EXISTS lab_technicalreport (id bigserial PRIMARY KEY);",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS report_date date;",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS start_date date;",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS end_date date;",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS technical_observations text;",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();",
                "ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS project_id bigint;",
                "CREATE TABLE IF NOT EXISTS lab_complaint (id bigserial PRIMARY KEY);",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS project_id bigint;",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS delivery_date date;",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS loading_date date;",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS batch varchar(100);",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS flour_type varchar(255);",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS product_made varchar(255);",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS process_type varchar(255);",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS description text;",
                "ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();",
                "CREATE TABLE IF NOT EXISTS lab_complaintimage (id bigserial PRIMARY KEY);",
                "ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS complaint_id bigint;",
                "ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS image varchar(100);",
                "ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS caption varchar(255);",
            ]
            for sql in sql_statements:
                try:
                    cursor.execute(sql)
                except Exception as e:
                    print(f"Sync skip: {sql} - {str(e)}")

        operations = [
            migrations.RunPython(sync_if_postgres),
        ]
