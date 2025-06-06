import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './ModuleModal.css';

const ModuleModal = ({ 
  isOpen, 
  onClose, 
  moduleData = null, 
  onSave,
  yearId,
  subjectId 
}) => {
  const { authToken } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  // State variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCompetences, setSelectedCompetences] = useState([]);
  const [availableCompetences, setAvailableCompetences] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schoolData, setSchoolData] = useState(null);
  const [regionId, setRegionId] = useState(null);
  const [quillLoaded, setQuillLoaded] = useState(false);
  const [sessionLength, setSessionLength] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState({});

  // Dynamically import Quill when the component mounts
  useEffect(() => {
    if (isOpen && !quillLoaded) {
      const loadQuill = async () => {
        try {
          // Load Quill and its styles
          const QuillModule = await import('quill');
          const Quill = QuillModule.default;
          
          // Load Quill styles
          await import('quill/dist/quill.snow.css');
          
          // Initialize Quill
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
            
            // Set existing content
            if (description) {
              quillInstance.current.clipboard.dangerouslyPasteHTML(description);
            }
            
            // Handle text change
            quillInstance.current.on('text-change', function() {
              setDescription(quillInstance.current.root.innerHTML);
            });
          }
          
          setQuillLoaded(true);
        } catch (err) {
          console.error('Failed to load Quill editor:', err);
          setError('Failed to load rich text editor. Using fallback editor.');
        }
      };
      
      loadQuill();
    }
    
    // Cleanup function
    return () => {
      if (quillInstance.current) {
        // Remove Quill event listeners if needed
        quillInstance.current = null;
      }
    };
  }, [isOpen, quillLoaded, description]);

  // Load module data if editing
  useEffect(() => {
    if (moduleData) {
      setTitle(moduleData.title || '');
      setDescription(moduleData.description || '');
      setSelectedCompetences(moduleData.specific_competences || []);
      setSessionLength(moduleData.session_length || '');
      setSelectedCriteria(moduleData.selected_criteria || {});
      
      // If files exist in module data, load them
      if (moduleData.files && Array.isArray(moduleData.files)) {
        setFiles(moduleData.files);
      }
      
      // Update Quill content if editor is already loaded
      if (quillLoaded && quillInstance.current && moduleData.description) {
        quillInstance.current.clipboard.dangerouslyPasteHTML(moduleData.description);
      }
    } else {
      // Reset form when creating new
      resetForm();
      
      // Clear Quill content if editor is loaded
      if (quillLoaded && quillInstance.current) {
        quillInstance.current.setText('');
      }
    }
  }, [moduleData, isOpen, quillLoaded]);

  // Get school data and region ID on mount
  useEffect(() => {
    if (isOpen && yearId && subjectId) {
      fetchSchoolData();
    }
  }, [isOpen, yearId, subjectId]);

  // Fetch competences when all necessary IDs are available
  useEffect(() => {
    // Only fetch competences when we have all three IDs
    if (regionId && subjectId && yearId) {
      fetchCompetences(regionId, subjectId, yearId);
    } else {
      // Clear competences if we don't have all required filters
      setAvailableCompetences([]);
    }
  }, [regionId, subjectId, yearId]);

  // Fetch school data and region
  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      
      // Get subject details to get the region
      const subjectResponse = await axios.get(`/api/core/subjects/${subjectId}/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      if (subjectResponse.data.region) {
        setRegionId(subjectResponse.data.region);
      }
      
      // Get school data for other details
      const dashboardResponse = await axios.get('/api/auth/dashboard/', {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      setSchoolData(dashboardResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching school data:', err);
      setError('Failed to load data. Please try again.');
      setLoading(false);
    }
  };

  // Fetch competences for the region, subject, and year
  const fetchCompetences = async (regionId, subjectId, yearId) => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/core/specific-competences/', {
        params: { 
          region: regionId,
          subject: subjectId,
          year: yearId
        },
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Fetched competences:', response.data);
      setAvailableCompetences(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching competences:', err);
      setError('Failed to load competences for this subject and year.');
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedCompetences([]);
    setFiles([]);
    setError(null);
    setSessionLength('');
    setSelectedCriteria({});
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError(`File(s) too large. Maximum size is 10MB per file.`);
      return;
    }
    
    // Process files
    const processFiles = async () => {
      setLoading(true);
      const newFiles = [];
      
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await axios.post('/api/core/file-upload/', formData, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          newFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            url: response.data.url
          });
        } catch (err) {
          console.error('Error uploading file:', err);
          setError(`Failed to upload ${file.name}`);
        }
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      setLoading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    if (selectedFiles.length > 0) {
      processFiles();
    }
  };

  // Remove a file from the list
  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Toggle a competence selection
  const toggleCompetence = (competenceId) => {
    setSelectedCompetences(prev => {
      if (prev.includes(competenceId)) {
        return prev.filter(id => id !== competenceId);
      } else {
        return [...prev, competenceId];
      }
    });
  };

  // Toggle evaluation criteria
  const toggleEvaluationCriteria = (competenceId, criterionId) => {
    setSelectedCriteria(prev => {
      const competenceCriteria = prev[competenceId] || [];
      const updatedCriteria = competenceCriteria.includes(criterionId)
        ? competenceCriteria.filter(id => id !== criterionId)
        : [...competenceCriteria, criterionId];
      
      return {
        ...prev,
        [competenceId]: updatedCriteria
      };
    });
  };

  // Check if a criterion is selected
  const isCriterionSelected = (competenceId, criterionId) => {
    return selectedCriteria[competenceId]?.includes(criterionId) || false;
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title) {
      setError('Please enter a title for the module');
      return;
    }
    
    if (!yearId || !subjectId) {
      setError('Year and Subject are required');
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        title,
        description,
        year: yearId,
        subject: subjectId,
        school: schoolData?.id,
        specific_competences: selectedCompetences,
        selected_criteria: selectedCriteria,
        session_length: sessionLength || null,
        files: files
      };
      
      let response;
      
      if (moduleData) {
        // Update existing module
        response = await axios.put(`/api/core/modules/${moduleData.id}/`, payload, {
          headers: { Authorization: `Token ${authToken}` }
        });
      } else {
        // Create new module
        response = await axios.post('/api/core/modules/', payload, {
          headers: { Authorization: `Token ${authToken}` }
        });
      }
      
      // Call the onSave callback with the response data
      if (onSave) {
        onSave(response.data);
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (err) {
      console.error('Error saving module:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        'Failed to save module'
      );
      setLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="module-modal-overlay">
      <div className="module-modal">
        <div className="module-modal-header">
          <h2>{moduleData ? 'Edit Module' : 'Create New Module'}</h2>
          <button className="close-button" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
          </button>
        </div>
        
        <div className="module-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter module title"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="sessionLength">Session Length (hours):</label>
              <select
                id="sessionLength"
                className="form-control"
                value={sessionLength}
                onChange={(e) => setSessionLength(e.target.value)}
              >
                <option value="">Select session length</option>
                {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(length => (
                  <option key={length} value={length}>{length} hours</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <div className="text-editor-container">
                {/* Quill Editor Container */}
                <div 
                  ref={quillRef} 
                  className="quill-editor"
                  style={{ display: quillLoaded ? 'block' : 'none' }}
                />
                
                {/* Fallback Editor */}
                {!quillLoaded && renderFallbackEditor()}
              </div>
            </div>
            
            <div className="form-group">
              <label>Specific Competences for this Subject and Year:</label>
              <div className="competences-list">
                {loading && (
                  <div className="loading-competences">Loading competences...</div>
                )}
                
                {!loading && availableCompetences.length > 0 ? (
                  availableCompetences.map(competence => (
                    <div
                      key={competence.id}
                      className={`competence-item ${selectedCompetences.includes(competence.id) ? 'selected' : ''}`}
                    >
                      <div className="competence-header" onClick={() => toggleCompetence(competence.id)}>
                        <div className="competence-main">
                          <span className="competence-code">{competence.code}</span>
                          <span className="competence-description">{competence.description}</span>
                        </div>
                        <div className="competence-meta">
                          <span className="competence-subject">{competence.subject_name}</span>
                          <span className="competence-year">{competence.year_name}</span>
                        </div>
                        {selectedCompetences.includes(competence.id) && (
                          <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                          </svg>
                        )}
                      </div>
                      
                      {/* Show evaluation criteria if this competence is selected */}
                      {selectedCompetences.includes(competence.id) && competence.evaluation_criteria && competence.evaluation_criteria.length > 0 && (
                        <div className="evaluation-criteria-list">
                          <h4>Evaluation Criteria:</h4>
                          {competence.evaluation_criteria.map(criterion => (
                            <div 
                              key={criterion.id} 
                              className={`evaluation-criterion ${isCriterionSelected(competence.id, criterion.id) ? 'selected' : ''}`}
                              onClick={() => toggleEvaluationCriteria(competence.id, criterion.id)}
                            >
                              <span className="criterion-description">{criterion.description}</span>
                              {isCriterionSelected(competence.id, criterion.id) && (
                                <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Message if no evaluation criteria are available */}
                      {selectedCompetences.includes(competence.id) && 
                       (!competence.evaluation_criteria || competence.evaluation_criteria.length === 0) && (
                        <div className="no-criteria-message">
                          No evaluation criteria available for this competence.
                        </div>
                      )}
                    </div>
                  ))
                ) : !loading ? (
                  <div className="no-competences-message">
                    {yearId && subjectId ? 
                      'No competences available for this subject and year.' : 
                      'Please select both a subject and year to view available competences.'}
                  </div>
                ) : null}
              </div>
            </div>
            
            <div className="form-group">
              <label>File Attachments:</label>
              <div className="file-upload-container">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  multiple
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  className="file-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  Select Files (10MB max)
                </button>
              </div>
              
              {files.length > 0 && (
                <div className="uploaded-files">
                  <h4>Attached Files:</h4>
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : moduleData ? 'Update Module' : 'Create Module'}
              </button>
            </div>
          </form>
        </div>
        
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleModal; 