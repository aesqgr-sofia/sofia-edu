import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FormField, TextInput, Select, NumberInput, Switch } from '../forms';
import Card from '../common/Card';

/**
 * ModuleBasicInfo component
 * Handles the basic information form section for module creation/editing
 */
const ModuleBasicInfo = ({
  // Form values
  title,
  description,
  sessionLength,
  evaluable,
  selectedYearId,
  selectedSubjectId,
  
  // Data
  schoolData,
  availableSubjects,
  
  // Handlers
  onTitleChange,
  onDescriptionChange,
  onSessionLengthChange,
  onEvaluableChange,
  onYearChange,
  onSubjectChange,
  
  // Editor
  quillRef,
  quillLoaded,
  renderFallbackEditor,
  editorKey,
  
  // Configuration
  showYearSelect = false,
  showSubjectSelect = false,
  
  // Validation
  errors = {}
}) => {
  const { t } = useTranslation(['modules', 'common']);

  const yearOptions = schoolData?.years?.map(year => ({
    id: year.id,
    name: `${year.name}${year.division ? ` - ${year.division}` : ''}`
  })) || [];

  const subjectOptions = availableSubjects?.map(subject => ({
    id: subject.id,
    name: subject.name
  })) || [];

  return (
    <Card>
      <div className="sofia-form-section">
        <h2>{t('modules:basicInformation')}</h2>
        
        {/* Year Selection */}
        {showYearSelect && (
          <FormField
            id="year"
            label={t('modules:year')}
            required
            error={errors.year}
          >
            <Select
              id="year"
              value={selectedYearId}
              onChange={(e) => onYearChange(e.target.value)}
              options={yearOptions}
              placeholder={t('modules:selectYearPlaceholder')}
            />
          </FormField>
        )}
        
        {/* Subject Selection */}
        {showSubjectSelect && (
          <FormField
            id="subject"
            label={t('modules:subject')}
            required
            error={errors.subject}
            hint={!selectedYearId ? t('modules:selectYearFirst') : undefined}
          >
            <Select
              id="subject"
              value={selectedSubjectId}
              onChange={(e) => onSubjectChange(e.target.value)}
              options={subjectOptions}
              placeholder={t('modules:selectSubjectPlaceholder')}
              disabled={!selectedYearId}
            />
          </FormField>
        )}
        
        {/* Module Title */}
        <FormField
          id="title"
          label={t('modules:moduleTitle')}
          required
          error={errors.title}
        >
          <TextInput
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t('modules:enterTitle')}
          />
        </FormField>
        
        {/* Description with Rich Text Editor */}
        <FormField
          id="description"
          label={t('modules:description')}
          required
          error={errors.description}
        >
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
            {!quillLoaded && renderFallbackEditor && renderFallbackEditor()}
          </div>
        </FormField>
        
        {/* Session Length and Evaluable */}
        <div className="sofia-form-row">
          <FormField
            id="sessionLength"
            label={t('modules:sessionLength')}
            hint={t('modules:sessionLengthHint')}
            error={errors.sessionLength}
          >
            <NumberInput
              id="sessionLength"
              value={sessionLength}
              onChange={(e) => onSessionLengthChange(e.target.value)}
              step={0.5}
              min={0}
              showControls={true}
            />
          </FormField>
          
          <FormField
            id="evaluable"
            label={t('modules:evaluable')}
            hint={t('modules:evaluableHint')}
          >
            <Switch
              id="evaluable"
              checked={evaluable}
              onChange={(e) => onEvaluableChange(e.target.checked)}
            />
          </FormField>
        </div>
      </div>
    </Card>
  );
};

ModuleBasicInfo.propTypes = {
  // Form values
  title: PropTypes.string,
  description: PropTypes.string,
  sessionLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  evaluable: PropTypes.bool,
  selectedYearId: PropTypes.string,
  selectedSubjectId: PropTypes.string,
  
  // Data
  schoolData: PropTypes.object,
  availableSubjects: PropTypes.array,
  
  // Handlers
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onSessionLengthChange: PropTypes.func.isRequired,
  onEvaluableChange: PropTypes.func,
  onYearChange: PropTypes.func,
  onSubjectChange: PropTypes.func,
  
  // Editor
  quillRef: PropTypes.object,
  quillLoaded: PropTypes.bool,
  renderFallbackEditor: PropTypes.func,
  editorKey: PropTypes.number,
  
  // Configuration
  showYearSelect: PropTypes.bool,
  showSubjectSelect: PropTypes.bool,
  
  // Validation
  errors: PropTypes.object
};

export default ModuleBasicInfo; 