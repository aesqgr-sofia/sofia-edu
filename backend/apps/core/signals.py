from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import School, User


@receiver(post_save, sender=School)
def populate_default_years(sender, instance, created, **kwargs):
    if created:
        # Get the default years from the selected SchoolType.
        default_years = instance.school_type.default_years.all()
        if default_years:
            instance.years.set(default_years)
