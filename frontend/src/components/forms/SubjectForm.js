import React from 'react';

const SubjectForm = ({ 
  subjectName, 
  setSubjectName, 
  subjectDescription, 
  setSubjectDescription,
  selectedYear,
  setSelectedYear,
  years 
}) => (
  <>
    <div style={{ marginBottom: '1rem' }}>
      <label>Subject Name:</label>
      <input
        type="text"
        value={subjectName}
        onChange={(e) => setSubjectName(e.target.value)}
        required
      />
    </div>
    <div style={{ marginBottom: '1rem' }}>
      <label>Subject Description:</label>
      <textarea
        value={subjectDescription}
        onChange={(e) => setSubjectDescription(e.target.value)}
        required
      />
    </div>
    <div style={{ marginBottom: '1rem' }}>
      <label>Select Year:</label>
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        required
      >
        <option value="">--Select Year--</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.name}{year.division ? ` - ${year.division}` : ''}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default SubjectForm; 