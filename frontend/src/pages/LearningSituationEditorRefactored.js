import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ToastContainer } from '../components/common';
import LearningSituationBasicInfo from '../components/learningsituations/LearningSituationBasicInfo';
import LearningSituationModules from '../components/learningsituations/LearningSituationModules';
import ModulesLibrary from '../components/learningsituations/ModulesLibrary';
import { Button } from '../components/common';
import { useAuth, useApi, useLearningsituation } from '../hooks';
import './LearningSituationEditor.css';

const LearningSituationEditorRefactored = () => {
  const { t } = useTranslation(['learning', 'common']);
  const { situationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authToken } = useAuth();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const presetYearId = queryParams.get('yearId');
  const presetSubjectId = queryParams.get('subjectId');
  const unitIndex = queryParams.get('unitIndex');
  const returnUrl = queryParams.get('returnUrl');

  // Determine modes
  const isEditMode = !!situationId;
  const hideYearSubject = !!presetSubjectId;

  // State
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [libraryVisible, setLibraryVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: presetYearId || '',
    subject: presetSubjectId || '',
    selectedModules: []
  });

  // Use learning situation hook
  const learningsituation = useLearningsituation({
    onCreateSuccess: (newSituation) => {
      handlePostSaveNavigation(newSituation.id);
    },
    onUpdateSuccess: () => {
      handlePostSaveNavigation();
    }
  });

  // Separate API instance for auth endpoints
  const authApi = useApi('/api');

  // Helper: Handle post-save navigation with unit assignment
  const handlePostSaveNavigation = async (newSituationId = null) => {
    // If we need to assign to a unit, do it now
    if (unitIndex !== null && newSituationId) {
      try {
        const dates = calculateDates(parseInt(unitIndex));
        await authApi.post('/core/planning-units/bulk-update/', {
          subject: presetSubjectId,
          units: [{
            unit_number: parseInt(unitIndex),
            learning_situation: newSituationId,
            start_date: dates.startDate,
            end_date: dates.endDate
          }]
        });
      } catch (error) {
        console.error('Error assigning to unit:', error);
      }
    }

    // Navigate after delay
    setTimeout(() => {
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/content');
      }
    }, 1500);
  };

  // Calculate dates based on unit position
  const calculateDates = (unitIndex) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + unitIndex * 14);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');

        // Fetch school data
        console.log('Fetching dashboard data from /api/auth/dashboard/');
        const dashboardResponse = await authApi.get('/auth/dashboard/');
        console.log('Dashboard response:', dashboardResponse);
        setSchoolData(dashboardResponse);

        // If editing, fetch learning situation data
        if (isEditMode) {
          console.log('Fetching learning situation data for ID:', situationId);
          const situationData = await learningsituation.read(situationId);
          console.log('Learning situation data:', situationData);

          // Load selected modules with competence details
          const modulesWithDetails = await Promise.all(
            (situationData.modules || []).map(moduleId =>
              learningsituation.api.get(`/modules/${moduleId}/`)
                .then(module => learningsituation.fetchCompetenceDetailsForModule(module))
            )
          );

          setFormData(prev => ({
            ...prev,
            title: situationData.title || '',
            description: situationData.description || '',
            year: situationData.year || prev.year,
            subject: situationData.subject || prev.subject,
            selectedModules: modulesWithDetails
          }));
        }

        setLoading(false);
        console.log('Initial data fetch completed successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
        learningsituation.showError(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    if (authToken) {
      fetchInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, isEditMode, situationId]);

  // Fetch subject details when preset subject ID is provided
  useEffect(() => {
    const fetchSubjectDetails = async () => {
      if (!presetSubjectId || !authToken) return;

      try {
        const response = await authApi.get(`/core/subjects/${presetSubjectId}/`);
        setSubjectDetails(response);
      } catch (error) {
        console.error('Error fetching subject details:', error);
      }
    };

    fetchSubjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetSubjectId, authToken]);

  // Update available subjects when year changes
  useEffect(() => {
    console.log('Year changed to:', formData.year, 'schoolData:', schoolData);
    if (schoolData && formData.year) {
      const selectedYearData = schoolData.years.find(year => year.id === formData.year);
      console.log('Selected year data:', selectedYearData);
      setAvailableSubjects(selectedYearData?.subjects || []);
    }
  }, [formData.year, schoolData]);

  // Fetch modules when subject changes
  useEffect(() => {
    console.log('Subject changed to:', formData.subject);
    if (formData.subject) {
      console.log('Fetching modules for subject:', formData.subject);
      learningsituation.fetchAvailableModules(formData.subject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.subject]);

  // Handle URL parameters for adding modules
  useEffect(() => {
    const moduleToAdd = queryParams.get('addModule');
    if (moduleToAdd && !loading) {
      const fetchModule = async () => {
        try {
          const moduleResponse = await learningsituation.api.get(`/modules/${moduleToAdd}/`);
          if (moduleResponse && !formData.selectedModules.some(m => m.id === moduleResponse.id)) {
            await learningsituation.addModule(
              moduleResponse,
              formData.selectedModules,
              (updater) => {
                if (typeof updater === 'function') {
                  setFormData(prev => ({ ...prev, selectedModules: updater(prev.selectedModules) }));
                } else {
                  updateFormField('selectedModules', updater);
                }
              }
            );
          }
          navigate(location.pathname, { replace: true });
        } catch (err) {
          console.error('Error fetching added module:', err);
        }
      };
      fetchModule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Form field update handler
  const updateFormField = (field, value) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = async () => {
    const situationData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      year: formData.year,
      subject: formData.subject,
      modules: formData.selectedModules.map(module => module.id),
      school: schoolData?.id
    };

    if (isEditMode) {
      await learningsituation.updateLearningsituation(situationId, situationData);
    } else {
      await learningsituation.createLearningsituation(situationData);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate('/content');
    }
  };

  // Module management handlers
  const handleRemoveModule = (moduleId) => {
    learningsituation.removeModule(
      moduleId,
      formData.selectedModules,
      (updater) => {
        if (typeof updater === 'function') {
          setFormData(prev => ({ ...prev, selectedModules: updater(prev.selectedModules) }));
        } else {
          updateFormField('selectedModules', updater);
        }
      }
    );
  };

  // Drag and drop handlers
  const handleDragStart = (e, module) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(module));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (e) => {
    e.dataTransfer.clearData();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    try {
      const moduleData = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (moduleData && !formData.selectedModules.some(m => m.id === moduleData.id)) {
        await learningsituation.addModule(
          moduleData,
          formData.selectedModules,
          (updater) => {
            if (typeof updater === 'function') {
              setFormData(prev => ({ ...prev, selectedModules: updater(prev.selectedModules) }));
            } else {
              updateFormField('selectedModules', updater);
            }
          }
        );
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    }
  };

  // Create module handler
  const handleCreateModule = (e) => {
    if (e) e.preventDefault();

    // Save current state before navigating
    const stateToSave = {
      title: formData.title,
      description: formData.description,
      year: formData.year,
      subject: formData.subject,
      selectedModules: formData.selectedModules.map(m => m.id)
    };

    localStorage.setItem('learningSituationState', JSON.stringify(stateToSave));

    // Navigate to module creation
    const createUrl = `/subjects/${formData.subject}/create-module?yearId=${formData.year}&returnToSituation=${isEditMode ? situationId : 'new'}`;
    navigate(createUrl);
  };

  // Edit module handler
  const handleEditModule = (module) => {
    // Save current state before navigating
    const stateToSave = {
      title: formData.title,
      description: formData.description,
      year: formData.year,
      subject: formData.subject,
      selectedModules: formData.selectedModules.map(m => m.id)
    };

    localStorage.setItem('learningSituationState', JSON.stringify(stateToSave));

    // Navigate to module edit
    navigate(`/module/${module.id}/edit?returnToSituation=${isEditMode ? situationId : 'new'}`);
  };

  // Delete module handler
  const handleDeleteModule = async (module) => {
    if (window.confirm(t('common:confirmDelete', { name: module.title }))) {
      try {
        await authApi.delete(`modules/${module.id}/`);
        
        // Remove from selected modules if it was selected
        if (formData.selectedModules.some(m => m.id === module.id)) {
          handleRemoveModule(module.id);
        }
        
        // Refresh available modules
        await learningsituation.fetchAvailableModules(formData.year, formData.subject);
        
        // Show success message
        learningsituation.showToast('success', t('modules:moduleDeleted', { title: module.title }));
      } catch (error) {
        console.error('Error deleting module:', error);
        learningsituation.showToast('error', t('common:errorDeleting'));
      }
    }
  };

  // Filter modules for search
  const filteredModules = learningsituation.filterModules(learningsituation.availableModules, searchQuery);

  if (loading) {
    return (
      <Layout schoolName={schoolData?.name || t('common:loading')}>
        <LoadingSpinner message={t('common:loading')} overlay />
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout schoolName={schoolData?.name || t('learning:editLearningSituation')}>
        <div className="module-creation-page">
          {/* Navigation Bar */}
          <div className="editor-navbar">
            <div className="nav-center">
              <h1>{isEditMode ? t('learning:editLearningSituation') : t('learning:newLearningSituation')}</h1>
              {formData.year && formData.subject && (
                <div className="context-info">
                  {schoolData?.years.find(y => y.id === formData.year)?.name} •
                  {availableSubjects.find(s => s.id === formData.subject)?.name}
                </div>
              )}
            </div>
            <div className="nav-right">
              <button
                className="nav-button secondary-button"
                onClick={() => setLibraryVisible(!libraryVisible)}
                disabled={!formData.subject}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H19.5C19.7761 4 20 4.22386 20 4.5V19.5C20 19.7761 19.7761 20 19.5 20H4.5C4.22386 20 4 19.7761 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {t('common:library')}
              </button>
              <button
                className="nav-button save-button"
                onClick={handleSave}
                disabled={learningsituation.loading}
              >
                {learningsituation.loading ? t('common:saving') : t('common:save')}
              </button>
            </div>
          </div>

          {/* Main Content using same structure as ModuleCreationPage */}
          <div className="editor-content">
            <div className="editor-main">
              <div className="form-container">
                
                {/* Basic Information Section */}
                <LearningSituationBasicInfo
                  title={formData.title}
                  description={formData.description}
                  selectedYearId={formData.year}
                  selectedSubjectId={formData.subject}
                  schoolData={schoolData}
                  availableSubjects={availableSubjects}
                  onTitleChange={(value) => updateFormField('title', value)}
                  onDescriptionChange={(value) => updateFormField('description', value)}
                  onYearChange={(e) => updateFormField('year', e.target.value)}
                  onSubjectChange={(e) => updateFormField('subject', e.target.value)}
                  showYearSelect={!hideYearSubject}
                  showSubjectSelect={!hideYearSubject}
                  subjectDetails={subjectDetails}
                  errors={learningsituation.validationErrors}
                />

                {/* Selected Modules Section */}
                <LearningSituationModules
                  selectedModules={formData.selectedModules}
                  onRemoveModule={handleRemoveModule}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  errors={learningsituation.validationErrors}
                />

              </div>
            </div>
          </div>

          {/* Modules Library (overlay/sidebar like competences) */}
          <ModulesLibrary
            visible={libraryVisible}
            availableModules={learningsituation.availableModules}
            filteredModules={filteredModules}
            searchQuery={searchQuery}
            loading={learningsituation.loadingModules}
            onClose={() => setLibraryVisible(false)}
            onSearchChange={setSearchQuery}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onCreateModule={handleCreateModule}
            onEditModule={handleEditModule}
            onDeleteModule={handleDeleteModule}
          />

          {/* Toast Container */}
          <ToastContainer 
            toasts={learningsituation.toasts} 
            onRemove={learningsituation.removeToast}
            position="top-right"
          />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default LearningSituationEditorRefactored; 