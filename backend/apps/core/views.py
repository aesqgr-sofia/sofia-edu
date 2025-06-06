# core/views.py
from rest_framework import generics
from django.views.generic.detail import DetailView
from .models import School, Year, Subject, LearningSituation, Module, Region, SchoolCalendar, Term, ScheduledLearningSituation, PlanningUnit, SpecificCompetences
from .serializers import (
    SchoolSerializer,
    YearSerializer,
    SubjectSerializer,
    LearningSituationSerializer,
    ModuleSerializer,
    RegionSerializer,
    SchoolCalendarSerializer,
    TermSerializer,
    ScheduledLearningSituationSerializer,
    PlanningUnitSerializer,
    SpecificCompetencesSerializer,
)
from django.contrib.auth import authenticate

from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated, DjangoModelPermissions
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.db import transaction
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import os
from datetime import datetime
import uuid

# School endpoints
class SchoolListCreateAPIView(generics.ListCreateAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

class SchoolRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

# Year endpoints
class YearListCreateAPIView(generics.ListCreateAPIView):
    queryset = Year.objects.all()
    serializer_class = YearSerializer

class YearRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Year.objects.all()
    serializer_class = YearSerializer

# Subject endpoints
class SubjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]    

class SubjectRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

# Learning Situation endpoints
class LearningSituationListCreateAPIView(generics.ListCreateAPIView):
    queryset = LearningSituation.objects.all()
    serializer_class = LearningSituationSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    def get_queryset(self):
        queryset = LearningSituation.objects.all().prefetch_related('modules')
        year = self.request.query_params.get('year', None)
        subject = self.request.query_params.get('subject', None)

        if year:
            queryset = queryset.filter(year_id=year)
        if subject:
            queryset = queryset.filter(subject_id=subject)

        return queryset.order_by('-date_start') if queryset.exists() else queryset

class LearningSituationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LearningSituation.objects.all().prefetch_related('modules')
    serializer_class = LearningSituationSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    def update(self, request, *args, **kwargs):
        print("Received update request with data:", request.data)
        try:
            response = super().update(request, *args, **kwargs)
            print("Update successful:", response.data)
            return response
        except Exception as e:
            print("Update failed with error:", str(e))
            raise

# Module endpoints
class ModuleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

    def get_queryset(self):
        queryset = Module.objects.all()
        year = self.request.query_params.get('year', None)
        subject = self.request.query_params.get('subject', None)

        if year:
            queryset = queryset.filter(year_id=year)
        if subject:
            queryset = queryset.filter(subject_id=subject)

        return queryset.order_by('-date_start') if queryset.exists() else queryset

class ModuleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

class SchoolDetailView(DetailView):
    model = School
    template_name = 'core/school_detail.html'  # Create this template
    context_object_name = 'school'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        school = self.object
        # Get the school's years (assumes the ManyToMany is set)
        years = school.years.all().order_by('name')
        context['years'] = years
        
        # Build a list of tuples: (year, subjects in that year for this school)
        year_subjects = [
            (year, school.subjects.filter(year=year))
            for year in years
        ]
        context['year_subjects'] = year_subjects

        return context;


class SubjectCreateAPIView(CreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]


class LearningSituationCreateAPIView(CreateAPIView):
    queryset = LearningSituation.objects.all()
    serializer_class = LearningSituationSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]


class ModuleCreateAPIView(CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class RegionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class RegionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer

class SchoolCalendarViewSet(ModelViewSet):
    serializer_class = SchoolCalendarSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SchoolCalendar.objects.filter(school__teaching_staff=self.request.user)

class TermViewSet(ModelViewSet):
    serializer_class = TermSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Term.objects.filter(calendar__school__teaching_staff=self.request.user)

class ScheduledLearningSituationViewSet(ModelViewSet):
    serializer_class = ScheduledLearningSituationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ScheduledLearningSituation.objects.filter(
            learning_situation__school__teaching_staff=self.request.user
        )

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        term_id = request.data.get('term_id')
        new_order = request.data.get('new_order', [])  # List of scheduled situation IDs in new order
        
        with transaction.atomic():
            for index, situation_id in enumerate(new_order):
                ScheduledLearningSituation.objects.filter(id=situation_id).update(order=index)
        
        return Response({'status': 'success'})

class PlanningUnitListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = PlanningUnitSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    
    def get_queryset(self):
        queryset = PlanningUnit.objects.all()
        subject_id = self.request.query_params.get('subject', None)
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
            
        return queryset.order_by('unit_number')
    
    def perform_create(self, serializer):
        serializer.save()

class PlanningUnitRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PlanningUnit.objects.all()
    serializer_class = PlanningUnitSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]

