from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0017_sync_database_schema'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS status varchar(20) DEFAULT 'Abierto';"),
                migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS technical_conclusion text;"),
                migrations.RunSQL("ALTER TABLE lab_complaint ADD COLUMN IF NOT EXISTS corrective_action text;"),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='complaint',
                    name='status',
                    field=models.CharField(choices=[('Abierto', 'Abierto'), ('En Proceso', 'En Proceso'), ('Cerrado', 'Cerrado')], default='Abierto', max_length=20, verbose_name='Estado'),
                ),
                migrations.AddField(
                    model_name='complaint',
                    name='technical_conclusion',
                    field=models.TextField(blank=True, null=True, verbose_name='Conclusión Técnica'),
                ),
                migrations.AddField(
                    model_name='complaint',
                    name='corrective_action',
                    field=models.TextField(blank=True, null=True, verbose_name='Acción Correctiva'),
                ),
            ]
        ),
    ]
