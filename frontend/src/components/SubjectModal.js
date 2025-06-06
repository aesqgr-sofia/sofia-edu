import React from 'react';

const SubjectModal = ({
  showModal,
  subjectName,
  setSubjectName,
  subjectDescription,
  setSubjectDescription,
  selectedYear,
  setSelectedYear,
  subjectError,
  handleSubmit,
  onClose,
  schoolData,
}) => {
  return (
    showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Create New Subject</h2>
          <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
              <label>Select Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required
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
            {subjectError && <p style={{ color: 'red' }}>{subjectError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ marginRight: '1rem' }}
              >
                Cancel
              </button>
              <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                Create Subject
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default SubjectModal; 