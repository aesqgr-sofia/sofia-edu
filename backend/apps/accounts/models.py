from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        SCHOOL = 'school', 'School'
        TEACHER = 'teacher', 'Teacher'

    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default='',
        blank=True,
        help_text="Designates the type of user."
    )
    school = models.ForeignKey(
        'core.School',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
