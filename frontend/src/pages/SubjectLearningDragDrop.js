import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import LearningSituationModal from '../components/LearningSituationModal';
import CompetenceCoverage from '../components/competence/CompetenceCoverage';
import { Button, Card, Page } from '../components/common';
import './SubjectLearningDragDrop.css';

const SubjectLearningDragDrop = () => {
  const { t } = useTranslation(['subjects', 'common', 'learning', 'navigation']);
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { authToken } = useContext(AuthContext);
  
  // State variables
  const [subject, setSubject] = useState(null);
  const [learningSituations, setLearningSituations] = useState([]);
  const [plannedSituations, setPlannedSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [libraryVisible, setLibraryVisible] = useState(false);
  
  // Competence coverage state
  const [allCompetences, setAllCompetences] = useState([]);
  const [coverageExpanded, setCoverageExpanded] = useState(false);
  
  // Modal state for creating new learning situation
  const [showLearningSituationModal, setShowLearningSituationModal] = useState(false);
  const [learningSituationName, setLearningSituationName] = useState('');
  const [learningSituationDescription, setLearningSituationDescription] = useState('');
  const [learningSituationError, setLearningSituationError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [creatingForUnitIndex, setCreatingForUnitIndex] = useState(null);
  
  // Modal state for editing a learning situation
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSituation, setEditingSituation] = useState(null);
  
  // Constants
  const GRID_COLUMNS = 2; // Number of columns in the grid
  
  // Add new state variable for planning units
  const [planningUnits, setPlanningUnits] = useState([]);
  
  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, [subjectId]);
  
  // Filtered learning situations for search
  const filteredSituations = learningSituations.filter(situation => 
    situation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (situation.description && situation.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Fetch subject and learning situations data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subject details
      const subjectResponse = await axios.get(`/api/core/subjects/${subjectId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Subject data received:', subjectResponse.data);
      setSubject(subjectResponse.data);
      
      // Set selected year from subject
      if (subjectResponse.data.year) {
        console.log('Year from subject:', subjectResponse.data.year);
        setSelectedYear(subjectResponse.data.year.id);
      }
      
      // Fetch learning situations for this subject
      const situationsResponse = await axios.get('/api/core/learning-situations/', {
        params: { subject: subjectId },
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Fetch planning units for this subject
      const planningResponse = await axios.get('/api/core/planning-units/', {
        params: { subject: subjectId },
        headers: { Authorization: `Token ${authToken}` }
      });

      // Fetch full details for planned learning situations including module details
      const planningUnitsWithDetails = await Promise.all(
        planningResponse.data.map(async (unit) => {
          if (unit.learning_situation) {
            try {
              // Fetch the full learning situation details
              const situationResponse = await axios.get(`/api/core/learning-situations/${unit.learning_situation}/`, {
                headers: { Authorization: `Token ${authToken}` }
              });

              // Fetch modules for this learning situation
              if (situationResponse.data.modules && situationResponse.data.modules.length > 0) {
                const modulesWithDetails = await Promise.all(
                  situationResponse.data.modules.map(async (moduleId) => {
                    const moduleResponse = await axios.get(`/api/core/modules/${moduleId}/`, {
                      headers: { Authorization: `Token ${authToken}` }
                    });
                    
                    // Fetch competence details for each module
                    if (moduleResponse.data.specific_competences && moduleResponse.data.specific_competences.length > 0) {
                      const competencesResponse = await axios.get('/api/core/specific-competences/', {
                        params: { 
                          subject: moduleResponse.data.subject,
                          year: moduleResponse.data.year
                        },
                        headers: { Authorization: `Token ${authToken}` }
                      });
                      
                      const moduleCompetences = competencesResponse.data.filter(competence =>
                        moduleResponse.data.specific_competences.includes(competence.id)
                      );
                      
                      moduleResponse.data.competence_details = moduleCompetences;
                    }
                    
                    return moduleResponse.data;
                  })
                );

                situationResponse.data.modules = modulesWithDetails;
              }

              return {
                ...unit,
                learning_situation_details: situationResponse.data
              };
            } catch (error) {
              console.error('Error fetching planning unit situation details:', error);
              return unit;
            }
          }
          return unit;
        })
      );
      
      // Fetch all competences for this subject and year
      if (subjectResponse.data.year) {
        try {
          const competencesResponse = await axios.get('/api/core/specific-competences/', {
            params: { 
              subject: subjectId,
              year: subjectResponse.data.year.id
            },
            headers: { Authorization: `Token ${authToken}` }
          });
          setAllCompetences(competencesResponse.data);
        } catch (competenceError) {
          console.error('Error fetching competences:', competenceError);
          setAllCompetences([]);
        }
      }
      
      // Fetch modules for all learning situations to get competence details
      const situationsWithModules = await Promise.all(
        situationsResponse.data.map(async (situation) => {
          if (situation.modules && situation.modules.length > 0) {
            try {
              const modulesWithDetails = await Promise.all(
                situation.modules.map(async (moduleId) => {
                  const moduleResponse = await axios.get(`/api/core/modules/${moduleId}/`, {
                    headers: { Authorization: `Token ${authToken}` }
                  });
                  
                  // Fetch competence details for each module
                  if (moduleResponse.data.specific_competences && moduleResponse.data.specific_competences.length > 0) {
                    const competencesResponse = await axios.get('/api/core/specific-competences/', {
                      params: { 
                        subject: moduleResponse.data.subject,
                        year: moduleResponse.data.year
                      },
                      headers: { Authorization: `Token ${authToken}` }
                    });
                    
                    const moduleCompetences = competencesResponse.data.filter(competence =>
                      moduleResponse.data.specific_competences.includes(competence.id)
                    );
                    
                    moduleResponse.data.competence_details = moduleCompetences;
                  }
                  
                  return moduleResponse.data;
                })
              );
              
              return {
                ...situation,
                modules: modulesWithDetails
              };
            } catch (moduleError) {
              console.error('Error fetching module details:', moduleError);
              return situation;
            }
          }
          return situation;
        })
      );
      
      // Set planning units with full details
      setPlanningUnits(planningUnitsWithDetails);
      
      // Filter learning situations that are not assigned to planning units
      const assignedIds = planningUnitsWithDetails
        .filter(unit => unit.learning_situation)
        .map(unit => unit.learning_situation);
      
      const availableSituations = situationsWithModules.filter(
        situation => !assignedIds.includes(situation.id)
      );
      
      setLearningSituations(availableSituations);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle drag start
  const handleDragStart = (e, situation) => {
    e.dataTransfer.setData('application/json', JSON.stringify(situation));
    e.currentTarget.classList.add('dragging');
  };
  
  // Handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };
  
  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    
    if (e.currentTarget.classList.contains('chapter-unit') || 
        e.currentTarget.classList.contains('chapter-unit-empty')) {
      e.dataTransfer.dropEffect = 'copy';
      e.currentTarget.classList.add('drag-over');
    }
  };
  
  // Handle drag leave
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };
  
  // Handle drop
  const handleDrop = async (e, unitIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const situationData = JSON.parse(e.dataTransfer.getData('application/json'));
      
      setSaving(true);
      
      // Calculate dates based on unit position
      const dates = calculateDates(unitIndex);
      
      // Update or create planning unit for this position
      await axios.post('/api/core/planning-units/bulk-update/', {
        subject: subjectId,
        units: [
          {
            unit_number: unitIndex,
            learning_situation: situationData.id,
            start_date: dates.startDate,
            end_date: dates.endDate
          }
        ]
      }, { headers: { Authorization: `Token ${authToken}` } });
      
      // Show success message
      showToast(`"${situationData.title}" added to Unit ${unitIndex + 1}`);
      
      // Refresh data
      await fetchData();
      
      setSaving(false);
    } catch (err) {
      console.error('Error handling drop:', err);
      showToast('Failed to update planning unit', 'error');
      setSaving(false);
    }
  };
  
  // Handle date change for a learning situation
  const handleDateChange = async (unitIndex, field, value) => {
    try {
      // Find the planning unit to update
      const unit = planningUnits.find(u => u.unit_number === unitIndex);
      
      if (!unit) {
        console.error('Planning unit not found:', unitIndex);
        return;
      }
      
      // Create a new date object ensuring it's valid
      const newDate = new Date(value);
      if (isNaN(newDate.getTime())) {
        console.error('Invalid date:', value);
        return;
      }
      
      // Format the date as YYYY-MM-DD
      const formattedDate = newDate.toISOString().split('T')[0];
      
      // Show saving indicator
      setSaving(true);
      
      // Update the planning unit
      await axios.patch(
        `/api/core/planning-units/${unit.id}/`,
        { [field]: formattedDate },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      // Refresh data
      await fetchData();
      
      // Show success message
      showToast(`Date updated successfully`);
      
      setSaving(false);
    } catch (err) {
      console.error('Error updating date:', err);
      showToast('Failed to update date', 'error');
      setSaving(false);
    }
  };
  
  // Calculate dates based on unit position
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
  
  // Remove a learning situation from a unit
  const handleRemoveSituation = async (unitIndex) => {
    try {
      setSaving(true);
      
      // Find the planning unit
      const unit = planningUnits.find(u => u.unit_number === unitIndex);
      
      if (!unit) {
        console.error('Planning unit not found:', unitIndex);
        return;
      }
      
      // Get the situation title for the toast message
      const situationTitle = unit.learning_situation_details?.title || 'Learning situation';
      
      // Update the planning unit to remove the learning situation
      await axios.patch(
        `/api/core/planning-units/${unit.id}/`,
        { learning_situation: null },
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      // Show success message
      showToast(`"${situationTitle}" removed from course plan`);
      
      // Refresh data
      await fetchData();
      
      setSaving(false);
    } catch (err) {
      console.error('Error removing situation:', err);
      showToast('Failed to remove learning situation', 'error');
      setSaving(false);
    }
  };
  
  // Handle edit situation
  const handleEditSituation = (situation) => {
    // Instead of showing the edit modal, navigate to the LearningSituationEditor
    const queryParams = new URLSearchParams();
    queryParams.append('subjectId', subjectId);
    
    // Add a return URL to come back to this page
    queryParams.append('returnUrl', `/subject/${subjectId}/learning-situations`);
    
    // Navigate to the learning situation editor with the situation ID (remove /edit)
    navigate(`/learning-situation/${situation.id}?${queryParams.toString()}`);
  };
  
  // Handle delete situation
  const handleDeleteSituation = async (situation) => {
    if (window.confirm(`Are you sure you want to delete "${situation.title}"?`)) {
      try {
        setSaving(true);
        
        await axios.delete(
          `/api/core/learning-situations/${situation.id}/`,
          { headers: { Authorization: `Token ${authToken}` } }
        );
        
        // Show success message
        showToast(`Learning situation "${situation.title}" deleted successfully`);
        
        // Refresh data
        await fetchData();
        
        setSaving(false);
      } catch (err) {
        console.error('Error deleting learning situation:', err);
        showToast('Failed to delete learning situation', 'error');
        setSaving(false);
      }
    }
  };
  
  // Handle update situation
  const handleUpdateSituation = async (e) => {
    e.preventDefault();
    setLearningSituationError(null);
    
    try {
      setSaving(true);
      
      const payload = {
        title: learningSituationName,
        description: learningSituationDescription,
      };
      
      await axios.patch(
        `/api/core/learning-situations/${editingSituation.id}/`,
        payload,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      // Refresh data
      await fetchData();
      
      // Reset form and close modal
      resetLearningSituationForm();
      setShowEditModal(false);
      setEditingSituation(null);
      
      // Show success message
      showToast(`Learning situation "${learningSituationName}" updated successfully`);
      
      setSaving(false);
    } catch (err) {
      console.error('Error updating learning situation:', err);
      setLearningSituationError(
        err.response?.data?.error || 'Failed to update learning situation.'
      );
      setSaving(false);
    }
  };
  
  // Handle create new situation
  const handleCreateNew = (unitIndex = null) => {
    // Instead of showing the modal, navigate to the LearningSituationEditor
    // Pass query parameters for the subject and unit if applicable
    const queryParams = new URLSearchParams();
    queryParams.append('subjectId', subjectId);
    
    // If creating for a specific unit, pass the unit index
    if (unitIndex !== null) {
      queryParams.append('unitIndex', unitIndex);
    }
    
    // Add a return URL to come back to this page
    queryParams.append('returnUrl', `/subject/${subjectId}/learning-situations`);
    
    // Navigate to the learning situation editor
    navigate(`/learning-situation/new?${queryParams.toString()}`);
  };
  
  // Handle learning situation submit
  const handleLearningSituationSubmit = async (e) => {
    e.preventDefault();
    setLearningSituationError(null);
    
    try {
      setSaving(true);
      
      // Get subject data to ensure we have the latest version
      const subjectResponse = await axios.get(`/api/core/subjects/${subjectId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Subject data received:', subjectResponse.data);
      
      // Extract the school ID from the subject data
      const schoolId = subjectResponse.data.school;
      
      if (!schoolId) {
        throw new Error('School ID not found in subject data');
      }
      
      // Create a payload that matches the structure of successful learning situations
      const situationPayload = {
        subject: subjectId,
        school: schoolId,
        title: learningSituationName,
        description: learningSituationDescription,
        year: null  // Explicitly set to null as seen in successful existing situations
      };
      
      // Create learning situation
      const situationResponse = await axios.post(
        '/api/core/learning-situations/create/',
        situationPayload,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      console.log('Learning situation created:', situationResponse.data);
      
      // If we're creating for a specific unit slot, create a planning unit
      if (creatingForUnitIndex !== null) {
        const dates = calculateDates(creatingForUnitIndex);
        
        // Create a planning unit for this learning situation
        await axios.post(
          '/api/core/planning-units/bulk-update/',
          {
            subject: subjectId,
            units: [
              {
                unit_number: creatingForUnitIndex,
                learning_situation: situationResponse.data.id,
                start_date: dates.startDate,
                end_date: dates.endDate
              }
            ]
          },
          { headers: { Authorization: `Token ${authToken}` } }
        );
        
        console.log(`Created planning unit for Unit ${creatingForUnitIndex + 1}`);
      }
      
      // Refresh data
      await fetchData();
      
      // Reset form and close modal
      resetLearningSituationForm();
      setShowLearningSituationModal(false);
      setCreatingForUnitIndex(null);
      
      // Show success message
      if (creatingForUnitIndex !== null) {
        showToast(`Learning situation "${learningSituationName}" created and assigned to Unit ${creatingForUnitIndex + 1}`);
      } else {
        showToast(`Learning situation "${learningSituationName}" created successfully`);
      }
      
      setSaving(false);
    } catch (err) {
      console.error('Error creating learning situation:', err);
      
      // Enhanced error logging
      if (err.response) {
        console.error('Server response error:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        });
      }
      
      setLearningSituationError(
        err.response?.data?.error || err.message || 'Failed to create learning situation.'
      );
      setSaving(false);
    }
  };
  
  // Reset learning situation form
  const resetLearningSituationForm = () => {
    setLearningSituationName('');
    setLearningSituationDescription('');
    setLearningSituationError(null);
    setCreatingForUnitIndex(null);
  };
  
  // Show toast message
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  // Toggle library visibility
  const toggleLibrary = () => {
    setLibraryVisible(!libraryVisible);
  };
  
  // Return to subjects list
  const handleReturn = () => {
    navigate('/planner');
  };

  // Get all learning situations (both planned and available) for competence coverage
  const getAllLearningSituations = () => {
    const plannedSituations = planningUnits
      .filter(unit => unit.learning_situation_details)
      .map(unit => unit.learning_situation_details);
    
    console.log('🎯 Getting all learning situations for coverage:');
    console.log('   - Planned situations:', plannedSituations);
    console.log('   - Available situations:', learningSituations);
    
    return [...plannedSituations, ...learningSituations];
  };
  
  // Generate the array of units to display
  const getUnitsToDisplay = () => {
    // Sort planning units by unit number
    const sortedUnits = [...planningUnits].sort((a, b) => a.unit_number - b.unit_number);
    
    // Find the highest unit number
    const highestUnitNumber = sortedUnits.length > 0 
      ? sortedUnits[sortedUnits.length - 1].unit_number 
      : -1;
    
    // Create an array of all units including empty ones
    const allUnits = [];
    for (let i = 0; i <= highestUnitNumber + 1; i++) {
      const existingUnit = sortedUnits.find(unit => unit.unit_number === i);
      
      if (existingUnit && existingUnit.learning_situation) {
        // This is a filled unit
        allUnits.push({
          index: i,
          unit: existingUnit,
          situation: {
            id: existingUnit.learning_situation,
            title: existingUnit.learning_situation_details?.title || 'Unnamed situation',
            description: existingUnit.learning_situation_details?.description || '',
            date_start: existingUnit.start_date,
            date_end: existingUnit.end_date
          }
        });
      } else {
        // This is an empty unit
        allUnits.push({
          index: i,
          unit: existingUnit || null,
          situation: null
        });
      }
    }
    
    return allUnits;
  };
  
  // Add this new function after handleRemoveSituation
  const handleDeleteEmptyUnit = async (unitIndex) => {
    try {
      setSaving(true);

      // Find the planning unit to delete (if it exists)
      const unit = planningUnits.find(u => u.unit_number === unitIndex);

      if (unit) {
        // If the planning unit exists in the database, delete it
        await axios.delete(
          `/api/core/planning-units/${unit.id}/`,
          { headers: { Authorization: `Token ${authToken}` } }
        );
        
        showToast(`Unit ${unitIndex + 1} deleted successfully`);
      } else {
        // If the unit doesn't exist in the database yet (just shown in UI),
        // we don't need to make a delete request
        showToast(`Unit ${unitIndex + 1} removed from view`);
      }

      // Refresh data to update the UI
      await fetchData();
      
      setSaving(false);
    } catch (err) {
      console.error('Error deleting empty unit:', err);
      showToast('Failed to delete unit', 'error');
      setSaving(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Layout schoolName={subject?.name || t('subjects:coursePlanner')} sidebar={<Sidebar schoolName={subject?.name} />}>
        <Page className="textbook-app">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t('subjects:loadingSubjectPlanner')}</p>
          </div>
        </Page>
      </Layout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Layout schoolName={subject?.name || t('subjects:coursePlanner')} sidebar={<Sidebar schoolName={subject?.name} />}>
        <Page className="textbook-app">
          <Card title={t('common:error')}>
            <p>{error}</p>
            <Button 
              variant="primary" 
              onClick={fetchData}
            >
              {t('common:tryAgain')}
            </Button>
          </Card>
        </Page>
      </Layout>
    );
  }
  
  // Get all units to display
  const unitsToDisplay = getUnitsToDisplay();
  
  // Build header actions for the page
  const headerActions = (
    <Button 
      variant={libraryVisible ? 'primary' : 'secondary'}
      onClick={toggleLibrary}
      className={`library-button ${libraryVisible ? 'active' : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
      </svg>
      <span>{libraryVisible ? t('navigation:closeLibrary') : t('navigation:learningSituations')}</span>
    </Button>
  );
  
  // Build breadcrumbs for the page
  const breadcrumbs = (
    <div className="sofia-breadcrumbs">
      <Button 
        variant="tertiary" 
        size="small"
        onClick={handleReturn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        <span>{t('navigation:backToPlanner')}</span>
      </Button>
    </div>
  );
  
  // Build the subtitle with the year info
  const subtitle = subject?.year ? `${subject.year.name}` : '';
  
  return (
    <Layout sidebar={<Sidebar schoolName={subject?.name} />}>
      <div className="subject-learning-editor">
        {/* Secondary navigation bar */}
        <div className="editor-navbar">
          <div className="nav-center">
            <h1>{t('navigation:subjectLearningEditor')}</h1>
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
              {libraryVisible ? t('common:library') : t('common:library')}
            </Button>
          </div>
        </div>

        <div className="editor-content">
          <Page
          >
            {/* Main content area */}
            <div className="textbook-page">
              <div className="chapter-title">
                <h2>{t('learning:coursePlanning')}</h2>
                <p className="chapter-subtitle">{t('learning:dragLearningSituations')}</p>
              </div>
              
              {/* Competence Coverage Section */}
              {allCompetences.length > 0 && (
                <CompetenceCoverage
                  learningSituations={getAllLearningSituations()}
                  allCompetences={allCompetences}
                  isExpanded={coverageExpanded}
                  onToggleExpanded={() => setCoverageExpanded(!coverageExpanded)}
                />
              )}
              
              <div className="chapter-content">
                {unitsToDisplay.map((unit) => {
                  const { index, situation } = unit;
                  
                  return situation ? (
                    // Filled unit
                    <Card
                      key={index}
                      className="chapter-unit filled"
                      title={t('learning:unitNumber', { number: index + 1 }) + ': ' + situation.title}
                      headerActions={
                        <div className="unit-actions">
                          <Button 
                            variant="tertiary"
                            isIcon={true}
                            onClick={() => handleEditSituation(situation)}
                            title={t('common:edit')}
                            className="unit-action-button edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                          </Button>
                          <Button 
                            variant="tertiary"
                            isIcon={true}
                            onClick={() => handleRemoveSituation(index)}
                            title={t('common:remove')}
                            className="unit-action-button remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                          </Button>
                        </div>
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="unit-content">
                        <p className="unit-description">
                          {situation.description || t('subjects:noDescription')}
                        </p>
                        
                        <div className="unit-dates">
                          <div className="date-field">
                            <span className="date-label">{t('common:startDate')}</span>
                            <input 
                              type="date" 
                              className="date-input"
                              value={situation.date_start}
                              onChange={(e) => handleDateChange(index, 'start_date', e.target.value)}
                              aria-label={t('common:startDate')}
                            />
                          </div>
                          <div className="date-field">
                            <span className="date-label">{t('common:endDate')}</span>
                            <input 
                              type="date" 
                              className="date-input"
                              value={situation.date_end}
                              onChange={(e) => handleDateChange(index, 'end_date', e.target.value)}
                              aria-label={t('common:endDate')}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    // Empty unit - match layout of filled unit
                    <Card
                      key={index}
                      className="chapter-unit-empty"
                      title={t('learning:unitNumber', { number: index + 1 })}
                      headerActions={
                        <div className="unit-actions">
                          <Button 
                            variant="tertiary"
                            isIcon={true}
                            onClick={() => handleDeleteEmptyUnit(index)}
                            title={t('learning:deleteUnit')}
                            className="unit-delete-button"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </Button>
                        </div>
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="unit-empty-placeholder">
                        <p className="unit-placeholder">
                          {t('learning:dragSituationHere')}
                        </p>
                        <Button 
                          variant="secondary"
                          onClick={() => handleCreateNew(index)}
                          title={t('learning:createNewSituation')}
                          className="unit-add-button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                          </svg>
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {/* Library panel - positioned directly after navbar to ensure correct stacking */}
            <div className={`textbook-library ${libraryVisible ? 'visible' : ''}`}>
              <div className="library-header">
                <h2>{t('navigation:learningSituations')}</h2>
                <div className="library-header-buttons">
                  <Button 
                    variant="tertiary"
                    isIcon={true}
                    onClick={toggleLibrary}
                    title={t('navigation:closeLibrary')}
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
                  placeholder={t('navigation:searchLearningSituations')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="library-items">
                {filteredSituations.length > 0 ? (
                  filteredSituations.map(situation => (
                                        <div 
                      key={situation.id} 
                      className="library-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, situation)}
                      onDragEnd={handleDragEnd}
                    >
                      <h3 className="item-title">{situation.title}</h3>
                      <p className="item-description">
                        {situation.description || t('subjects:noDescription')}
                      </p>
                      
                      {/* Action buttons at bottom */}
                      <div className="situation-actions">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSituation(situation);
                          }}
                          title={t('common:edit')}
                          className="action-button edit-button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSituation(situation);
                          }}
                          title={t('common:delete')}
                          className="action-button delete-button"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="library-empty">
                    <p>{t('navigation:noLearningSituations')}</p>
                    <p>{t('navigation:createNew')}</p>
                  </div>
                )}
              </div>
              
              <div className="library-footer">
                <Button 
                  variant="primary"
                  onClick={() => handleCreateNew()} 
                  title={t('navigation:createNewSituation')}
                  className="create-circle-button"
                  isIcon={true}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </Page>
          
          {/* Create Learning Situation Modal */}
          <LearningSituationModal
            showModal={showLearningSituationModal}
            learningSituationName={learningSituationName}
            setLearningSituationName={setLearningSituationName}
            learningSituationDescription={learningSituationDescription}
            setLearningSituationDescription={setLearningSituationDescription}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            subjectName={subject?.id}
            setSubjectName={() => {}} // Not needed as subject is fixed
            learningSituationError={learningSituationError}
            handleSubmit={handleLearningSituationSubmit}
            onClose={() => {
              setShowLearningSituationModal(false);
              resetLearningSituationForm();
            }}
            schoolData={subject ? { years: [subject.year] } : { years: [] }}
            hideYearSubject={true} // Hide the Year and Subject fields
            fixedSubject={true}
            modalTitle={creatingForUnitIndex !== null ? t('learning:createSituationForUnit', { number: creatingForUnitIndex + 1 }) : t('learning:createSituation')}
          />
          
          {/* Edit Learning Situation Modal */}
          <LearningSituationModal
            showModal={showEditModal}
            learningSituationName={learningSituationName}
            setLearningSituationName={setLearningSituationName}
            learningSituationDescription={learningSituationDescription}
            setLearningSituationDescription={setLearningSituationDescription}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            subjectName={subject?.id}
            setSubjectName={() => {}} // Not needed as subject is fixed
            learningSituationError={learningSituationError}
            handleSubmit={handleUpdateSituation}
            onClose={() => {
              setShowEditModal(false);
              setEditingSituation(null);
              resetLearningSituationForm();
            }}
            schoolData={subject ? { years: [subject.year] } : { years: [] }}
            hideYearSubject={true} // Hide the Year and Subject fields
            isEditing={true}
            fixedSubject={true}
          />
          
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
              <p>{t('common:savingChanges')}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SubjectLearningDragDrop; 