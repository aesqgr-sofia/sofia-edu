from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SchoolListCreateAPIView,
    SchoolRetrieveUpdateDestroyAPIView,
    YearListCreateAPIView,
    YearRetrieveUpdateDestroyAPIView,
    SubjectListCreateAPIView,
    SubjectRetrieveUpdateDestroyAPIView,
    LearningSituationListCreateAPIView,
    LearningSituationRetrieveUpdateDestroyAPIView,
    ModuleListCreateAPIView,
    ModuleRetrieveUpdateDestroyAPIView,
    SchoolDetailView,
    SubjectCreateAPIView,
    LearningSituationCreateAPIView,
    ModuleCreateAPIView,
    RegionListCreateAPIView,
    RegionRetrieveUpdateDestroyAPIView,
    SchoolCalendarViewSet,
    TermViewSet,
    ScheduledLearningSituationViewSet,
    PlanningUnitListCreateAPIView,
    PlanningUnitRetrieveUpdateDestroyAPIView,
    PlanningUnitBulkUpdateAPIView,
    SpecificCompetencesListAPIView,
    FileUploadView,
)

router = DefaultRouter()
router.register(r'school-calendars', SchoolCalendarViewSet, basename='school-calendar')
router.register(r'terms', TermViewSet, basename='term')
router.register(r'scheduled-situations', ScheduledLearningSituationViewSet, basename='scheduled-situation')

urlpatterns = [
    path('', include(router.urls)),
    path('schools/', SchoolListCreateAPIView.as_view(), name='school-list-create'),
    path('schools/<uuid:pk>/', SchoolRetrieveUpdateDestroyAPIView.as_view(), name='school-detail'),
    path('years/', YearListCreateAPIView.as_view(), name='year-list-create'),
    path('years/<uuid:pk>/', YearRetrieveUpdateDestroyAPIView.as_view(), name='year-detail'),
    path('subjects/', SubjectListCreateAPIView.as_view(), name='subject-list-create'),
    path('subjects/<uuid:pk>/', SubjectRetrieveUpdateDestroyAPIView.as_view(), name='subject-detail'),
    path('learning-situations/', LearningSituationListCreateAPIView.as_view(), name='learning-situation-list-create'),
    path('learning-situations/<uuid:pk>/', LearningSituationRetrieveUpdateDestroyAPIView.as_view(), name='learning-situation-detail'),
    path('modules/', ModuleListCreateAPIView.as_view(), name='module-list-create'),
    path('modules/<uuid:pk>/', ModuleRetrieveUpdateDestroyAPIView.as_view(), name='module-detail'),
    path('subjects/create/', SubjectCreateAPIView.as_view(), name='subject-create'),
    path('learning-situations/create/', LearningSituationCreateAPIView.as_view(), name='learning-situation-create'),
    path('modules/create/', ModuleCreateAPIView.as_view(), name='module-create'),
    path('regions/', RegionListCreateAPIView.as_view(), name='region-list-create'),
    path('regions/<uuid:pk>/', RegionRetrieveUpdateDestroyAPIView.as_view(), name='region-detail'),
    
    # Add new URLs for PlanningUnit
    path('planning-units/', PlanningUnitListCreateAPIView.as_view(), name='planning-unit-list-create'),
    path('planning-units/<uuid:pk>/', PlanningUnitRetrieveUpdateDestroyAPIView.as_view(), name='planning-unit-detail'),
    path('planning-units/bulk-update/', PlanningUnitBulkUpdateAPIView.as_view(), name='planning-unit-bulk-update'),
    
    # Add URLs for specific competences and file upload
    path('specific-competences/', SpecificCompetencesListAPIView.as_view(), name='specific-competences-list'),
    path('file-upload/', FileUploadView.as_view(), name='file-upload'),
]
