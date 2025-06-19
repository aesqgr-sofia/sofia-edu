# core/serializers.py
from rest_framework import serializers
from .models import School, Year, Subject, LearningSituation, Module, Region, SchoolType, Term, SchoolCalendar, ScheduledLearningSituation, PlanningUnit, SpecificCompetences


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = (
            'id',
            'name',
            'description',
            'year',
            'region',
            'school',
            'teaching_staff',
            'specific_competences',
        )
        # Make school read-only so that it isn't expected from the payload.
        read_only_fields = ('school',)
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            validated_data['school'] = user.school
            validated_data['region'] = user.school.region if user.school else None
            validated_data.setdefault('teaching_staff', []).append(user.pk)
        else:
            raise serializers.ValidationError("User information is required.")
        return super().create(validated_data)

class YearSerializer(serializers.ModelSerializer):
    subjects = SubjectSerializer(many=True, read_only=True)

    class Meta:
        model = Year
        fields = ('id', 'name', 'division', 'subjects')

class LearningSituationSerializer(serializers.ModelSerializer):
    modules = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Module.objects.all(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = LearningSituation
        fields = [
            'id', 
            'year', 
            'region', 
            'school', 
            'subject', 
            'teaching_staff', 
            'title', 
            'description', 
            'date_start', 
            'date_end', 
            'specific_competences',
            'modules'
        ]
        read_only_fields = ['id']

    def validate(self, data):
        print("Validating data:", data)
        return data

    def update(self, instance, validated_data):
        print("Updating with validated data:", validated_data)
        try:
            modules_data = validated_data.pop('modules', None)
            
            # Update the learning situation fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Update modules if provided
            if modules_data is not None:
                print("Setting modules:", modules_data)
                instance.modules.set(modules_data)

            return instance
        except Exception as e:
            print("Error in update:", str(e))
            raise serializers.ValidationError(str(e))

    def to_representation(self, instance):
        try:
            representation = super().to_representation(instance)
            # Ensure modules is always a list
            representation['modules'] = representation.get('modules', [])
            print("Final representation:", representation)
            return representation
        except Exception as e:
            print("Error in to_representation:", str(e))
            raise

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = [
            'id',
            'year',
            'school',
            'subject',
            'teaching_staff',
            'title',
            'description',
            'date_start',
            'date_end',
            'session_length',
            'evaluable',
            'specific_competences',
            'selected_criteria',
            'basic_knowledge',
            'content',
            'files'
        ]

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ('id', 'name', 'description')

class SchoolTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolType
        fields = ('id', 'name', 'description')


class SchoolSerializer(serializers.ModelSerializer):
    region = RegionSerializer(read_only=True)
    school_type = SchoolTypeSerializer(read_only=True)
    years = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = ('id', 'name', 'address', 'phone_number', 'region', 'school_type', 'years')

    def get_years(self, obj):
        years = obj.years.all()
        result = []
        for year in years:
            # Filter subjects that belong to the current school and are linked to this year
            subjects = year.subjects.filter(school=obj)
            result.append({
                "id": year.id,
                "name": year.name,
                "division": year.division,
                "subjects": SubjectSerializer(subjects, many=True).data
            })
        return result

class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ['id', 'name', 'start_date', 'end_date']

class SchoolCalendarSerializer(serializers.ModelSerializer):
    terms = TermSerializer(many=True, read_only=True)
    
    class Meta:
        model = SchoolCalendar
        fields = ['id', 'academic_year', 'start_date', 'end_date', 'terms']

class ScheduledLearningSituationSerializer(serializers.ModelSerializer):
    learning_situation = LearningSituationSerializer(read_only=True)
    learning_situation_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = ScheduledLearningSituation
        fields = ['id', 'learning_situation', 'learning_situation_id', 'term', 'start_date', 'end_date', 'order']

class PlanningUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlanningUnit
        fields = [
            'id', 
            'subject', 
            'unit_number', 
            'learning_situation', 
            'start_date', 
            'end_date',
            'title',
            'notes'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        # Validate that the learning_situation belongs to the same subject
        learning_situation = data.get('learning_situation')
        subject = data.get('subject')
        
        if learning_situation and subject and learning_situation.subject.id != subject.id:
            raise serializers.ValidationError(
                "The learning situation must belong to the same subject as the planning unit."
            )
        
        return data
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Include the learning situation details if available
        if instance.learning_situation:
            representation['learning_situation_details'] = {
                'title': instance.learning_situation.title,
                'description': instance.learning_situation.description
            }
        return representation

class SpecificCompetencesSerializer(serializers.ModelSerializer):
    subject_name = serializers.SerializerMethodField()
    year_name = serializers.SerializerMethodField()
    
    class Meta:
        model = SpecificCompetences
        fields = [
            'id', 
            'region', 
            'subject', 
            'year', 
            'subject_name', 
            'year_name', 
            'code', 
            'description',
            'evaluation_criteria'
        ]
        read_only_fields = ['id']
    
    def get_subject_name(self, obj):
        return obj.subject.name if obj.subject else None
    
    def get_year_name(self, obj):
        return obj.year.name if obj.year else None