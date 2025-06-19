import React, { useState, useEffect } from 'react';
import './Content.css';
import { AuthContext } from '../contexts/AuthContext';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LearningSituationModal = ({
  showModal,
  learningSituationName,
  setLearningSituationName,
  learningSituationDescription,
  setLearningSituationDescription,
  selectedYear,
  setSelectedYear,
  subjectName,
  setSubjectName,
  learningSituationError,
  handleSubmit,
  onClose,
  schoolData,
  isEditing,
  availableModules = [],
  selectedModules = [],
  onModuleSelectionChange,
  disableYearSelection = false,
  disableSubjectSelection = false,
  fixedSubjectId,
  hideYearSubject = false,
}) => {
  const { t } = useTranslation(['modules', 'common']);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  
  // Update available subjects when year changes
  useEffect(() => {
    if (selectedYear && !disableYearSelection) {
      const selectedYearData = schoolData.years.find(year => year.id === selectedYear);
      setAvailableSubjects(selectedYearData?.subjects || []);
      // Reset subject selection when year changes
      if (!isEditing && !disableSubjectSelection) {
        setSubjectName('');
      }
    } else {
      setAvailableSubjects([]);
    }
  }, [selectedYear, schoolData.years, disableYearSelection, disableSubjectSelection, isEditing]);

  useEffect(() => {
    const options = schoolData.years.map(year => ({
      value: year.id,
      label: `${year.name}${year.division ? ` - ${year.division}` : ''}`
    }));
    setYearOptions(options);
  }, [schoolData.years]);

  // Find the year name based on the selected year ID
  const getYearName = () => {
    const yearOption = yearOptions.find(y => y.value === selectedYear);
    return yearOption ? yearOption.label : '';
  };

  const handleModuleToggle = (module) => {
    if (!onModuleSelectionChange) return;
    
    const newSelection = selectedModules.includes(module)
      ? selectedModules.filter(m => m.id !== module.id)
      : [...selectedModules, module];
    onModuleSelectionChange(newSelection);
  };

  // Helper function to check if a module is selected
  const isModuleSelected = (moduleId) => {
    return selectedModules.some(module => module.id === moduleId);
  };

  // Helper function to get first line of description
  const getFirstLine = (text) => {
    if (!text) return '';
    const firstLine = text.split('\n')[0];
    return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;
  };

  // Determine the icon and hint based on evaluable status
  const getEvaluableIcon = (module) => {
    if (module.evaluable) {
      return {
        icon: '📝',
        title: t('modules:evaluableIcon')
      };
    } else {
      return {
        icon: '🔒',
        title: t('modules:notEvaluableIcon')
      };
    }
  };

  return (
    showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{isEditing ? 'Edit Learning Situation' : 'Create New Learning Situation'}</h2>
          <form onSubmit={handleSubmit}>
            {/* Only show year and subject fields if not hidden */}
            {!hideYearSubject && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Select Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    required
                    disabled={fixedSubjectId}
                  >
                    <option value="">--Select Year--</option>
                    {schoolData.years.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}{year.division ? ` - ${year.division}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label>Subject:</label>
                  <select
                    value={fixedSubjectId || ''}
                    onChange={(e) => {
                      const selectedSubject = availableSubjects.find(
                        (subject) => subject.id === e.target.value
                      );
                      if (selectedSubject) {
                        setSubjectName(selectedSubject.name);
                      }
                    }}
                    required
                    disabled={fixedSubjectId}
                  >
                    <option value="">--Select Subject--</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Learning Situation Name:</label>
              <input
                type="text"
                value={learningSituationName}
                onChange={(e) => setLearningSituationName(e.target.value)}
                required
                className="form-control"
                placeholder="Enter a name for the learning situation"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Description:</label>
              <textarea
                value={learningSituationDescription}
                onChange={(e) => setLearningSituationDescription(e.target.value)}
                required
                className="form-control"
                rows="5"
                placeholder="Enter a description of the learning situation"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Select Modules:</label>
              <div className="module-selection">
                {availableModules.length > 0 ? (
                  availableModules.map((module) => (
                    <div
                      key={module.id}
                      className={`module-selection-card ${isModuleSelected(module.id) ? 'selected' : ''}`}
                      onClick={() => handleModuleToggle(module)}
                    >
                      <span 
                        className={`status-indicator module-selection-status ${module.linked ? 'linked' : 'unlinked'}`}
                        title={module.linked ? 'Linked to another Learning Situation' : 'Not linked to any Learning Situation'}
                      />
                      <h4>
                        <span 
                          className="evaluable-icon" 
                          title={getEvaluableIcon(module).title}
                        >
                          {getEvaluableIcon(module).icon}
                        </span>
                        {module.title}
                      </h4>
                      <p>{getFirstLine(module.description)}</p>
                      <svg
                        className="module-selection-check"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'orange', fontSize: '0.9em', gridColumn: '1 / -1' }}>
                    No modules available for the selected year and subject.
                  </p>
                )}
              </div>
            </div>
            
            {learningSituationError && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
                {learningSituationError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ marginRight: '1rem' }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default LearningSituationModal;

<style>
  {`
    .disabled-field {
      background-color: #f8f9fa;
      opacity: 1;
      cursor: not-allowed;
    }
  `}
</style> 