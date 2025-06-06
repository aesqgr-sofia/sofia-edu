# sofia/backend/apps/accounts/signals.py
from django.contrib.auth.models import Group
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

@receiver(post_save, sender=User)
def add_teacher_to_group(sender, instance, created, **kwargs):
    print("Signal fired for user:", instance.username, "created:", created, "role:", instance.role)
    if instance.role == User.Roles.TEACHER:
        teachers_group, _ = Group.objects.get_or_create(name="Teachers")
        if teachers_group not in instance.groups.all():
            print("Adding", instance.username, "to Teachers group.")
            instance.groups.add(teachers_group)
        else:
            print(instance.username, "is already in Teachers group.")
    else:
        try:
            teachers_group = Group.objects.get(name="Teachers")
            if teachers_group in instance.groups.all():
                print("Removing", instance.username, "from Teachers group.")
                instance.groups.remove(teachers_group)
        except Group.DoesNotExist:
            print("Teachers group does not exist.")
