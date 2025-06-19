from django.contrib import admin
from django import forms
import json
from .models import School, Year, Subject, LearningSituation, Module, SchoolType, Region, SpecificCompetences, PlanningUnit

class SpecificCompetencesAdminForm(forms.ModelForm):
    """Custom form for SpecificCompetences to handle evaluation_criteria properly"""
    evaluation_criteria_display = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 10, 'cols': 80}),
        required=False,
        help_text="JSON array of evaluation criteria objects. Each object should have 'id', 'code', and 'description' fields."
    )
    
    class Meta:
        model = SpecificCompetences
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.evaluation_criteria:
            # Convert the evaluation_criteria to a formatted JSON string for display
            try:
                self.fields['evaluation_criteria_display'].initial = json.dumps(
                    self.instance.evaluation_criteria, indent=2, ensure_ascii=False
                )
            except (TypeError, ValueError):
                self.fields['evaluation_criteria_display'].initial = str(self.instance.evaluation_criteria)
        
        # Hide the original field to avoid conflicts
        if 'evaluation_criteria' in self.fields:
            self.fields['evaluation_criteria'].widget = forms.HiddenInput()
    
    def clean_evaluation_criteria_display(self):
        """Validate and parse the JSON input"""
        value = self.cleaned_data.get('evaluation_criteria_display', '')
        if not value.strip():
            return []
        
        try:
            parsed = json.loads(value)
            if not isinstance(parsed, list):
                raise forms.ValidationError("evaluation_criteria must be a JSON array")
            
            # Validate each criterion object
            for i, criterion in enumerate(parsed):
                if not isinstance(criterion, dict):
                    raise forms.ValidationError(f"Criterion {i} must be a JSON object")
                if 'id' not in criterion:
                    raise forms.ValidationError(f"Criterion {i} must have an 'id' field")
                if 'description' not in criterion:
                    raise forms.ValidationError(f"Criterion {i} must have a 'description' field")
            
            return parsed
        except json.JSONDecodeError as e:
            raise forms.ValidationError(f"Invalid JSON: {e}")
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        # Set the evaluation_criteria from the cleaned display field
        instance.evaluation_criteria = self.cleaned_data.get('evaluation_criteria_display', [])
        if commit:
            instance.save()
        return instance

@admin.register(SchoolType)
class SchoolTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    filter_horizontal = ('default_years',)

@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'school_type')
    list_filter = ('region', 'school_type')
    search_fields = ('name',)
    raw_id_fields = ('region',)
    filter_horizontal = ('teaching_staff', 'years')

@admin.register(Year)
class YearAdmin(admin.ModelAdmin):
    list_display = ('name', 'division')
    search_fields = ('name', 'division')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'year', 'region', 'school')
    list_filter = ('region', 'year', 'school')
    search_fields = ('name', 'description')
    raw_id_fields = ('year', 'region', 'school')
    filter_horizontal = ('teaching_staff', 'specific_competences')

@admin.register(LearningSituation)
class LearningSituationAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'year', 'school')
    list_filter = ('subject', 'year', 'school')
    search_fields = ('title', 'description')
    raw_id_fields = ('year', 'region', 'subject', 'school')
    filter_horizontal = ('teaching_staff', 'specific_competences', 'modules')

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'year', 'school', 'evaluable')
    list_filter = ('evaluable', 'subject', 'year', 'school')
    search_fields = ('title', 'description')
    raw_id_fields = ('year', 'school', 'subject')
    filter_horizontal = ('teaching_staff',)

@admin.register(SpecificCompetences)
class SpecificCompetencesAdmin(admin.ModelAdmin):
    form = SpecificCompetencesAdminForm
    list_display = ('code', 'description', 'region', 'subject', 'year')
    list_filter = ('region', 'subject', 'year')
    search_fields = ('code', 'description')
    raw_id_fields = ('region', 'subject', 'year')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('region', 'subject', 'year', 'code', 'description')
        }),
        ('Evaluation Criteria', {
            'fields': ('evaluation_criteria_display',),
            'description': 'Enter evaluation criteria as a JSON array. Example: [{"id": "1", "code": "CE1.1", "description": "Criterion description"}]'
        }),
    )

@admin.register(PlanningUnit)
class PlanningUnitAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'unit_number', 'learning_situation')
    list_filter = ('subject',)
    search_fields = ('title', 'notes', 'subject__name')
    raw_id_fields = ('subject', 'learning_situation')