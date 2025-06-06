import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import LearningSituationModal from '../components/LearningSituationModal';
import FormModal from '../components/modals/FormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Button, Card, Page } from '../components/common';
import '../components/Content.css';
import { useNavigate } from 'react-router-dom';

const Content = () => {
  const { authToken, user } = useContext(AuthContext);
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global filter states
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Modal filter states (for Learning Situation)
  const [modalYear, setModalYear] = useState('');
  const [modalSubject, setModalSubject] = useState('');
  const [modalAvailableSubjects, setModalAvailableSubjects] = useState([]);

  // Modal states
  const [showLearningSituationModal, setShowLearningSituationModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);

  // Learning Situation form states
  const [learningSituationName, setLearningSituationName] = useState('');
  const [learningSituationDescription, setLearningSituationDescription] = useState('');
  const [learningSituationError, setLearningSituationError] = useState(null);

  // Module form states
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleError, setModuleError] = useState(null);

  // Content states
  const [learningSituations, setLearningSituations] = useState([]);
  const [modules, setModules] = useState([]);

  // Add these new state variables at the top with other states
  const [editingLearningSituation, setEditingLearningSituation] = useState(null);

  // Add new state for confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    situationId: null
  });

  // Add module editing state
  const [editingModule, setEditingModule] = useState(null);

  // Add module confirmation dialog state
  const [confirmModuleDialog, setConfirmModuleDialog] = useState({
    isOpen: false,
    moduleId: null
  });

  // Add new state for selected modules in learning situations
  const [selectedModules, setSelectedModules] = useState([]);

  // Add these variables to track the filters before opening the modal
  const [previousFilters, setPreviousFilters] = useState({ year: '', subject: '' });

  // Add new state for selected learning situation in module modal
  const [selectedLearningSituation, setSelectedLearningSituation] = useState('');

  // Add module modal filter states
  const [moduleModalYear, setModuleModalYear] = useState('');
  const [moduleModalSubject, setModuleModalSubject] = useState('');
  const [moduleModalAvailableSubjects, setModuleModalAvailableSubjects] = useState([]);

  // Add new state for module status filter after other filter states
  const [moduleStatusFilter, setModuleStatusFilter] = useState('all');

  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/auth/dashboard/', {
        headers: { Authorization: `Token ${authToken}` },
      });
      setSchoolData(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error loading dashboard data.'
      );
      return null;
    }
  };

  const fetchLearningSituations = async () => {
    try {
      const params = {};
      if (selectedYear) params.year = selectedYear;
      if (selectedSubject) params.subject = selectedSubject;

      const response = await axios.get('/api/core/learning-situations/', {
        headers: { Authorization: `Token ${authToken}` },
        params
      });
      
      // Ensure each learning situation has a modules array
      const situationsWithModules = response.data.map(situation => ({
        ...situation,
        modules: situation.modules || []
      }));
      
      console.log('Fetched learning situations:', situationsWithModules);
      setLearningSituations(situationsWithModules);
    } catch (err) {
      console.error('Error fetching learning situations:', err);
    }
  };

  const fetchModules = async () => {
    try {
      // Get all modules without filters for the modal
      const allModulesResponse = await axios.get('/api/core/modules/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Filter modules for the main view
      const filteredModules = allModulesResponse.data.filter(module => {
        // Year and subject filters
        if (selectedYear && module.year !== selectedYear) return false;
        if (selectedSubject && module.subject !== selectedSubject) return false;

        // Status filter
        if (moduleStatusFilter !== 'all') {
          const isLinked = learningSituations.some(
            situation => situation.modules && situation.modules.includes(module.id)
          );
          if (moduleStatusFilter === 'linked' && !isLinked) return false;
          if (moduleStatusFilter === 'unlinked' && isLinked) return false;
        }

        return true;
      });
      
      setModules(filteredModules); // Store filtered modules
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  // Update available subjects when year changes (for global filters)
  useEffect(() => {
    if (selectedYear && schoolData) {
      const selectedYearData = schoolData.years.find(year => year.id === selectedYear);
      setAvailableSubjects(selectedYearData?.subjects || []);
      setSelectedSubject(''); // Reset subject when year changes
    } else {
      setAvailableSubjects([]);
      setSelectedSubject(''); // Reset subject when year is cleared
    }
  }, [selectedYear, schoolData]);

  // Update available subjects when year changes (for modal)
  useEffect(() => {
    if (modalYear && schoolData) {
      const selectedYearData = schoolData.years.find(year => year.id === modalYear);
      setModalAvailableSubjects(selectedYearData?.subjects || []);
    } else {
      setModalAvailableSubjects([]);
      setModalSubject('');
    }
  }, [modalYear, schoolData]);

  // Update effect for module modal subjects
  useEffect(() => {
    if (moduleModalYear && schoolData) {
      const selectedYearData = schoolData.years.find(year => year.id === moduleModalYear);
      setModuleModalAvailableSubjects(selectedYearData?.subjects || []);
    } else {
      setModuleModalAvailableSubjects([]);
      setModuleModalSubject('');
    }
  }, [moduleModalYear, schoolData]);

  // Update the useEffect to include moduleStatusFilter
  useEffect(() => {
    if (authToken) {
      fetchLearningSituations();
      fetchModules();
    }
  }, [selectedYear, selectedSubject, moduleStatusFilter]);

  useEffect(() => {
    const loadData = async () => {
      if (authToken) {
        setLoading(true);
        await fetchDashboardData();
        await fetchLearningSituations();
        await fetchModules();
        setLoading(false);
      }
    };
    
    loadData();
  }, [authToken]);

  const handleEditLearningSituation = (situation) => {
    // Navigate to the editor page with the situation ID
    navigate(`/learning-situation/${situation.id}`);
  };

  // Helper function to get available modules for the modal
  const getAvailableModulesForModal = () => {
    if (!modalYear || !modalSubject) return [];

    console.log('Getting modules for modal with year:', modalYear, 'and subject:', modalSubject);
    console.log('All available modules:', modules);

    // Get modules that match the current modal year/subject
    const matchingModules = modules.filter(m => 
      m.year === modalYear && m.subject === modalSubject
    );

    // Add any selected modules that might not match the current filter
    const selectedModuleIds = selectedModules.map(m => m.id);
    const additionalModules = modules.filter(m => 
      selectedModuleIds.includes(m.id) && 
      !matchingModules.some(mm => mm.id === m.id)
    );

    const allModules = [...matchingModules, ...additionalModules];
    console.log('Filtered modules for modal:', allModules);
    return allModules;
  };

  const handleLearningSituationSubmit = async (e) => {
    e.preventDefault();
    setLearningSituationError(null);
    
    // Filter out any invalid modules and get only the IDs
    const moduleIds = selectedModules
      .filter(module => module && module.id)
      .map(module => module.id);
    
    console.log('Selected modules:', selectedModules);
    console.log('Module IDs to be sent:', moduleIds);
    
    const payload = {
      school: schoolData.id,
      region: schoolData.region ? schoolData.region.id : null,
      year: modalYear,
      subject: modalSubject,
      title: learningSituationName,
      description: learningSituationDescription,
      modules: moduleIds.length > 0 ? moduleIds : [] // Ensure we send an empty array if no modules selected
    };

    console.log('Submitting learning situation with payload:', payload);

    try {
      if (editingLearningSituation) {
        const response = await axios.put(
          `/api/core/learning-situations/${editingLearningSituation.id}/`,
          payload,
          { headers: { Authorization: `Token ${authToken}` } }
        );
        console.log('Update response:', response.data);
      } else {
        const response = await axios.post(
          '/api/core/learning-situations/',
          payload,
          { headers: { Authorization: `Token ${authToken}` } }
        );
        console.log('Create response:', response.data);
      }
      
      await fetchLearningSituations();
      await fetchModules();
      
      setShowLearningSituationModal(false);
      resetLearningSituationForm();
    } catch (err) {
      console.error('Error saving learning situation:', err.response?.data || err);
      setLearningSituationError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to save learning situation.'
      );
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleTitle(module.title);
    setModuleDescription(module.description);
    setModuleModalYear(module.year);
    setModuleModalSubject(module.subject);
    
    // Find current linked situation if any
    const linkedSituation = getModuleLinkedSituation(module.id);
    if (linkedSituation) {
      setSelectedLearningSituation(linkedSituation.id);
    }
    
    setShowModuleModal(true);
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    setModuleError(null);
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    const modulePayload = {
      school: schoolData.id,
      region: schoolData.region ? schoolData.region.id : null,
      year: moduleModalYear,
      subject: moduleModalSubject,
      title: moduleTitle,
      description: moduleDescription,
      date_start: today,
      date_end: today,
      specific_competences: [],
      basic_knowledge: [],
      content: [],
    };
    
    try {
      // Step 1: Save or update the module
      let moduleResponse;
      if (editingModule) {
        moduleResponse = await axios.put(
          `/api/core/modules/${editingModule.id}/`,
          modulePayload,
          { headers: { Authorization: `Token ${authToken}` } }
        );
      } else {
        moduleResponse = await axios.post(
          '/api/core/modules/',
          modulePayload,
          { headers: { Authorization: `Token ${authToken}` } }
        );
      }

      const moduleId = moduleResponse.data.id;

      // Step 2: Handle learning situation updates
      const oldSituation = editingModule ? 
        learningSituations.find(s => s.modules && s.modules.includes(editingModule.id)) : 
        null;

      // If module was previously linked to a different situation, remove it
      if (oldSituation && oldSituation.id !== selectedLearningSituation) {
        const { teaching_staff, specific_competences, ...situationWithoutM2M } = oldSituation;
        const updatedModules = oldSituation.modules.filter(id => id !== moduleId);
        await axios.put(
          `/api/core/learning-situations/${oldSituation.id}/`,
          {
            ...situationWithoutM2M,
            modules: updatedModules
          },
          { headers: { Authorization: `Token ${authToken}` } }
        );
      }

      // If a new learning situation is selected, add the module to it
      if (selectedLearningSituation) {
        const situation = learningSituations.find(s => s.id === selectedLearningSituation);
        if (situation) {
          const { teaching_staff, specific_competences, ...situationWithoutM2M } = situation;
          const updatedModules = [...new Set([...(situation.modules || []), moduleId])];
          await axios.put(
            `/api/core/learning-situations/${situation.id}/`,
            {
              ...situationWithoutM2M,
              modules: updatedModules
            },
            { headers: { Authorization: `Token ${authToken}` } }
          );
        }
      }

      // Step 3: Refresh data and reset form
      await fetchModules();
      await fetchLearningSituations();
      setShowModuleModal(false);
      resetModuleForm();
    } catch (err) {
      console.error('Error saving module:', err.response?.data || err);
      setModuleError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to save module.'
      );
    }
  };

  const resetLearningSituationForm = () => {
    setLearningSituationName('');
    setLearningSituationDescription('');
    setLearningSituationError(null);
    setEditingLearningSituation(null);
    setSelectedModules([]);
    setModalYear('');
    setModalSubject('');
  };

  const resetModuleForm = () => {
    setModuleTitle('');
    setModuleDescription('');
    setModuleError(null);
    setEditingModule(null);
    setSelectedLearningSituation('');
    setModuleModalYear('');
    setModuleModalSubject('');
  };

  // Update the modal close handler
  const handleCloseLearningSituationModal = () => {
    setShowLearningSituationModal(false);
    resetLearningSituationForm();
  };

  // Update the delete handler
  const handleDeleteLearningSituation = async (e, situationId) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    setConfirmDialog({
      isOpen: true,
      situationId
    });
  };

  // Add confirm delete handler
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/core/learning-situations/${confirmDialog.situationId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      await fetchLearningSituations();
    } catch (err) {
      console.error('Error deleting learning situation:', err);
    }
    setConfirmDialog({ isOpen: false, situationId: null });
  };

  const handleDeleteModule = async (e, moduleId) => {
    e.stopPropagation(); // Prevent the card click event from triggering
    setConfirmModuleDialog({
      isOpen: true,
      moduleId
    });
  };

  const handleConfirmModuleDelete = async () => {
    try {
      await axios.delete(`/api/core/modules/${confirmModuleDialog.moduleId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      await fetchModules();
    } catch (err) {
      console.error('Error deleting module:', err);
    }
    setConfirmModuleDialog({ isOpen: false, moduleId: null });
  };

  // Add this function inside the Content component, before the render return
  const getModuleLinkedSituation = (moduleId) => {
    return learningSituations.find(situation => 
      situation.modules && situation.modules.includes(moduleId)
    );
  };

  // Filter learning situations based on module modal year and subject
  const getAvailableLearningSituations = () => {
    if (!moduleModalYear || !moduleModalSubject) return [];
    return learningSituations.filter(
      situation => situation.year === moduleModalYear && situation.subject === moduleModalSubject
    );
  };

  if (loading) {
    return (
      <Layout schoolName="Content">
        <Page className="sofia-py-4">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading content...</p>
          </div>
        </Page>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout schoolName="Content">
        <Page className="sofia-py-4">
          <Card title="Error">
            <p>{error}</p>
            <Button 
              variant="primary" 
              onClick={() => {
                fetchDashboardData();
                fetchLearningSituations();
                fetchModules();
              }}
            >
              Try Again
            </Button>
          </Card>
        </Page>
      </Layout>
    );
  }
  
  if (!schoolData) {
    return (
      <Layout schoolName="Content">
        <Page className="sofia-py-4">
          <Card title="Missing Data">
            <p>No school data available.</p>
          </Card>
        </Page>
      </Layout>
    );
  }

  return (
    <Layout schoolName={schoolData.name}>
      <Page title="Content Management" className="content-page sofia-py-4">
        {/* Filters */}
        <Card title="Filters" className="sofia-mb-4">
          <div className="filters sofia-d-flex sofia-gap-4">
            <div className="filter-item">
              <label>Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {schoolData.years.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}{year.division ? ` - ${year.division}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedYear}
              >
                <option value="">All Subjects</option>
                {availableSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Module Status:</label>
              <select
                value={moduleStatusFilter}
                onChange={(e) => setModuleStatusFilter(e.target.value)}
              >
                <option value="all">All Modules</option>
                <option value="linked">Linked to Learning Situation</option>
                <option value="unlinked">Not Linked</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Two-column layout */}
        <div className="content-columns">
          {/* Learning Situations Column */}
          <div className="column">
            <Card 
              title="Learning Situations" 
              headerActions={
                <Button 
                  variant="primary"
                  onClick={() => navigate('/learning-situation/new')}
                >
                  Add Learning Situation
                </Button>
              }
            >
              <div className="column-content">
                {learningSituations.length > 0 ? (
                  learningSituations.map((situation) => (
                    <Card 
                      key={situation.id} 
                      className="content-card sofia-mb-3"
                      onClick={() => handleEditLearningSituation(situation)}
                      headerActions={
                        <Button 
                          variant="tertiary"
                          isIcon={true}
                          className="delete-button"
                          onClick={(e) => handleDeleteLearningSituation(e, situation.id)}
                          title="Delete learning situation"
                        >
                          <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      }
                      title={situation.title}
                    >
                      <div className="card-content">
                        <p>{situation.description}</p>
                        <div className="card-chips sofia-d-flex sofia-gap-2 sofia-mt-2">
                          {situation.year && (
                            <span className="chip year-chip">
                              {schoolData.years.find(y => y.id === situation.year)?.name || 'Unknown Year'}
                            </span>
                          )}
                          {situation.subject && (
                            <span className="chip subject-chip">
                              {schoolData.years
                                .flatMap(year => year.subjects)
                                .find(s => s.id === situation.subject)?.name || 'Unknown Subject'}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p>No learning situations available.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Modules Column */}
          <div className="column">
            <Card 
              title="Modules" 
              headerActions={
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/module/new`)}
                >
                  Add Module
                </Button>
              }
            >
              <div className="column-content">
                {modules.length > 0 ? (
                  modules.map((module) => {
                    const linkedSituation = getModuleLinkedSituation(module.id);
                    return (
                      <Card 
                        key={module.id} 
                        className="content-card sofia-mb-3"
                        onClick={() => navigate(`/module/${module.id}/edit`)}
                        title={
                          <div className="card-header-with-status">
                            <span className="card-title-with-status">{module.title}</span>
                            <span 
                              className={`status-indicator ${linkedSituation ? 'linked' : 'unlinked'}`}
                              title={linkedSituation ? 'Linked to Learning Situation' : 'Not linked to any Learning Situation'}
                            />
                          </div>
                        }
                        headerActions={
                          <Button 
                            variant="tertiary"
                            isIcon={true}
                            className="delete-button"
                            onClick={(e) => handleDeleteModule(e, module.id)}
                            title="Delete module"
                          >
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            </svg>
                          </Button>
                        }
                      >
                        <div className="card-content">
                          {linkedSituation && (
                            <div className="module-linked-info sofia-mb-2">
                              Linked to: <strong>{linkedSituation.title}</strong>
                            </div>
                          )}
                          <p>{module.description}</p>
                          <div className="card-chips sofia-d-flex sofia-gap-2 sofia-mt-2">
                            {module.year && (
                              <span className="chip year-chip">
                                {schoolData.years.find(y => y.id === module.year)?.name || 'Unknown Year'}
                              </span>
                            )}
                            {module.subject && (
                              <span className="chip subject-chip">
                                {schoolData.years
                                  .flatMap(year => year.subjects)
                                  .find(s => s.id === module.subject)?.name || 'Unknown Subject'}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                ) : (
                  <p>No modules available.</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Module Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmModuleDialog.isOpen}
          onClose={() => setConfirmModuleDialog({ isOpen: false, moduleId: null })}
          onConfirm={handleConfirmModuleDelete}
          title="Delete Module"
          message="Are you sure you want to delete this module? This action cannot be undone."
        />

        {/* Delete Learning Situation ConfirmDialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, situationId: null })}
          onConfirm={handleConfirmDelete}
          title="Delete Learning Situation"
          message="Are you sure you want to delete this learning situation? This action cannot be undone."
        />
      </Page>
    </Layout>
  );
};

export default Content; 