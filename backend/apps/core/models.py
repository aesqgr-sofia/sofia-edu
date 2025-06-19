import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date
from dateutil.relativedelta import relativedelta

# For the teaching staff, we'll reference the custom user model.
User = settings.AUTH_USER_MODEL

# Set Global entities
class Region(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.name

class SpecificCompetences(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='specific_competences')
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE, related_name='competences_set', null=True)
    year = models.ForeignKey('Year', on_delete=models.CASCADE, related_name='specific_competences', null=True)
    code = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    evaluation_criteria = ArrayField(
        models.JSONField(),
        blank=True,
        null=True,
        default=list,
        help_text="List of evaluation criteria objects with id, code, and "
                  "description. Each criterion should have a unique code "
                  "within the competence."
    )

    def __str__(self):
        subject_name = self.subject.name if self.subject else "No Subject"
        year_name = self.year.name if self.year else "No Year"
        return f'{self.region} - {subject_name} - {year_name} - {self.code}'
    
    class Meta:
        verbose_name = "Specific Competence"
        verbose_name_plural = "Specific Competences"
        # Adding constraints to make competences more organized
        constraints = [
            models.UniqueConstraint(
                fields=['region', 'subject', 'year', 'code'],
                name='unique_competence_code_per_subject_year'
            )
        ]

class Year(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    division = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Suggestion: Enter A for 1º ESO A, B for 1º ESO B. Leave blank if no divisions exist."
    )

    def __str__(self):
        # If no division is provided, show just the name.
        return f"{self.name} - {self.division}" if self.division else self.name


