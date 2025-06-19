import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import { Button } from '../common';

/**
 * LearningSituationModules component
 * Handles display and management of selected modules
 */
const LearningSituationModules = ({
  selectedModules = [],
  onRemoveModule,
  onDragOver,
  onDragLeave, 
  onDrop,
  errors = {}
}) => {
  const { t } = useTranslation(['common', 'learning']);
  return (
    <Card 
      title={t('common:modules')}
      headerActions={
        <p className="section-hint">
          {selectedModules.length === 0 
            ? t('learning:dragModulesHere')
            : t('common:modules')}
        </p>
      }
    >
      <div className="sofia-form-section">
        {errors.modules && (
          <div className="sofia-form-error" style={{ marginBottom: '1rem' }}>
            {errors.modules}
          </div>
        )}
        
        <div 
          className="selected-modules-container"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {selectedModules.length > 0 ? (
            <div className="selected-modules-grid">
              {selectedModules.map(module => (
                <SelectedModuleCard
                  key={module.id}
                  module={module}
                  onRemove={() => onRemoveModule(module.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-selection">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
              </svg>
              <p>{t('learning:dragModulesHere')}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Individual selected module card component
 */
const SelectedModuleCard = ({ module, onRemove }) => {
  const { t } = useTranslation(['common', 'learning', 'modules']);
  
  // Determine the icon and hint based on evaluable status
  const getEvaluableIcon = () => {
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

  const evaluableInfo = getEvaluableIcon();

  return (
    <div className="selected-module-card">
      <div className="module-card-content">
        <h3>
          <span 
            className="evaluable-icon" 
            title={evaluableInfo.title}
          >
            {evaluableInfo.icon}
          </span>
          {module.title}
        </h3>
        <div dangerouslySetInnerHTML={{ __html: module.description }} />
        
        {/* Display Competences */}
        {module.competence_details && module.competence_details.length > 0 ? (
          <div className="module-competences">
            <h4>{t('common:specificCompetences')}</h4>
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
            <h4>{t('common:specificCompetences')}</h4>
            <div className="competence-codes">
              <span className="competence-code" style={{ background: '#fee2e2', color: '#7f1d1d' }}>
                {t('learning:loadingCompetenceDetails')}
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
        onClick={onRemove}
        title={t('learning:removeModule')}
        className="remove-module-button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </Button>
    </div>
  );
};

LearningSituationModules.propTypes = {
  selectedModules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    evaluable: PropTypes.bool,
    competence_details: PropTypes.array,
    specific_competences: PropTypes.array,
    criteria_details: PropTypes.array,
    selected_criteria: PropTypes.object
  })),
  onRemoveModule: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  errors: PropTypes.object
};

SelectedModuleCard.propTypes = {
  module: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    evaluable: PropTypes.bool,
    competence_details: PropTypes.array,
    specific_competences: PropTypes.array,
    criteria_details: PropTypes.array,
    selected_criteria: PropTypes.object
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

export default LearningSituationModules; 