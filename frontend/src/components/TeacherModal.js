import React from 'react';

const TeacherModal = ({
  showModal,
  teacherData,
  setTeacherData,
  teacherError,
  handleSubmit,
  onClose,
}) => {
  return (
    showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Create New Teacher</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Email:</label>
              <input
                type="email"
                value={teacherData.email}
                onChange={(e) => setTeacherData({...teacherData, email: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>First Name:</label>
              <input
                type="text"
                value={teacherData.first_name}
                onChange={(e) => setTeacherData({...teacherData, first_name: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Last Name:</label>
              <input
                type="text"
                value={teacherData.last_name}
                onChange={(e) => setTeacherData({...teacherData, last_name: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Password:</label>
              <input
                type="password"
                value={teacherData.password}
                onChange={(e) => setTeacherData({...teacherData, password: e.target.value})}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Confirm Password:</label>
              <input
                type="password"
                value={teacherData.confirm_password}
                onChange={(e) => setTeacherData({...teacherData, confirm_password: e.target.value})}
                required
              />
            </div>
            {teacherError && <p style={{ color: 'red' }}>{teacherError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ marginRight: '1rem' }}
              >
                Cancel
              </button>
              <button type="submit" style={{ padding: '0.5rem 1rem' }}>
                Create Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default TeacherModal; 