class SchoolType(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # This field holds the set of default Year definitions associated with the school type.
    default_years = models.ManyToManyField(Year, blank=True, related_name='+')
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name


class School(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    teaching_staff = models.ManyToManyField(User, related_name='schools', blank=True,)
    region = models.ForeignKey(Region, on_delete=models.PROTECT, related_name='schools', blank=True, null=True)
    school_type = models.ForeignKey(SchoolType, on_delete=models.PROTECT, related_name='schools', blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    years = models.ManyToManyField(Year, blank=True, related_name='+')

    def __str__(self):
        return self.name

class Subject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    year = models.ForeignKey(
        Year,
        on_delete=models.SET_NULL,
        null=True,           # Allow the field to be null
        blank=True,          # Optional: allow blank values in forms
        related_name='subjects'
    )
    region = models.ForeignKey(
        Region,
        on_delete=models.SET_NULL,
        null=True,           # Allow the field to be null
        blank=True,          # Optional: allow blank values in forms
        related_name='subjects'
    )    
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subjects')
    teaching_staff = models.ManyToManyField(User, related_name='subjects', blank=True)
    specific_competences = models.ManyToManyField(SpecificCompetences, related_name='subjects', blank=True)
    
    def __str__(self):
        return f"Subject {self.name} - {self.school}"


class LearningSituation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    year = models.ForeignKey(
        Year,
        on_delete=models.SET_NULL,
        null=True,           # Allow the field to be null
        blank=True,          # Optional: allow blank values in forms
        related_name='learning_situations'
    )
    region = models.ForeignKey(
        Region,         
        on_delete=models.SET_NULL,
        null=True,           # Allow the field to be null
        blank=True,          # Optional: allow blank values in forms
        related_name='learning_situations')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='learning_situations')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='learning_situations')
    teaching_staff = models.ManyToManyField(User, related_name='learning_situations', blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    specific_competences = models.ManyToManyField(SpecificCompetences, related_name='learning_situations', blank=True)
    modules = models.ManyToManyField('Module', related_name='learning_situations', blank=True)
    
    def __str__(self):
        return self.title


class Module(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='modules')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='modules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='modules')
    teaching_staff = models.ManyToManyField(User, related_name='modules', blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_start = models.DateField(null=True, blank=True)
    date_end = models.DateField(null=True, blank=True)
    session_length = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Session length in hours (e.g., 1.5, 2, 2.5)"
    )
    evaluable = models.BooleanField(
        default=False,
        help_text="Whether this module can be evaluated by the teacher"
    )
    specific_competences = ArrayField(
        base_field=models.UUIDField(), 
        blank=True,
        null=True,
        default=list,
        help_text="List of specific competence UUIDs"
    )
    selected_criteria = models.JSONField(
        blank=True,
        null=True,
        default=dict,
        help_text="JSON mapping competence IDs to lists of selected evaluation criteria IDs"
    )
    basic_knowledge = ArrayField(
        base_field=models.UUIDField(), 
        blank=True, 
        null=True,
        default=list,
        help_text="List of basic knowledge UUIDs"
    )
    content = ArrayField(
        base_field=models.UUIDField(), 
        blank=True, 
        null=True,
        default=list,
        help_text="List of content UUIDs"
    )
    files = models.JSONField(
        blank=True,
        null=True,
        default=list,
        help_text="List of file attachments with metadata"
    )
    
    def __str__(self):
        return self.title

class SchoolCalendar(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='calendars')
    academic_year = models.CharField(max_length=9)  # Format: 2023-2024
    start_date = models.DateField()
    end_date = models.DateField()
    
    def __str__(self):
        return f"{self.school.name} - {self.academic_year}"

class Term(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    calendar = models.ForeignKey(SchoolCalendar, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=255)  # e.g., "First Term", "Second Term"
    start_date = models.DateField()
    end_date = models.DateField()
    
    def __str__(self):
        return f"{self.calendar.academic_year} - {self.name}"

class ScheduledLearningSituation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learning_situation = models.ForeignKey(LearningSituation, on_delete=models.CASCADE, related_name='schedules')
    term = models.ForeignKey(Term, on_delete=models.CASCADE, related_name='scheduled_situations')
    start_date = models.DateField()
    end_date = models.DateField()
    order = models.IntegerField(default=0)  # For ordering within the term
    
    class Meta:
        ordering = ['term', 'order', 'start_date']
    
    def __str__(self):
        return f"{self.learning_situation.title} ({self.start_date} - {self.end_date})"

@receiver(post_save, sender=School)
def create_school_calendar(sender, instance, created, **kwargs):
    if created:
        # Get current year or next year if we're close to September
        today = date.today()
        if today.month >= 7:  # If we're in July or later
            start_year = today.year
        else:
            start_year = today.year - 1

        # Create school calendar
        calendar = SchoolCalendar.objects.create(
            school=instance,
            academic_year=f"{start_year}-{start_year + 1}",
            start_date=date(start_year, 9, 1),  # September 1st
            end_date=date(start_year + 1, 6, 30),  # June 30th
        )

        # Create three terms
        Term.objects.create(
            calendar=calendar,
            name="First Term",
            start_date=date(start_year, 9, 1),
            end_date=date(start_year, 12, 22)
        )

        Term.objects.create(
            calendar=calendar,
            name="Second Term",
            start_date=date(start_year + 1, 1, 8),
            end_date=date(start_year + 1, 3, 31)
        )

        Term.objects.create(
            calendar=calendar,
            name="Third Term",
            start_date=date(start_year + 1, 4, 1),
            end_date=date(start_year + 1, 6, 30)
        )

# Add this new model for Planning Units
class PlanningUnit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='planning_units')
    unit_number = models.IntegerField(help_text="The sequence number of this unit in the plan")
    learning_situation = models.ForeignKey(
        LearningSituation, 
        on_delete=models.CASCADE, 
        related_name='unit_placements',
        null=True,
        blank=True
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    title = models.CharField(max_length=255, blank=True, null=True, 
                           help_text="Optional custom title for this unit")
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['subject', 'unit_number']
        ordering = ['subject', 'unit_number']
    
    def __str__(self):
        return f"Unit {self.unit_number}: {self.subject.name} - {self.learning_situation.title if self.learning_situation else 'Empty'}"
