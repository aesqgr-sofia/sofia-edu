from django.contrib import admin
from .models import School, Year, Subject, LearningSituation, Module, SchoolType, Region, SpecificCompetences, PlanningUnit

@admin.register(SchoolType)
class SchoolTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    filter_horizontal = ('default_years',)

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'school_type', 'address', 'phone_number')
    list_filter = ('school_type',)
    search_fields = ('name',)
    filter_horizontal = ('years',)  # For easier selection and display of many-to-many Years

    def get_changeform_initial_data(self, request):
        initial = super().get_changeform_initial_data(request)
        try:
            # Retrieve the SchoolType instance with the name "Custom Years"
            custom_years = SchoolType.objects.get(name="Custom Years")
            initial['school_type'] = custom_years.pk
        except SchoolType.DoesNotExist:
            pass  # If it doesn't exist, leave the field blank
        return initial

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        obj = form.instance
        # If this is a new school (change is False) and a school type is selected,
        # then add the default years from the SchoolType.
        if not change and obj.school_type:
            default_years = obj.school_type.default_years.all()
            # Add the default years if they are not already in the school's years.
            for year in default_years:
                if not obj.years.filter(pk=year.pk).exists():
                    obj.years.add(year)

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ('name', 'division')
    search_fields = ('name',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'year', 'school')
    list_filter = ('school', 'name', 'year')
    filter_horizontal = ('teaching_staff',)  # For better selection of ManyToMany fields


@admin.register(LearningSituation)
class LearningSituationAdmin(admin.ModelAdmin):
    list_display = ('title', 'year', 'school', 'subject', 'date_start', 'date_end')
    list_filter = ('school', 'year', 'subject')
    filter_horizontal = ('teaching_staff',)


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'year', 'school', 'subject', 'date_start', 'date_end')
    list_filter = ('school', 'year', 'subject')
    filter_horizontal = ('teaching_staff',)

@admin.register(Region)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(SpecificCompetences)
class SpecificCompetencesAdmin(admin.ModelAdmin):
    list_display = ('code', 'description', 'region', 'subject', 'year')
    list_filter = ('region', 'subject', 'year')
    search_fields = ('code', 'description')
    raw_id_fields = ('region', 'subject', 'year')

@admin.register(PlanningUnit)
class PlanningUnitAdmin(admin.ModelAdmin):
    list_display = ('subject', 'unit_number', 'learning_situation', 'start_date', 'end_date')
    list_filter = ('subject',)
    search_fields = ('subject__name', 'learning_situation__title')
    raw_id_fields = ('subject', 'learning_situation')