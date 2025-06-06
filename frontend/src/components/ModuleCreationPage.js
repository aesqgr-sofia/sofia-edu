import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';
import './ModuleCreationPage.css';

const ModuleCreationPage = () => {
  const { yearId, subjectId, moduleId } = useParams();
  const navigate = useNavigate();
  const { authToken, user } = useContext(AuthContext);
  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  
  // Get query parameters for when component is accessed directly via URL
  const location = window.location;
  const queryParams = new URLSearchParams(location.search);
  const queryYearId = queryParams.get('yearId');
  const querySubjectId = queryParams.get('subjectId');
  
  // State variables
  const [isEditMode, setIsEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessionLength, setSessionLength] = useState('1.0');
  const [competences, setCompetences] = useState([]);
  const [selectedCompetences, setSelectedCompetences] = useState([]);
  const [selectedCriteria, setSelectedCriteria] = useState({});
  const [files, setFiles] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompetences, setLoadingCompetences] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // Add counter for forcing re-renders
  
  // Add new state variables for dropdown selection - use query params if available
  const [selectedYearId, setSelectedYearId] = useState(yearId || queryYearId || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || querySubjectId || '');
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Force editor re-render when year or subject changes
  useEffect(() => {
    setEditorKey(prev => prev + 1);
  }, [selectedYearId, selectedSubjectId]);

  // Dynamically import Quill when the component mounts
  useEffect(() => {
    const loadQuill = async () => {
      try {
        console.log('Initializing Quill editor');
        
        // Load Quill and its styles
        const QuillModule = await import('quill');
        const Quill = QuillModule.default;
        console.log('Quill loaded:', Quill);
        
        // Load Quill styles
        await import('quill/dist/quill.snow.css');
        console.log('Quill styles loaded');
        
        // Wait a bit to ensure the DOM is fully rendered
        setTimeout(() => {
          console.log('Initializing Quill instance, ref exists:', !!quillRef.current);
          // Check if we need to reinitialize (DOM element changed)
          if (quillRef.current) {
            // Clean up existing instance if it exists and is no longer valid
            if (quillInstance.current) {
              try {
                // Check if the current instance is still connected to the DOM
                if (!quillRef.current.contains(quillInstance.current.root)) {
                  console.log('Quill instance DOM disconnected, cleaning up');
                  quillInstance.current.off('text-change');
                  quillInstance.current = null;
                  setQuillLoaded(false);
                }
              } catch (e) {
                console.log('Quill instance invalid, cleaning up');
                quillInstance.current = null;
                setQuillLoaded(false);
              }
            }
            
            // Create new instance if needed
            if (!quillInstance.current) {
              console.log('Creating new Quill instance');
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
              
              console.log('Quill instance created successfully');
              
              // Set existing content if available
              if (description) {
                quillInstance.current.clipboard.dangerouslyPasteHTML(description);
              }
              
              // Handle text change
              quillInstance.current.on('text-change', function() {
                const newContent = quillInstance.current.root.innerHTML;
                setDescription(newContent);
              });
              
              setQuillLoaded(true);
              console.log('Quill editor initialized and ready');
            }
          }
        }, 100);
      } catch (err) {
        console.error('Failed to load Quill editor:', err);
        setError('Failed to load rich text editor. Using fallback editor.');
      }
    };
    
    loadQuill();
    
    // Cleanup function
    return () => {
      if (quillInstance.current) {
        quillInstance.current.off('text-change');
        quillInstance.current = null;
      }
      setQuillLoaded(false);
    };
  }, [editorKey]); // Re-run when editor key changes

  // Separate effect to update Quill content when description changes externally
  useEffect(() => {
    if (quillLoaded && quillInstance.current && description !== quillInstance.current.root.innerHTML) {
      const currentSelection = quillInstance.current.getSelection();
      quillInstance.current.clipboard.dangerouslyPasteHTML(description);
      if (currentSelection) {
        quillInstance.current.setSelection(currentSelection);
      }
    }
  }, [description, quillLoaded]);

  // Fetch dashboard data first to get school information
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/dashboard/', {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        setSchoolData(response.data);
        
        // Once we have school data, we can fetch competences if we have year and subject
        if (selectedYearId && selectedSubjectId && response.data.region) {
          await fetchCompetences(response.data.region.id, selectedSubjectId, selectedYearId);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        displayToast('Failed to load school data. Please try again.', 'error');
        setLoading(false);
      }
    };

    if (authToken) {
      fetchDashboardData();
    }
  }, [authToken, selectedYearId, selectedSubjectId]);

  // This effect will run when year or subject selection changes
  useEffect(() => {
    const fetchCompetencesForSelection = async () => {
      if (selectedYearId && selectedSubjectId && schoolData?.region) {
        await fetchCompetences(schoolData.region.id, selectedSubjectId, selectedYearId);
      }
    };
    
    fetchCompetencesForSelection();
  }, [selectedYearId, selectedSubjectId, schoolData]);

  // Add effect to update available subjects when year changes
  useEffect(() => {
    if (selectedYearId && schoolData) {
      const selectedYearData = schoolData.years.find(year => year.id === selectedYearId);
      setAvailableSubjects(selectedYearData?.subjects || []);
      
      // Reset subject if changing year and subject is already selected
      if (selectedSubjectId && !selectedYearData?.subjects.some(s => s.id === selectedSubjectId)) {
        setSelectedSubjectId('');
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedYearId, schoolData, selectedSubjectId]);

  const fetchCompetences = async (regionId, subjectId, yearId) => {
    if (!regionId || !subjectId || !yearId) {
      console.error('Missing required parameters for fetching competences');
      return;
    }

    try {
      setLoadingCompetences(true);
      const response = await axios.get('/api/core/specific-competences/', {
        headers: { Authorization: `Token ${authToken}` },
        params: { region: regionId, subject: subjectId, year: yearId }
      });
      
      setCompetences(response.data);
      setLoadingCompetences(false);
    } catch (err) {
      console.error('Error fetching competences:', err);
      displayToast('Failed to load competences for this subject and year.', 'error');
      setLoadingCompetences(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      
      const uploadFile = async (file) => {
        formData.set('file', file);
        
        try {
          const response = await axios.post('/api/core/file-upload/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Token ${authToken}`
            },
          });
          
          setFiles(prevFiles => [
            ...prevFiles,
            {
              name: response.data.name,
              url: response.data.url,
              size: response.data.size,
              type: response.data.type
            }
          ]);
        } catch (err) {
          console.error('Error uploading file:', err);
          displayToast(`Failed to upload file ${file.name}.`, 'error');
        }
      };
      
      Promise.all(selectedFiles.map(file => uploadFile(file)));
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const toggleCompetence = (competenceId) => {
    console.log('Toggling competence:', competenceId, 'Currently selected:', selectedCompetences);
    if (selectedCompetences.includes(competenceId)) {
      setSelectedCompetences(prevSelected => prevSelected.filter(id => id !== competenceId));
      
      // Remove any selected criteria for this competence
      const updatedCriteria = { ...selectedCriteria };
      delete updatedCriteria[competenceId];
      setSelectedCriteria(updatedCriteria);
    } else {
      setSelectedCompetences(prevSelected => [...prevSelected, competenceId]);
    }
  };

  const toggleEvaluationCriteria = (competenceId, criterionId) => {
    setSelectedCriteria(prevState => {
      const competenceCriteria = prevState[competenceId] || [];
      const updatedCriteria = competenceCriteria.includes(criterionId)
        ? competenceCriteria.filter(id => id !== criterionId)
        : [...competenceCriteria, criterionId];
        
      return {
        ...prevState,
        [competenceId]: updatedCriteria
      };
    });
  };

  const isCriterionSelected = (competenceId, criterionId) => {
    return selectedCriteria[competenceId]?.includes(criterionId) || false;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const displayToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSessionLengthChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSessionLength(value.toString());
    }
  };

  const incrementSessionLength = () => {
    const value = parseFloat(sessionLength) || 0;
    setSessionLength((value + 0.5).toString());
  };

  const decrementSessionLength = () => {
    const value = parseFloat(sessionLength) || 0;
    if (value >= 0.5) {
      setSessionLength((value - 0.5).toString());
    }
  };

  // Add new effect to fetch module data when in edit mode
  useEffect(() => {
    const fetchModuleData = async () => {
      console.log('fetchModuleData called, moduleId:', moduleId, 'authToken:', !!authToken);
      if (!moduleId) {
        console.log('No moduleId found, skipping fetch');
        return;
      }
      
      if (!authToken) {
        console.log('No authToken found, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        console.log('Making API call to:', `/api/core/modules/${moduleId}/`);
        const response = await axios.get(`/api/core/modules/${moduleId}/`, {
          headers: { Authorization: `Token ${authToken}` }
        });
        
        console.log('Module data fetched successfully:', response.data);
        const moduleData = response.data;
        console.log('Processing module data:', {
          title: moduleData.title,
          year: moduleData.year,
          subject: moduleData.subject,
          specific_competences: moduleData.specific_competences,
          selected_criteria: moduleData.selected_criteria
        });
        
        setIsEditMode(true);
        setTitle(moduleData.title);
        setDescription(moduleData.description);
        setSessionLength(moduleData.session_length.toString());
        
        // Handle competences safely - API returns 'specific_competences'
        if (moduleData.specific_competences && Array.isArray(moduleData.specific_competences)) {
          const competenceIds = moduleData.specific_competences.map(c => c.id || c);
          console.log('Setting selected competences:', competenceIds);
          setSelectedCompetences(competenceIds);
        } else {
          console.log('No specific_competences found or invalid format, setting empty array');
          setSelectedCompetences([]);
        }
        
        // Handle evaluation criteria safely - API returns 'selected_criteria' as an object
        if (moduleData.selected_criteria && typeof moduleData.selected_criteria === 'object') {
          console.log('Setting selected criteria:', moduleData.selected_criteria);
          setSelectedCriteria(moduleData.selected_criteria);
        } else {
          console.log('No selected_criteria found or invalid format, setting empty object');
          setSelectedCriteria({});
        }
        
        setFiles(moduleData.files || []);
        
        // Set year and subject if available - API returns them as string UUIDs
        console.log('Setting year and subject:', moduleData.year, moduleData.subject);
        if (moduleData.year) {
          console.log('Setting year ID:', moduleData.year);
          setSelectedYearId(moduleData.year); // year is already a string UUID
        }
        if (moduleData.subject) {
          console.log('Setting subject ID:', moduleData.subject);
          setSelectedSubjectId(moduleData.subject); // subject is already a string UUID
        }
        
        console.log('Module data processing completed successfully');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching module data:', err);
        console.error('Error response:', err.response);
        console.error('Error status:', err.response?.status);
        console.error('Error data:', err.response?.data);
        displayToast('Failed to load module data. Please try again.', 'error');
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId, authToken]);

  const handleSave = async () => {
    if (!title.trim()) {
      displayToast('Please enter a title for the module.', 'error');
      return;
    }

    if (!description.trim()) {
      displayToast('Please enter a description for the module.', 'error');
      return;
    }

    if (selectedCompetences.length === 0) {
      displayToast('Please select at least one competence.', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const moduleData = {
        title: title.trim(),
        description: description.trim(),
        session_length: parseFloat(sessionLength),
        specific_competences: selectedCompetences, // Changed from 'competences' to 'specific_competences'
        selected_criteria: selectedCriteria, // Changed from flattened array to object
        files: files,
        year: selectedYearId,
        subject: selectedSubjectId,
        school: schoolData?.id  // Add the school ID which is required
      };
      
      console.log('Saving module with data:', moduleData);

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/core/modules/${moduleId}/`, moduleData, {
          headers: { Authorization: `Token ${authToken}` }
        });
        displayToast('Module updated successfully!', 'success');
      } else {
        response = await axios.post('/api/core/modules/', moduleData, {
          headers: { Authorization: `Token ${authToken}` }
        });
        displayToast('Module created successfully!', 'success');
      }

      setSaving(false);
      
      // Navigate back to the appropriate page
      if (selectedYearId && selectedSubjectId) {
        navigate(`/subject/${selectedSubjectId}/learning-situations`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error saving module:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = isEditMode ? 'Failed to update module. Please try again.' : 'Failed to create module. Please try again.';
      
      // Show more specific error if available
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          // Try to extract field-specific errors
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return `${field}: ${errors.join(', ')}`;
              }
              return `${field}: ${errors}`;
            })
            .join('; ');
          
          if (fieldErrors) {
            errorMessage = `Validation errors: ${fieldErrors}`;
          }
        }
      }
      
      displayToast(errorMessage, 'error');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Check if we should return to a learning situation editor
    const returnToSituation = localStorage.getItem('returnToSituation');
    if (returnToSituation) {
      localStorage.removeItem('returnToSituation');
      if (returnToSituation === 'new') {
        navigate('/learning-situation/new');
      } else {
        navigate(`/learning-situation/${returnToSituation}`);
      }
    } else {
      // Default navigation to content page
      navigate('/content');
    }
  };

  // Get year and subject name for display
  const getYearName = () => {
    if (!selectedYearId || !schoolData) return '';
    const year = schoolData.years.find(y => y.id === selectedYearId);
    return year ? `${year.name}${year.division ? ` - ${year.division}` : ''}` : '';
  };

  const getSubjectName = () => {
    if (!selectedSubjectId || !schoolData) return '';
    
    // First try to find in availableSubjects
    if (availableSubjects && availableSubjects.length > 0) {
      const subject = availableSubjects.find(s => s.id === selectedSubjectId);
      if (subject) return subject.name;
    }
    
    // If not found in availableSubjects, search all years for the subject
    for (const year of schoolData.years || []) {
      const subject = year.subjects?.find(s => s.id === selectedSubjectId);
      if (subject) return subject.name;
    }
    
    return '';
  };

  // Fallback editor for when Quill fails to load
  const renderFallbackEditor = () => (
    <textarea
      className="fallback-editor"
      value={description || ''}
      onChange={(e) => setDescription(e.target.value)}
      placeholder="Enter module description..."
      rows={8}
    />
  );

  if (loading) {
    return (
      <Layout schoolName={schoolData?.name || "Create Module"}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout schoolName={schoolData?.name || "Create Module"}>
      <div className="module-creation-page">
        {/* Navigation Bar */}
        <div className="editor-navbar">
          
          <div className="nav-center">
            <h1>New Module</h1>
            {selectedYearId && selectedSubjectId && (
              <div className="context-info">
                {getYearName()} • {getSubjectName()}
              </div>
            )}
          </div>
          
          <div className="nav-right">
            <button
              className="nav-button save-button"
              onClick={handleSave}
              disabled={saving}
              title="Save Module"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="editor-content">
          <div className="editor-main">
            <div className="form-container">
              {/* Basic Information Section */}
              <div className="form-section">
                <h2>Basic Information</h2>
                <p className="section-hint">
                  Enter the basic details for this module
                </p>
                
                {/* Show year and subject dropdowns if not provided via URL */}
                {!yearId && (
                  <div className="form-field">
                    <label htmlFor="year">Year</label>
                    <select
                      id="year"
                      value={selectedYearId}
                      onChange={(e) => setSelectedYearId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Year --</option>
                      {schoolData?.years.map(year => (
                        <option key={year.id} value={year.id}>
                          {year.name}{year.division ? ` - ${year.division}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {!subjectId && (
                  <div className="form-field">
                    <label htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      required
                      disabled={!selectedYearId}
                    >
                      <option value="">-- Select Subject --</option>
                      {availableSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    {!selectedYearId && (
                      <small className="field-hint">Please select a year first</small>
                    )}
                  </div>
                )}
                
                <div className="form-field">
                  <label htmlFor="title">Module Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter module title"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label htmlFor="description">Description</label>
                  <div className="text-editor-container" key={`editor-${editorKey}`}>
                    {/* Quill Editor Container */}
                    <div 
                      ref={quillRef} 
                      className="quill-editor"
                      style={{ 
                        display: quillLoaded ? 'block' : 'none',
                        minHeight: '300px',
                        height: 'auto',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        margin: '10px 0'
                      }}
                    />
                    
                    {/* Fallback Editor */}
                    {!quillLoaded && renderFallbackEditor()}
                  </div>
                </div>
                
                <div className="form-field">
                  <label htmlFor="sessionLength">Session Length (hours)</label>
                  <div className="number-input-container">
                    <button 
                      type="button"
                      onClick={decrementSessionLength}
                      className="number-input-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="sessionLength"
                      value={sessionLength}
                      onChange={handleSessionLengthChange}
                      step="0.5"
                      min="0"
                      className="number-input"
                    />
                    <button 
                      type="button"
                      onClick={incrementSessionLength}
                      className="number-input-btn"
                    >
                      +
                    </button>
                  </div>
                  <small className="field-hint">Values in 0.5 hour increments</small>
                </div>
              </div>
              
              {/* Competences Section */}
              <div className="form-section">
                <h2>Competences and Evaluation Criteria</h2>
                <p className="section-hint">
                  Select the competences and criteria that this module addresses
                </p>
                
                {loadingCompetences ? (
                  <div className="loading-competences">
                    <div className="spinner small"></div>
                    <p>Loading competences...</p>
                  </div>
                ) : competences.length === 0 ? (
                  <div className="no-competences-message">
                    <p>No competences found for this subject and year.</p>
                    <small>You can still create the module and add competences later.</small>
                  </div>
                ) : (
                  <div className="competences-container">
                    {competences.map((competence) => (
                      <div key={competence.id} className="competence-card">
                        <div 
                          className={`competence-header ${selectedCompetences.includes(competence.id) ? 'selected' : ''}`}
                          onClick={() => toggleCompetence(competence.id)}
                        >
                          <div className="competence-left">
                            <span className="competence-code">{competence.code}</span>
                            <p className="competence-description-header">{competence.description}</p>
                          </div>
                          <div className="check-icon">✓</div>
                        </div>
                        
                        {selectedCompetences.includes(competence.id) && (
                          <div className="competence-main">
                            {competence.evaluation_criteria && competence.evaluation_criteria.length > 0 ? (
                              <div className="evaluation-criteria-list">
                                <h4>Evaluation Criteria</h4>
                                {competence.evaluation_criteria.map(criterion => (
                                  <div 
                                    key={criterion.id}
                                    className={`evaluation-criterion ${isCriterionSelected(competence.id, criterion.id) ? 'selected' : ''}`}
                                    onClick={() => toggleEvaluationCriteria(competence.id, criterion.id)}
                                  >
                                    <p className="criterion-description">{criterion.description}</p>
                                    {isCriterionSelected(competence.id, criterion.id) && (
                                      <div className="check-icon">✓</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-criteria-message">
                                <p>No evaluation criteria available for this competence.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* File Attachments Section */}
              <div className="form-section">
                <h2>File Attachments</h2>
                <p className="section-hint">
                  Upload files to be included with this module
                </p>
                
                <div className="file-upload-container">
                  <label htmlFor="fileUpload" className="file-upload-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Files
                    <input 
                      type="file"
                      id="fileUpload"
                      className="file-input"
                      multiple
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
                
                {files.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files</h4>
                    <div className="file-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                          <button 
                            type="button"
                            className="remove-file-button"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        {showToast && (
          <div className={`toast-notification ${toastType}`}>
            {toastMessage}
          </div>
        )}
        
        {/* Saving Overlay */}
        {saving && (
          <div className="saving-overlay">
            <div className="spinner"></div>
            <p>Saving module...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModuleCreationPage; 