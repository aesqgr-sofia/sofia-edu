// src/components/YearSection.js
import React from 'react';
import SubjectRow from './SubjectRow';
import './YearSection.css';

const YearSection = ({ year }) => {
  return (
    <section className="year-section">
      <h2 className="year-title">
        {year.name} {year.division ? `- ${year.division}` : ''}
      </h2>
      <div className="subjects-list">
        {year.subjects && year.subjects.length > 0 ? (
          year.subjects.map((subject) => (
            <SubjectRow key={subject.id} subject={subject} />
          ))
        ) : (
          <p>No subjects for this year.</p>
        )}
      </div>
    </section>
  );
};

export default YearSection;
