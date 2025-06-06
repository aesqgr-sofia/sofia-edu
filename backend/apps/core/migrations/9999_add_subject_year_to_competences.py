# Generated manually for SpecificCompetences updates

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),  # Just depend on the initial migration
    ]

    operations = [
        migrations.AddField(
            model_name='specificcompetences',
            name='subject',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='competences_set', to='core.subject'),
        ),
        migrations.AddField(
            model_name='specificcompetences',
            name='year',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='specific_competences', to='core.year'),
        ),
        migrations.AlterModelOptions(
            name='specificcompetences',
            options={'verbose_name': 'Specific Competence', 'verbose_name_plural': 'Specific Competences'},
        ),
        migrations.AddConstraint(
            model_name='specificcompetences',
            constraint=models.UniqueConstraint(fields=('region', 'subject', 'year', 'code'), name='unique_competence_code_per_subject_year'),
        ),
        migrations.AlterField(
            model_name='module',
            name='teaching_staff',
            field=models.ManyToManyField(blank=True, related_name='modules', to=settings.AUTH_USER_MODEL),
        ),
    ] 