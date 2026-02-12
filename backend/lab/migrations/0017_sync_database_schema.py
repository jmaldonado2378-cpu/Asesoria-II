from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0016_complaint_complaintimage'),
    ]

    operations = [
        # Project table - ensure technical_observations exists
        migrations.RunSQL("ALTER TABLE lab_project ADD COLUMN IF NOT EXISTS technical_observations text;"),
        
        # TechnicalReport table
        migrations.RunSQL("CREATE TABLE IF NOT EXISTS lab_technicalreport (id bigserial PRIMARY KEY);"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS report_date date;"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS start_date date;"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS end_date date;"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS technical_observations text;"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();"),
        migrations.RunSQL("ALTER TABLE lab_technicalreport ADD COLUMN IF NOT EXISTS project_id bigint;"),
        
        # Complaint table
        migrations.RunSQL("CREATE TABLE IF NOT EXISTS lab_complaint (id bigserial PRIMARY KEY);"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS project_id bigint;"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS delivery_date date;"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS loading_date date;"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS batch varchar(100);"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS flour_type varchar(255);"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS product_made varchar(255);"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS process_type varchar(255);"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS description text;"),
        migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();"),
        
        # ComplaintImage table
        migrations.RunSQL("CREATE TABLE IF NOT EXISTS lab_complaintimage (id bigserial PRIMARY KEY);"),
        migrations.RunSQL("ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS complaint_id bigint;"),
        migrations.RunSQL("ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS image varchar(100);"),
        migrations.RunSQL("ALTER TABLE lab_complaintimage ADD COLUMN IF NOT EXISTS caption varchar(255);"),
    ]
