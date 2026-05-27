from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('lab', '0019_complaint_contact'),
    ]

    operations = [
        migrations.AddField(
            model_name='complaint',
            name='direct_client',
            field=models.CharField(blank=True, max_length=255, null=True, verbose_name='Cliente Directo'),
        ),
    ]