class PlanningUnitBulkUpdateAPIView(generics.GenericAPIView):
    serializer_class = PlanningUnitSerializer
    permission_classes = [IsAuthenticated, DjangoModelPermissions]
    
    def get_queryset(self):
        """
        This method is required for DjangoModelPermissions to determine
        the model class and query all model instances.
        """
        return PlanningUnit.objects.all()
    
    def post(self, request, *args, **kwargs):
        subject_id = request.data.get('subject')
        units_data = request.data.get('units', [])
        
        if not subject_id:
            return Response(
                {"error": "Subject ID is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
            return Response(
                {"error": "Subject not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        with transaction.atomic():
            updated_units = []
            for unit_data in units_data:
                unit_number = unit_data.get('unit_number')
                learning_situation_id = unit_data.get('learning_situation')
                start_date = unit_data.get('start_date')
                end_date = unit_data.get('end_date')
                title = unit_data.get('title')
                notes = unit_data.get('notes')
                
                # Get or create the planning unit
                planning_unit, created = PlanningUnit.objects.get_or_create(
                    subject=subject,
                    unit_number=unit_number,
                    defaults={
                        'learning_situation': None, 
                        'start_date': start_date,
                        'end_date': end_date,
                        'title': title,
                        'notes': notes
                    }
                )
                
                # Update the planning unit data
                if not created:
                    if learning_situation_id:
                        planning_unit.learning_situation_id = learning_situation_id
                    else:
                        planning_unit.learning_situation = None
                    
                    planning_unit.start_date = start_date
                    planning_unit.end_date = end_date
                    planning_unit.title = title
                    planning_unit.notes = notes
                    planning_unit.save()
                else:
                    # If newly created and we have a learning situation ID
                    if learning_situation_id:
                        planning_unit.learning_situation_id = learning_situation_id
                        planning_unit.save()
                        
                updated_units.append(planning_unit)
                
            serializer = self.get_serializer(updated_units, many=True)
            return Response(serializer.data)

# Add a view for specific competences
class SpecificCompetencesListAPIView(generics.ListAPIView):
    serializer_class = SpecificCompetencesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = SpecificCompetences.objects.all()
        
        try:
            region = self.request.query_params.get('region', None)
            subject = self.request.query_params.get('subject', None)
            year = self.request.query_params.get('year', None)
            
            print(f"Fetching competences with region={region}, subject={subject}, year={year}")
            
            # Apply filters based on query parameters
            if region:
                queryset = queryset.filter(region_id=region)
                print(f"After region filter: {queryset.count()} competences")
            
            if subject:
                queryset = queryset.filter(subject_id=subject)
                print(f"After subject filter: {queryset.count()} competences")
                
            if year:
                queryset = queryset.filter(year_id=year)
                print(f"After year filter: {queryset.count()} competences")
                
            return queryset
        except Exception as e:
            print(f"Error fetching competences: {str(e)}")
            # Return empty queryset on error instead of raising exception
            return SpecificCompetences.objects.none()
    
    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in list method: {str(e)}")
            return Response(
                {"detail": f"Error fetching competences: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Add a view for file uploads
class FileUploadView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check file size (10MB limit)
        if file_obj.size > 10 * 1024 * 1024:  # 10MB in bytes
            return Response({'error': 'File too large. Maximum size is 10MB.'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Create year/month directories for organization
        now = datetime.now()
        upload_dir = os.path.join('uploads', str(now.year), str(now.month))
        full_upload_path = os.path.join(settings.MEDIA_ROOT, upload_dir)
        
        # Create directory if it doesn't exist
        os.makedirs(full_upload_path, exist_ok=True)
        
        # Generate a unique filename
        file_extension = os.path.splitext(file_obj.name)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        full_file_path = os.path.join(settings.MEDIA_ROOT, file_path)
        
        # Save the file
        with open(full_file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        
        # Return the file URL
        file_url = request.build_absolute_uri(settings.MEDIA_URL + file_path)
        
        return Response({
            'url': file_url,
            'name': file_obj.name,
            'size': file_obj.size,
            'type': file_obj.content_type
        })