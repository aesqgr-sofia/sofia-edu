import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * ModuleCompetences component
 * Handles competences and evaluation criteria selection
 */
const ModuleCompetences = ({
  competences = [],
  selectedCompetences = [],
  selectedCriteria = {},
  loadingCompetences = false,
  onToggleCompetence,
  onToggleEvaluationCriteria,
  errors = {}
}) => {
  const { t } = useTranslation(['modules', 'common']);
  
  // Ensure selectedCompetences is always an array
  const safeSelectedCompetences = Array.isArray(selectedCompetences) ? selectedCompetences : [];
  const isCriterionSelected = (competenceId, criterionId) => {
    return selectedCriteria[competenceId]?.includes(criterionId) || false;
  };

  return (
    <Card>
      <div className="sofia-form-section">
        <h2>{t('modules:competencesAndCriteria')}</h2>
        <p className="section-hint">
          {t('modules:competencesHint')}
        </p>
        
        {errors.competences && (
          <div className="sofia-form-error" style={{ marginBottom: '1rem' }}>
            {errors.competences}
          </div>
        )}
        
        {loadingCompetences ? (
          <LoadingSpinner message={t('modules:loadingCompetences')} />
        ) : competences.length === 0 ? (
          <div className="no-competences-message">
            <p>{t('modules:noCompetencesFound')}</p>
            <small>{t('modules:noCompetencesFoundHint')}</small>
          </div>
        ) : (
          <div className="competences-container">
            {competences.map((competence) => (
              <CompetenceCard
                key={competence.id}
                competence={competence}
                isSelected={safeSelectedCompetences.includes(competence.id)}
                selectedCriteria={selectedCriteria[competence.id] || []}
                onToggleCompetence={() => onToggleCompetence(competence.id)}
                onToggleCriterion={(criterionId) => 
                  onToggleEvaluationCriteria(competence.id, criterionId)
                }
                isCriterionSelected={isCriterionSelected}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Individual competence card component
 */
const CompetenceCard = ({
  competence,
  isSelected,
  selectedCriteria,
  onToggleCompetence,
  onToggleCriterion,
  isCriterionSelected
}) => {
  const { t } = useTranslation(['modules', 'common']);
  
  return (
    <div className="competence-card">
      <div 
        className={`competence-header ${isSelected ? 'selected' : ''}`}
        onClick={onToggleCompetence}
      >
        <div className="competence-left">
          <span className="competence-code">{competence.code}</span>
          <p className="competence-description-header">{competence.description}</p>
        </div>
        <div className="check-icon">✓</div>
      </div>
      
      {isSelected && (
        <div className="competence-main">
          {competence.evaluation_criteria && competence.evaluation_criteria.length > 0 ? (
            <div className="evaluation-criteria-list">
              <h4>{t('modules:evaluationCriteria')}</h4>
              {competence.evaluation_criteria.map(criterion => (
                <EvaluationCriterion
                  key={criterion.id}
                  criterion={criterion}
                  isSelected={isCriterionSelected(competence.id, criterion.id)}
                  onToggle={() => onToggleCriterion(criterion.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-criteria-message">
              <p>{t('modules:noCriteriaAvailable')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Individual evaluation criterion component
 */
const EvaluationCriterion = ({ criterion, isSelected, onToggle }) => {
  return (
    <div 
      className={`evaluation-criterion ${isSelected ? 'selected' : ''}`}
      onClick={onToggle}
    >
      <p className="criterion-description">{criterion.description}</p>
      {isSelected && (
        <div className="check-icon">✓</div>
      )}
    </div>
  );
};

ModuleCompetences.propTypes = {
  competences: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    evaluation_criteria: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired
    }))
  })),
  selectedCompetences: PropTypes.arrayOf(PropTypes.string),
  selectedCriteria: PropTypes.object,
  loadingCompetences: PropTypes.bool,
  onToggleCompetence: PropTypes.func.isRequired,
  onToggleEvaluationCriteria: PropTypes.func.isRequired,
  errors: PropTypes.object
};

CompetenceCard.propTypes = {
  competence: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    evaluation_criteria: PropTypes.array
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectedCriteria: PropTypes.array,
  onToggleCompetence: PropTypes.func.isRequired,
  onToggleCriterion: PropTypes.func.isRequired,
  isCriterionSelected: PropTypes.func.isRequired
};

EvaluationCriterion.propTypes = {
  criterion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default ModuleCompetences; 