import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import FormField from '../forms/FormField';
import TextInput from '../forms/TextInput';
import Select from '../forms/Select';

/**
 * LearningSituationBasicInfo component
 * Handles basic information input for learning situations
 */
const LearningSituationBasicInfo = ({
  title,
  description,
  selectedYearId,
  selectedSubjectId,
  schoolData,
  availableSubjects = [],
  onTitleChange,
  onDescriptionChange,
  onYearChange,
  onSubjectChange,
  showYearSelect = true,
  showSubjectSelect = true,
  subjectDetails = null,
  errors = {}
}) => {
  const { t } = useTranslation(['learning', 'common']);
  const availableYears = schoolData?.years || [];

  // Helper functions
  const getYearName = (yearId) => {
    if (!yearId) return '';
    const year = availableYears.find(y => y.id === yearId);
    if (year) {
      return `${year.name}${year.division ? ` - ${year.division}` : ''}`;
    }
    if (subjectDetails?.year && typeof subjectDetails.year === 'object') {
      if (subjectDetails.year.id === yearId) {
        return `${subjectDetails.year.name}${subjectDetails.year.division ? ` - ${subjectDetails.year.division}` : ''}`;
      }
    }
    return '';
  };

  const getSubjectName = (subjectId) => {
    const allSubjects = availableYears.flatMap(year => year.subjects || []);
    const subject = allSubjects.find(s => s.id === subjectId);
    return subject ? subject.name : '';
  };

  return (
    <Card>
      <div className="sofia-form-section">
        <h2>{t('learning:basicInformation')}</h2>
        
        <FormField 
          label={t('common:title')}
          error={errors.title}
          required
        >
          <TextInput
            value={title}
            onChange={onTitleChange}
            placeholder={t('common:title')}
            error={!!errors.title}
          />
        </FormField>

        <FormField 
          label={t('common:description')}
          error={errors.description}
        >
          <textarea
            className="sofia-form-textarea"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('common:description')}
            rows="4"
          />
        </FormField>

        {(showYearSelect || showSubjectSelect) && (
          <div className="sofia-form-row">
            {showYearSelect && (
              <FormField 
                label={t('common:year')}
                error={errors.year}
                required
              >
                <Select
                  value={selectedYearId}
                  onChange={onYearChange}
                  options={availableYears.map(year => ({
                    value: year.id,
                    label: `${year.name}${year.division ? ` - ${year.division}` : ''}`
                  }))}
                  placeholder={t('common:year')}
                  error={!!errors.year}
                />
              </FormField>
            )}
            
            {showSubjectSelect && (
              <FormField 
                label={t('common:subject')}
                error={errors.subject}
                required
              >
                <Select
                  value={selectedSubjectId}
                  onChange={onSubjectChange}
                  options={availableSubjects.map(subject => ({
                    value: subject.id,
                    label: subject.name
                  }))}
                  placeholder={t('common:subject')}
                  disabled={!selectedYearId}
                  error={!!errors.subject}
                />
              </FormField>
            )}
          </div>
        )}

        {(!showYearSelect || !showSubjectSelect) && (
          <div className="sofia-form-info">
            <p>
              <strong>{t('common:year')} & {t('common:subject')}:</strong> {getYearName(subjectDetails?.year?.id || selectedYearId)} - {subjectDetails?.name || getSubjectName(selectedSubjectId)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

LearningSituationBasicInfo.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  selectedYearId: PropTypes.string.isRequired,
  selectedSubjectId: PropTypes.string.isRequired,
  schoolData: PropTypes.object,
  availableSubjects: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })),
  onTitleChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  onSubjectChange: PropTypes.func.isRequired,
  showYearSelect: PropTypes.bool,
  showSubjectSelect: PropTypes.bool,
  subjectDetails: PropTypes.object,
  errors: PropTypes.object
};

export default LearningSituationBasicInfo; 