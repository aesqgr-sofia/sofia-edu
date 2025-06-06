import React from 'react';
import './SubjectRow.css';

const SubjectRow = ({ subject }) => {
  return (
    <div className="subject-row">
      <div className="subject-info">
        <span className="subject-name">{subject.name}</span>
        <span className="subject-description">{subject.description}</span>
      </div>
      <div className="subject-stats">
        {/* Example: Show % of required Specific Competences */}
        <i className="icon-competences" />
        <span>{subject.requiredCompetencesPercentage || 0}%</span>
      </div>
    </div>
  );
};

export default SubjectRow;
