import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, useModule, useApi } from '../hooks';
import { 
  ErrorBoundary, 
  LoadingSpinner, 
  ToastContainer 
} from './common';
import { 
  ModuleBasicInfo, 
  ModuleCompetences, 
  ModuleFileUpload 
} from './modules';
import Layout from './Layout';
import './ModuleCreationPage.css';

/**
 * Refactored ModuleCreationPage component
 * Uses new hooks and component architecture for better maintainability
 * 
 * BEFORE: 865 lines with 20+ useState hooks and mixed concerns
 * AFTER: ~200 lines with clean separation of concerns
 */
const ModuleCreationPageRefactored = () => {
  const { yearId, subjectId, moduleId } = useParams();
  const navigate = useNavigate();
  const { authToken } = useAuth();
  const { t } = useTranslation(['modules', 'common']);
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  // Get URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const queryYearId = urlParams.get('yearId');
  const querySubjectId = urlParams.get('subjectId');

  // State management - significantly reduced from original
  const [isEditMode] = useState(Boolean(moduleId));
  const [schoolData, setSchoolData] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [libraryVisible, setLibraryVisible] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sessionLength: '1.0',
    evaluable: true,
    selectedYearId: yearId || queryYearId || '',
    selectedSubjectId: subjectId || querySubjectId || '',
    selectedCompetences: [],
    selectedCriteria: {},
    files: []
  });

  // Use our new module hook for all module operations
  const module = useModule({
    onCreateSuccess: (newModule) => {
      if (formData.selectedYearId && formData.selectedSubjectId) {
        navigate(`/subject/${formData.selectedSubjectId}/learning-situations`);
      } else {
        navigate('/dashboard');
      }
    },
    onUpdateSuccess: (updatedModule) => {
      if (formData.selectedYearId && formData.selectedSubjectId) {
        navigate(`/subject/${formData.selectedSubjectId}/learning-situations`);
      } else {
        navigate('/dashboard');
      }
    }
  });

  // Separate API instance for auth endpoints
  const authApi = useApi('/api');

  // Initialize Quill editor
  useEffect(() => {
    const initializeQuill = async () => {
      try {
        const QuillModule = await import('quill');
        const Quill = QuillModule.default;
        await import('quill/dist/quill.snow.css');
        
        setTimeout(() => {
          if (quillRef.current && !quillInstance.current) {
            quillInstance.current = new Quill(quillRef.current, {
              theme: 'snow',
              modules: {
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'header': [1, 2, false] }],
                  ['link'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'align': [] }],
                  ['clean']
                ]
              },
              placeholder: 'Enter module description...',
            });
            
            if (formData.description) {
              quillInstance.current.clipboard.dangerouslyPasteHTML(formData.description);
            }
            
            quillInstance.current.on('text-change', () => {
              const content = quillInstance.current.root.innerHTML;
              setFormData(prev => ({ ...prev, description: content }));
            });
            
            setQuillLoaded(true);
          }
        }, 100);
      } catch (error) {
        console.error('Failed to load Quill:', error);
      }
    };

    initializeQuill();

    return () => {
      if (quillInstance.current) {
        quillInstance.current.off('text-change');
        quillInstance.current = null;
      }
      setQuillLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');
        
        // Fetch school data first using correct endpoint
        console.log('Fetching dashboard data from /api/auth/dashboard/');
        const dashboardResponse = await authApi.get('/auth/dashboard/');
        console.log('Dashboard response:', dashboardResponse);
        setSchoolData(dashboardResponse);
        
        // If editing, fetch module data
        if (isEditMode) {
          console.log('Fetching module data for ID:', moduleId);
          const moduleData = await module.read(moduleId);
          console.log('Module data:', moduleData);
          setFormData(prev => ({
            ...prev,
            title: moduleData.title,
            description: moduleData.description,
            sessionLength: moduleData.session_length?.toString() || '1.0',
            evaluable: moduleData.evaluable || false,
            selectedYearId: moduleData.year || prev.selectedYearId,
            selectedSubjectId: moduleData.subject || prev.selectedSubjectId,
            selectedCompetences: moduleData.specific_competences || [],
            selectedCriteria: moduleData.selected_criteria || {},
            files: moduleData.files || []
          }));
        }
        
        setLoading(false);
        console.log('Initial data fetch completed successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
        console.error('Error details:', error.response?.data);
        module.showError(`Failed to load data: ${error.message}`);
        setLoading(false);
      }
    };

    if (authToken) {
      fetchInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, isEditMode, moduleId]);

  // Update available subjects when year changes
  useEffect(() => {
    if (formData.selectedYearId && schoolData) {
      const yearData = schoolData.years.find(y => y.id === formData.selectedYearId);
      setAvailableSubjects(yearData?.subjects || []);
      
      // Reset subject if not available in selected year
      if (formData.selectedSubjectId && !yearData?.subjects.some(s => s.id === formData.selectedSubjectId)) {
        setFormData(prev => ({ ...prev, selectedSubjectId: '' }));
      }
    }
  }, [formData.selectedYearId, formData.selectedSubjectId, schoolData]);

  // Fetch competences when year/subject changes
  useEffect(() => {
    if (formData.selectedYearId && formData.selectedSubjectId && schoolData?.region) {
      module.fetchCompetences(
        schoolData.region.id,
        formData.selectedSubjectId,
        formData.selectedYearId
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.selectedYearId, formData.selectedSubjectId, schoolData]);

  // Force editor re-render when year/subject changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [formData.selectedYearId, formData.selectedSubjectId]);

  // Update handlers using setFormData
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const moduleData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      session_length: parseFloat(formData.sessionLength),
      evaluable: formData.evaluable,
      specific_competences: formData.selectedCompetences,
      selected_criteria: formData.selectedCriteria,
      files: formData.files,
      year: formData.selectedYearId,
      subject: formData.selectedSubjectId,
      school: schoolData?.id
    };

    if (isEditMode) {
      await module.updateModule(moduleId, moduleData);
    } else {
      await module.createModule(moduleData);
    }
  };

  const handleCancel = () => {
    const returnToSituation = localStorage.getItem('returnToSituation');
    if (returnToSituation) {
      localStorage.removeItem('returnToSituation');
      navigate(returnToSituation === 'new' ? '/learning-situation/new' : `/learning-situation/${returnToSituation}`);
    } else {
      navigate('/content');
    }
  };

  const renderFallbackEditor = () => (
    <textarea
      className="fallback-editor"
      value={formData.description}
      onChange={(e) => updateFormField('description', e.target.value)}
      placeholder={t('modules:enterDescription')}
      rows={8}
    />
  );

  if (loading) {
    return (
      <Layout schoolName={schoolData?.name || t('common:loading')}>
        <LoadingSpinner message={t('modules:loadingModuleData', 'Loading module data...')} overlay />
      </Layout>
    );
  }

  return (
    <ErrorBoundary>
      <Layout schoolName={schoolData?.name || t('modules:moduleCreation', 'Module Creation')}>
        <div className="module-creation-page">
          {/* Navigation Bar */}
          <div className="editor-navbar">
            <div className="nav-center">
              <h1>{isEditMode ? t('modules:editModule') : t('modules:newModule')}</h1>
              {formData.selectedYearId && formData.selectedSubjectId && (
                <div className="context-info">
                  {schoolData?.years.find(y => y.id === formData.selectedYearId)?.name} • 
                  {availableSubjects.find(s => s.id === formData.selectedSubjectId)?.name}
                </div>
              )}
            </div>
            
            <div className="nav-right">
              <button
                className="nav-button save-button"
                onClick={handleSave}
                disabled={module.loading}
              >
                {module.loading ? t('common:saving') : t('common:save')}
              </button>
            </div>
          </div>

          {/* Main Content using new components */}
          <div className="editor-content">
            <div className="editor-main">
              <div className="form-container">
                
                {/* Basic Information Section */}
                <ModuleBasicInfo
                  title={formData.title}
                  description={formData.description}
                  sessionLength={formData.sessionLength}
                  evaluable={formData.evaluable}
                  selectedYearId={formData.selectedYearId}
                  selectedSubjectId={formData.selectedSubjectId}
                  schoolData={schoolData}
                  availableSubjects={availableSubjects}
                  onTitleChange={(value) => updateFormField('title', value)}
                  onDescriptionChange={(value) => updateFormField('description', value)}
                  onSessionLengthChange={(value) => updateFormField('sessionLength', value)}
                  onEvaluableChange={(value) => updateFormField('evaluable', value)}
                  onYearChange={(value) => updateFormField('selectedYearId', value)}
                  onSubjectChange={(value) => updateFormField('selectedSubjectId', value)}
                  quillRef={quillRef}
                  quillLoaded={quillLoaded}
                  renderFallbackEditor={renderFallbackEditor}
                  editorKey={editorKey}
                  showYearSelect={!yearId}
                  showSubjectSelect={!subjectId}
                  errors={module.validationErrors}
                />

                {/* Competences Section */}
                <ModuleCompetences
                  competences={module.competences}
                  selectedCompetences={formData.selectedCompetences}
                  selectedCriteria={formData.selectedCriteria}
                  loadingCompetences={module.loadingCompetences}
                  onToggleCompetence={(competenceId) => 
                    module.toggleCompetence(
                      competenceId,
                      formData.selectedCompetences,
                      (updater) => {
                        if (typeof updater === 'function') {
                          setFormData(prev => ({ ...prev, selectedCompetences: updater(prev.selectedCompetences) }));
                        } else {
                          updateFormField('selectedCompetences', updater);
                        }
                      },
                      formData.selectedCriteria,
                      (updater) => {
                        if (typeof updater === 'function') {
                          setFormData(prev => ({ ...prev, selectedCriteria: updater(prev.selectedCriteria) }));
                        } else {
                          updateFormField('selectedCriteria', updater);
                        }
                      }
                    )
                  }
                  onToggleEvaluationCriteria={(competenceId, criterionId) =>
                    module.toggleEvaluationCriteria(
                      competenceId,
                      criterionId,
                      formData.selectedCriteria,
                      (updater) => {
                        if (typeof updater === 'function') {
                          setFormData(prev => ({ ...prev, selectedCriteria: updater(prev.selectedCriteria) }));
                        } else {
                          updateFormField('selectedCriteria', updater);
                        }
                      }
                    )
                  }
                  errors={module.validationErrors}
                />

                {/* File Upload Section */}
                <ModuleFileUpload
                  files={formData.files}
                  onFileSelect={(files) => 
                    updateFormField('files', [...formData.files, ...files])
                  }
                  onRemoveFile={(index) => 
                    updateFormField('files', formData.files.filter((_, i) => i !== index))
                  }
                  errors={module.validationErrors}
                />

              </div>
            </div>
          </div>

          {/* Toast Container */}
          <ToastContainer 
            toasts={module.toasts} 
            onRemove={module.removeToast}
            position="top-right"
          />
        </div>
      </Layout>
    </ErrorBoundary>
  );
};

export default ModuleCreationPageRefactored; 