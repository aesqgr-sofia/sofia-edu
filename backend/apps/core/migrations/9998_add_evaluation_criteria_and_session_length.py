# Generated manually for evaluation criteria and session length

from django.db import migrations, models
from django.contrib.postgres.fields import ArrayField


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),  # Base dependency
    ]

    operations = [
        migrations.AddField(
            model_name='specificcompetences',
            name='evaluation_criteria',
            field=ArrayField(
                models.JSONField(),
                blank=True,
                null=True,
                default=list,
                help_text="List of evaluation criteria objects with id and description"
            ),
        ),
        migrations.AddField(
            model_name='module',
            name='session_length',
            field=models.DecimalField(
                max_digits=4,
                decimal_places=1,
                null=True,
                blank=True,
                help_text="Session length in hours (e.g., 1.5, 2, 2.5)"
            ),
        ),
        migrations.AddField(
            model_name='module',
            name='selected_criteria',
            field=models.JSONField(
                blank=True,
                null=True,
                default=dict,
                help_text="JSON mapping competence IDs to lists of selected evaluation criteria IDs"
            ),
        ),
    ] 