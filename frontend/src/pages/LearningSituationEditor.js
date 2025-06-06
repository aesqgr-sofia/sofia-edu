import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { Button, Card, Page } from '../components/common';
import './LearningSituationEditor.css';

const LearningSituationEditor = () => {
  const { situationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authToken, userData } = useContext(AuthContext);
  const dropAreaRef = useRef(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const presetYearId = queryParams.get('yearId');
  const presetSubjectId = queryParams.get('subjectId');
  const unitIndex = queryParams.get('unitIndex');
  const returnUrl = queryParams.get('returnUrl');
  
  // Determine if year and subject fields should be hidden
  const hideYearSubject = !!presetSubjectId;
  
  // State variables
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  
  // Learning Situation data
  const [learningSituation, setLearningSituation] = useState({
    title: '',
    description: '',
    year: presetYearId || '',
    subject: presetSubjectId || '',
    modules: []
  });
  
  // Available modules (to drag)
  const [availableModules, setAvailableModules] = useState([]);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  
  // Library visibility state
  const [libraryVisible, setLibraryVisible] = useState(false);
  
  // Module modal state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  
  // Track if we're creating a new situation or editing existing
  const isNewSituation = !situationId;
  
  // Fetch all necessary data on component mount
  useEffect(() => {
    fetchInitialData();
  }, [situationId]);
  
  // Fetch subject details when presetSubjectId changes
  useEffect(() => {
    if (presetSubjectId) {
      fetchSubjectDetails();
    }
  }, [presetSubjectId, authToken]);
  
  // Update available subjects when year changes
  useEffect(() => {
    if (schoolData && learningSituation.year) {
      const selectedYearData = schoolData.years.find(year => year.id === learningSituation.year);
      setAvailableSubjects(selectedYearData?.subjects || []);
    }
  }, [learningSituation.year, schoolData]);
  
  // Fetch modules when subject changes
  useEffect(() => {
    if (learningSituation.subject) {
      fetchAvailableModules();
    }
  }, [learningSituation.subject]);
  
  // Add a useEffect to check for URL parameters that might have a module to add
  useEffect(() => {
    // Check URL for any query parameters like addModule
    const queryParams = new URLSearchParams(window.location.search);
    const moduleToAdd = queryParams.get('addModule');
    
    if (moduleToAdd) {
      // Fetch the module to add it to the selected modules
      const fetchModule = async () => {
        try {
          const moduleResponse = await axios.get(`/api/core/modules/${moduleToAdd}/`, {
            headers: { Authorization: `Token ${authToken}` }
          });
          
          if (moduleResponse.data) {
            // Add to selected modules if not already there
            if (!selectedModules.some(m => m.id === moduleResponse.data.id)) {
              setSelectedModules(prev => [...prev, moduleResponse.data]);
              showToast(`Module "${moduleResponse.data.title}" added to Learning Situation`);
            }
          }
          
          // Clean up the URL - use the location object from the hook
          navigate(location.pathname, { replace: true });
        } catch (err) {
          console.error('Error fetching added module:', err);
        }
      };
      
      fetchModule();
    }
  }, []);
  
  // When component mounts, try to restore state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('learningSituationState');
    
    // If we have saved state and this is a new situation, restore it
    if (savedState && isNewSituation && !loading) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('Restoring saved learning situation state:', parsedState);
        
        // Only restore state if we've completed the initial data fetch
        // This prevents the initial data fetch from overwriting our restored state
        
        // Restore form fields
        if (parsedState.title) setLearningSituation(prev => ({ ...prev, title: parsedState.title }));
        if (parsedState.description) setLearningSituation(prev => ({ ...prev, description: parsedState.description }));
        if (parsedState.year) setLearningSituation(prev => ({ ...prev, year: parsedState.year }));
        if (parsedState.subject) setLearningSituation(prev => ({ ...prev, subject: parsedState.subject }));
        
        // Fetch and restore selected modules if there are any
        if (parsedState.selectedModules && parsedState.selectedModules.length > 0) {
          const fetchSelectedModules = async () => {
            try {
              const modulePromises = parsedState.selectedModules.map(moduleId => 
                axios.get(`/api/core/modules/${moduleId}/`, {
                  headers: { Authorization: `Token ${authToken}` }
                })
              );
              
              const moduleResponses = await Promise.all(modulePromises);
              const modules = moduleResponses.map(response => response.data);
              
              // Fetch competence details for each module
              const modulesWithDetails = await Promise.all(
                modules.map(module => fetchCompetenceDetailsForModule(module))
              );
              
              setSelectedModules(modulesWithDetails);
            } catch (err) {
              console.error('Error fetching saved modules:', err);
            }
          };
          
          fetchSelectedModules();
        }
      } catch (err) {
        console.error('Error parsing saved state:', err);
        // Clear invalid state
        localStorage.removeItem('learningSituationState');
      }
    }
    
    // Clear saved state if editing an existing situation
    if (!isNewSituation) {
      localStorage.removeItem('learningSituationState');
    }
  }, [isNewSituation, loading, authToken]);
  
  // Helper function to fetch competence details for a module
  const fetchCompetenceDetailsForModule = async (module) => {
    try {
      // Fetch full competence data if we have competence IDs
      if (module.specific_competences && module.specific_competences.length > 0) {
        // Get all competences and filter by the ones in the module
        const competencesResponse = await axios.get('/api/core/specific-competences/', {
          headers: { Authorization: `Token ${authToken}` },
          params: {
            subject: module.subject,
            year: module.year
          }
        });
        
        // Filter competences to only include the ones referenced in the module
        const moduleCompetences = competencesResponse.data.filter(competence =>
          module.specific_competences.includes(competence.id)
        );
        
        // Add the full competence objects to the module data
        module.competence_details = moduleCompetences;
        
        // Also create a mapping for criteria details
        if (module.selected_criteria && Object.keys(module.selected_criteria).length > 0) {
          const criteriaDetails = [];
          
          // Extract all selected criteria from the module
          Object.entries(module.selected_criteria).forEach(([competenceId, criteriaIds]) => {
            const competence = moduleCompetences.find(c => c.id === competenceId);
            if (competence && competence.evaluation_criteria) {
              criteriaIds.forEach(criterionId => {
                const criterion = competence.evaluation_criteria.find(c => c.id === criterionId);
                if (criterion) {
                  criteriaDetails.push({
                    ...criterion,
                    competence_id: competenceId
                  });
                }
              });
            }
          });
          
          module.criteria_details = criteriaDetails;
        }
      }
    } catch (error) {
      console.error('Error fetching competence details for module:', error);
    }
    
    return module;
  };

  // Fetch dashboard data, years, and if editing, the learning situation
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch school data (years, subjects)
      const dashboardResponse = await axios.get('/api/auth/dashboard/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      setSchoolData(dashboardResponse.data);
      setAvailableYears(dashboardResponse.data.years);
      
      // If preset subject is provided and we've already fetched subject details
      if (presetSubjectId && subjectDetails && subjectDetails.year) {
        const yearData = dashboardResponse.data.years.find(y => y.id === subjectDetails.year.id);
        if (yearData) {
          setAvailableSubjects(yearData.subjects || []);
        }
      }
      // If preset year is provided, set available subjects based on that year
      else if (presetYearId && dashboardResponse.data) {
        const yearData = dashboardResponse.data.years.find(y => y.id === presetYearId);
        if (yearData) {
          setAvailableSubjects(yearData.subjects || []);
        }
      }
      
      // If we're editing an existing situation, fetch its data
      if (situationId) {
        const situationResponse = await axios.get(`/api/core/learning-situations/${situationId}/`, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        const situation = situationResponse.data;
        
        // Get complete module objects
        let moduleObjects = [];
        if (situation.modules && situation.modules.length > 0) {
          const moduleIds = situation.modules;
          // Fetch full details of each module
          const modulesPromises = moduleIds.map(id => 
            axios.get(`/api/core/modules/${id}/`, {
              headers: { Authorization: `Token ${authToken}` }
            })
          );
          
          const moduleResponses = await Promise.all(modulesPromises);
          const modules = moduleResponses.map(response => response.data);
          
          // Fetch competence details for each module
          const modulesWithDetails = await Promise.all(
            modules.map(module => fetchCompetenceDetailsForModule(module))
          );
          
          moduleObjects = modulesWithDetails;
        }
        
        // If we have preset values and this is an edit, prioritize the preset values
        // If we have a preset subject, use its details instead
        const yearToUse = subjectDetails?.year?.id || presetYearId || situation.year || '';
        const subjectToUse = presetSubjectId || situation.subject || '';
        
        setLearningSituation({
          title: situation.title || '',
          description: situation.description || '',
          year: yearToUse,
          subject: subjectToUse,
          modules: moduleObjects || []
        });
        
        setSelectedModules(moduleObjects || []);
        
        // Set available subjects based on the selected year
        if (yearToUse && dashboardResponse.data) {
          const yearData = dashboardResponse.data.years.find(y => y.id === yearToUse);
          if (yearData) {
            setAvailableSubjects(yearData.subjects || []);
          }
        }
      } else {
        // This is a new situation, use the preset values if available
        if (presetSubjectId && subjectDetails) {
          setLearningSituation(prev => ({
            ...prev,
            year: subjectDetails.year?.id || '',
            subject: presetSubjectId
          }));
        } else if (presetYearId && presetSubjectId) {
          setLearningSituation(prev => ({
            ...prev,
            year: presetYearId,
            subject: presetSubjectId
          }));
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };
  
  // Fetch modules for the selected subject
  const fetchAvailableModules = async () => {
    try {
      if (!learningSituation.subject) return;
      
      // Get modules for this subject
      const response = await axios.get('/api/core/modules/', {
        params: { subject: learningSituation.subject },
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Mark modules that are already in the learning situation
      const modules = response.data.map(module => {
        const isSelected = selectedModules.some(m => m.id === module.id);
        return {
          ...module,
          isSelected
        };
      });
      
      setAvailableModules(modules);
    } catch (err) {
      console.error('Error fetching modules:', err);
      showToast('Failed to load modules', 'error');
    }
  };
  
  // Handle input changes for the learning situation form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setLearningSituation(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If changing year, reset subject
    if (name === 'year') {
      setLearningSituation(prev => ({
        ...prev,
        subject: ''
      }));
    }
  };
  
  // Handle drag start for a module
  const handleDragStart = (e, module) => {
    e.dataTransfer.setData('module', JSON.stringify(module));
    e.currentTarget.classList.add('dragging');
  };
  
  // Handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add('drag-over');
  };
  
  // Handle drag leave
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  // Handle drop onto the selected modules area
  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const moduleData = JSON.parse(e.dataTransfer.getData('module'));
      
      // Check if the module is already selected
      if (!selectedModules.some(m => m.id === moduleData.id)) {
        // Fetch detailed module data including competences and evaluation criteria
        try {
          const detailedResponse = await axios.get(`/api/core/modules/${moduleData.id}/`, {
            headers: { Authorization: `Token ${authToken}` }
          });
          
          const detailedModule = detailedResponse.data;
          console.log('Detailed module data:', detailedModule);
          console.log('Module specific_competences:', detailedModule.specific_competences);
          console.log('Module selected_criteria:', detailedModule.selected_criteria);
          
          // Fetch full competence data if we have competence IDs
          if (detailedModule.specific_competences && detailedModule.specific_competences.length > 0) {
            try {
              // Get all competences and filter by the ones in the module
              const competencesResponse = await axios.get('/api/core/specific-competences/', {
                headers: { Authorization: `Token ${authToken}` },
                params: {
                  subject: detailedModule.subject,
                  year: detailedModule.year
                }
              });
              
              // Filter competences to only include the ones referenced in the module
              const moduleCompetences = competencesResponse.data.filter(competence =>
                detailedModule.specific_competences.includes(competence.id)
              );
              
              console.log('Fetched competences for module:', moduleCompetences);
              
              // Add the full competence objects to the module data
              detailedModule.competence_details = moduleCompetences;
              
              // Also create a mapping for criteria details
              if (detailedModule.selected_criteria && Object.keys(detailedModule.selected_criteria).length > 0) {
                const criteriaDetails = [];
                
                // Extract all selected criteria from the module
                Object.entries(detailedModule.selected_criteria).forEach(([competenceId, criteriaIds]) => {
                  const competence = moduleCompetences.find(c => c.id === competenceId);
                  if (competence && competence.evaluation_criteria) {
                    criteriaIds.forEach(criterionId => {
                      const criterion = competence.evaluation_criteria.find(c => c.id === criterionId);
                      if (criterion) {
                        criteriaDetails.push({
                          ...criterion,
                          competence_id: competenceId
                        });
                      }
                    });
                  }
                });
                
                console.log('Extracted criteria details:', criteriaDetails);
                detailedModule.criteria_details = criteriaDetails;
              }
              
            } catch (competenceError) {
              console.error('Error fetching competence details:', competenceError);
            }
          }
          
          // Add the detailed module to selected modules
          setSelectedModules([...selectedModules, detailedModule]);
          
          // Update the available modules list to mark this one as selected
          setAvailableModules(modules => 
            modules.map(module => 
              module.id === moduleData.id 
                ? { ...module, isSelected: true } 
                : module
            )
          );
          
          showToast(`"${moduleData.title}" added to Learning Situation`);
        } catch (detailError) {
          console.error('Error fetching detailed module data:', detailError);
          // Fallback to basic module data if detailed fetch fails
          setSelectedModules([...selectedModules, moduleData]);
          
          setAvailableModules(modules => 
            modules.map(module => 
              module.id === moduleData.id 
                ? { ...module, isSelected: true } 
                : module
            )
          );
          
          showToast(`"${moduleData.title}" added to Learning Situation`);
        }
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    }
  };
  
  // Remove a module from the selected list
  const handleRemoveModule = (moduleId) => {
    setSelectedModules(modules => modules.filter(m => m.id !== moduleId));
    
    // Update the available modules list to unmark this one
    setAvailableModules(modules => 
      modules.map(module => 
        module.id === moduleId 
          ? { ...module, isSelected: false } 
          : module
      )
    );
    
    const moduleName = availableModules.find(m => m.id === moduleId)?.title || 'Module';
    showToast(`"${moduleName}" removed from Learning Situation`);
  };
  
  // Save the learning situation
  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!learningSituation.title) {
        showToast('Please enter a title for the Learning Situation', 'error');
        setSaving(false);
        return;
      }
      
      if (!learningSituation.year || !learningSituation.subject) {
        showToast('Please select both Year and Subject', 'error');
        setSaving(false);
        return;
      }
      
      // Extract just the IDs for the API call
      const moduleIds = selectedModules.map(module => module.id);
      
      const payload = {
        title: learningSituation.title,
        description: learningSituation.description,
        year: learningSituation.year,
        subject: learningSituation.subject,
        modules: moduleIds,
        school: schoolData.id // Ensure we have the school ID
      };
      
      let response;
      let newSituationId;
      
      if (isNewSituation) {
        // Create new learning situation
        response = await axios.post('/api/core/learning-situations/', payload, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        newSituationId = response.data.id;
        showToast('Learning Situation created successfully!');
        
        // If we need to assign to a unit, do it now
        if (unitIndex !== null) {
          // Calculate dates based on unit position
          const dates = calculateDates(parseInt(unitIndex));
          
          // Create planning unit for this position with the new learning situation
          await axios.post('/api/core/planning-units/bulk-update/', {
            subject: presetSubjectId,
            units: [
              {
                unit_number: parseInt(unitIndex),
                learning_situation: newSituationId,
                start_date: dates.startDate,
                end_date: dates.endDate
              }
            ]
          }, { headers: { Authorization: `Token ${authToken}` } });
        }
      } else {
        // Update existing learning situation
        response = await axios.put(`/api/core/learning-situations/${situationId}/`, payload, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        showToast('Learning Situation updated successfully!');
      }
      
      // Navigate back to the return URL after successful save
      setTimeout(() => {
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate('/content');
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error saving learning situation:', err);
      showToast(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to save Learning Situation',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };
  
  // Calculate dates based on unit position (copied from SubjectLearningDragDrop.js)
  const calculateDates = (unitIndex) => {
    // Simple calculation: 2 weeks per unit
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + unitIndex * 14);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };
  
  // Toggle library visibility
  const toggleLibrary = () => {
    setLibraryVisible(!libraryVisible);
  };
  
  // Show a toast message
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  // Filtered modules based on search query
  const filteredModules = availableModules.filter(module => {
    return (
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (module.description && 
       module.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  
  // Get a year name from its ID
  const getYearName = (yearId) => {
    if (!yearId) return '';
    
    // Log for debugging
    console.log('Looking up year name for ID:', yearId);
    console.log('Available years:', availableYears);
    
    const year = availableYears.find(y => y.id === yearId);
    if (year) {
      return `${year.name}${year.division ? ` - ${year.division}` : ''}`;
    }
    
    // If not found in availableYears, check if this is coming from subjectDetails
    if (subjectDetails?.year && typeof subjectDetails.year === 'object') {
      if (subjectDetails.year.id === yearId) {
        return `${subjectDetails.year.name}${subjectDetails.year.division ? ` - ${subjectDetails.year.division}` : ''}`;
      }
    }
    
    return '';
  };
  
  // Get a subject name from its ID
  const getSubjectName = (subjectId) => {
    const allSubjects = availableYears.flatMap(year => year.subjects || []);
    const subject = allSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : '';
  };
  
  // Function to handle creating a new module
  const handleCreateModule = (e) => {
    if (e) e.preventDefault(); // Prevent default navigation
    
    // Save current state before navigating
    const stateToSave = {
      title: learningSituation.title,
      description: learningSituation.description,
      year: learningSituation.year,
      subject: learningSituation.subject,
      selectedModules: selectedModules.map(m => m.id)
    };
    
    console.log('Saving learning situation state:', stateToSave);
    localStorage.setItem('learningSituationState', JSON.stringify(stateToSave));
    
    // Set flag for where to return to
    localStorage.setItem('returnToSituation', isNewSituation ? 'new' : situationId);
    
    // Create URL with query params to pass the necessary year and subject IDs
    navigate(`/module/new?yearId=${learningSituation.year}&subjectId=${learningSituation.subject}`);
  };
  
  // Function to handle editing an existing module
  const handleEditModule = (module) => {
    setActiveModule(module);
    setIsModuleModalOpen(true);
  };
  
  // Function to handle saving a module (from the modal)
  const handleSaveModule = async (moduleData) => {
    try {
      setIsModuleModalOpen(false);
      
      // Refresh the available modules list after saving
      await fetchAvailableModules();
      
      showToast(`Module ${activeModule ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving module:', err);
      showToast('Failed to save module', 'error');
    }
  };
  
  // Function to fetch subject details from the backend
  const fetchSubjectDetails = async () => {
    try {
      const response = await axios.get(`/api/core/subjects/${presetSubjectId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      setSubjectDetails(response.data);
      
      // Log the subject details for debugging
      console.log('Subject details fetched:', response.data);
      console.log('Year from subject:', response.data.year);
      
      // Update learning situation with subject and year data
      setLearningSituation(prev => ({
        ...prev,
        subject: presetSubjectId,
        year: response.data.year || ''  // Ensure we're getting the year ID
      }));
    } catch (err) {
      console.error('Error fetching subject details:', err);
      setError('Failed to load subject data. Please try again.');
    }
  };
  
  // Render the content
  return (
    <Layout>
      <div className={`learning-situation-editor ${libraryVisible ? 'library-open' : ''}`}>
        {/* Secondary navigation bar */}
        <div className="editor-navbar">
          <div className="nav-center">
            <h1>{situationId === 'new' ? 'Create Learning Situation' : 'Edit Learning Situation'}</h1>
          </div>
          <div className="nav-right">
            <Button
              className={`library-button ${libraryVisible ? 'active' : ''}`}
              onClick={toggleLibrary}
              variant="text"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H19.5C19.7761 4 20 4.22386 20 4.5V19.5C20 19.7761 19.7761 20 19.5 20H4.5C4.22386 20 4 19.7761 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {libraryVisible ? 'Close Library' : 'Modules'}
            </Button>
          </div>
        </div>
        
        <div className="editor-content">
          <div className="editor-main">
            <Card title="Learning Situation Details">
              <div className="form-field">
                <label htmlFor="title">Title:</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={learningSituation.title}
                  onChange={handleInputChange}
                  placeholder="Enter learning situation title"
                  required
                />
              </div>
              
              <div className="form-field">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={learningSituation.description}
                  onChange={handleInputChange}
                  placeholder="Enter learning situation description"
                  rows="4"
                />
              </div>
              
              <div className="form-row">
                {!hideYearSubject && (
                  <>
                    <div className="form-field">
                      <label htmlFor="year">Year:</label>
                      <select
                        id="year"
                        name="year"
                        value={learningSituation.year}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Year</option>
                        {availableYears.map(year => (
                          <option key={year.id} value={year.id}>
                            {year.name}{year.division ? ` - ${year.division}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-field">
                      <label htmlFor="subject">Subject:</label>
                      <select
                        id="subject"
                        name="subject"
                        value={learningSituation.subject}
                        onChange={handleInputChange}
                        required
                        disabled={!learningSituation.year}
                      >
                        <option value="">Select Subject</option>
                        {availableSubjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                {hideYearSubject && (
                  <div className="form-field-info">
                    <p>
                      <strong>Year and Subject:</strong> {getYearName(subjectDetails?.year?.id || learningSituation.year)} - {subjectDetails?.name || getSubjectName(learningSituation.subject)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
            
            <Card 
              title="Selected Modules"
              headerActions={
                <p className="section-hint">
                  {selectedModules.length === 0 
                    ? 'Drag modules from the library to add them to this learning situation.' 
                    : `${selectedModules.length} module(s) selected.`}
                </p>
              }
            >
              <div 
                className="selected-modules-container"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedModules.length > 0 ? (
                  <div className="selected-modules-grid">
                    {selectedModules.map(module => (
                      <div key={module.id} className="selected-module-card">
                        <div className="module-card-content">
                          <h3>{module.title}</h3>
                          <div dangerouslySetInnerHTML={{ __html: module.description }} />
                          
                          {/* Display Competences */}
                          {module.competence_details && module.competence_details.length > 0 ? (
                            <div className="module-competences">
                              <h4>Specific Competences:</h4>
                              <div className="competence-codes">
                                {module.competence_details.map(competence => (
                                  <span key={competence.id} className="competence-code">
                                    {competence.code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : module.specific_competences && module.specific_competences.length > 0 && (
                            <div className="module-competences">
                              <h4>Specific Competences:</h4>
                              <div className="competence-codes">
                                <span className="competence-code" style={{ background: '#fee2e2', color: '#7f1d1d' }}>
                                  Loading competence details...
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Display Evaluation Criteria */}
                          {module.criteria_details && module.criteria_details.length > 0 ? (
                            <div className="module-criteria">
                              <h4>Evaluation Criteria:</h4>
                              <div className="criteria-codes">
                                {module.criteria_details.map(criterion => (
                                  <span key={`${criterion.competence_id}-${criterion.id}`} className="criterion-code">
                                    {criterion.description}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : module.selected_criteria && Object.keys(module.selected_criteria).length > 0 && (
                            <div className="module-criteria">
                              <h4>Evaluation Criteria:</h4>
                              <div className="criteria-codes">
                                <span className="criterion-code" style={{ background: '#fee2e2', color: '#7f1d1d' }}>
                                  Loading criteria details...
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="tertiary"
                          isIcon={true}
                          onClick={() => handleRemoveModule(module.id)}
                          title="Remove module"
                          className="remove-module-button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-selection">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                    </svg>
                    <p>Drag modules here from the library</p>
                  </div>
                )}
              </div>
            </Card>
            
            <div className="form-actions sofia-d-flex sofia-gap-3 sofia-justify-end sofia-mt-4">
              <Button 
                variant="secondary" 
                onClick={() => returnUrl ? navigate(returnUrl) : navigate('/content')}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                isLoading={saving}
              >
                {saving ? 'Saving...' : 'Save Learning Situation'}
              </Button>
            </div>
          </div>
          
          {/* Modules Library */}
          <div className={`modules-library ${libraryVisible ? 'visible' : ''}`}>
            <div className="library-header">
              <h2>Modules Library</h2>
              <div className="library-header-buttons">
                <Button 
                  variant="tertiary"
                  isIcon={true}
                  onClick={toggleLibrary}
                  title="Close Library"
                  className="close-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="library-search">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="library-items">
              {learningSituation.subject ? (
                filteredModules.length > 0 ? (
                  filteredModules.map(module => (
                    <div 
                      key={module.id} 
                      className={`library-item ${module.isSelected ? 'selected' : ''}`}
                      draggable={!module.isSelected}
                      onDragStart={(e) => !module.isSelected && handleDragStart(e, module)}
                      onDragEnd={handleDragEnd}
                    >
                      <h3 className="item-title">{module.title}</h3>
                      <p className="item-description">
                        {module.description || 'No description available.'}
                      </p>
                      <div className="item-status">
                        {module.isSelected ? (
                          <span className="status-badge selected">Selected</span>
                        ) : (
                          <span className="status-badge available">Available</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="library-empty">
                    <p>No modules found matching your search criteria.</p>
                  </div>
                )
              ) : (
                <div className="library-empty select-prompt">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.159.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                  </svg>
                  <p>Please select a Year and Subject to view available modules.</p>
                </div>
              )}
            </div>
            
            <div className="library-footer">
              <Button 
                variant="secondary" 
                onClick={() => {
                  // Save current state before navigating
                  const stateToSave = {
                    title: learningSituation.title,
                    description: learningSituation.description,
                    year: learningSituation.year,
                    subject: learningSituation.subject,
                    selectedModules: selectedModules.map(m => m.id)
                  };
                  
                  console.log('Saving learning situation state:', stateToSave);
                  localStorage.setItem('learningSituationState', JSON.stringify(stateToSave));
                  
                  // Save the current situation to return to after creating the module
                  localStorage.setItem('returnToSituation', situationId || 'new');
                  navigate(`/subjects/${learningSituation.subject}/years/${learningSituation.year}/create-module`);
                }}
                title="Create New Module"
                disabled={!learningSituation.subject}
                className="create-module-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                <span>Create New Module</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notification */}
      {toastMessage && (
        <div className={`toast-notification ${toastMessage.type}`}>
          {toastMessage.message}
        </div>
      )}
      
      {/* Saving overlay */}
      {saving && (
        <div className="saving-overlay">
          <div className="spinner"></div>
          <p>Saving changes...</p>
        </div>
      )}
    </Layout>
  );
};

export default LearningSituationEditor; 