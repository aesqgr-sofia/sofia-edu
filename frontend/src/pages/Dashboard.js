// src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SubjectModal from '../components/SubjectModal';
import LearningSituationModal from '../components/LearningSituationModal';
import TeacherModal from '../components/TeacherModal';
import ActionButton from '../components/buttons/ActionButton';
import FormModal from '../components/modals/FormModal';
import SubjectForm from '../components/forms/SubjectForm';

const Dashboard = () => {
  const { authToken, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showLearningSituationModal, setShowLearningSituationModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  
  // Subject form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [subjectError, setSubjectError] = useState(null);

  // Learning Situation form states
  const [learningSituationName, setLearningSituationName] = useState('');
  const [learningSituationDescription, setLearningSituationDescription] = useState('');
  const [learningSituationError, setLearningSituationError] = useState(null);

  // Teacher form states
  const [teacherData, setTeacherData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
  });
  const [teacherError, setTeacherError] = useState(null);

  // Debug log when component mounts
  useEffect(() => {
    console.log('Dashboard mounted with user:', user);
    console.log('Local storage user:', localStorage.getItem('user'));
  }, []);

  // Add console log to debug user context
  console.log('Current user context:', { authToken, user });

  // Add effect to monitor user changes
  useEffect(() => {
    console.log('User changed in Dashboard:', user);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/auth/dashboard/', {
        headers: { Authorization: `Token ${authToken}` },
      });
      console.log('Dashboard API response:', response.data);
      setSchoolData(response.data);
      return response.data;
    } catch (err) {
      console.error('Dashboard fetch error:', err.response || err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error loading dashboard data.'
      );
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (authToken) {
        setLoading(true);
        await fetchDashboardData();
        setLoading(false);
      }
    };
    
    loadData();
  }, [authToken]);

  const handleLearningSituationSubmit = async (e) => {
    e.preventDefault();
    setLearningSituationError(null);
    const payload = {
      school: schoolData.id,
      region: schoolData.region ? schoolData.region.id : null,
      year: selectedYear,
      subject: subjectName,
      name: learningSituationName,
      description: learningSituationDescription,
    };
    try {
      const response = await axios.post(
        '/api/core/learning-situations/create/',
        payload,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      await fetchDashboardData(); // Refresh data after creation
      setShowLearningSituationModal(false);
      resetLearningSituationForm();
    } catch (err) {
      console.error('Error creating learning situation:', err.response || err);
      setLearningSituationError(err.response?.data?.error || 'Failed to create learning situation.');
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setSubjectError(null);
    try {
      const payload = {
        name: subjectName,
        description: subjectDescription,
        year: selectedYear,
        school: schoolData.id,
        region: schoolData.region ? schoolData.region.id : null,
        teaching_staff: user && user.role === 'teacher' ? [user.id] : [],
      };

      const response = await axios.post(
        '/api/core/subjects/create/',
        payload,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      // Close modal and reset form
      setShowSubjectModal(false);
      resetSubjectForm();
    } catch (err) {
      console.error('Error creating subject:', err.response || err);
      setSubjectError(err.response?.data?.error || 'Failed to create subject.');
    }
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setTeacherError(null);

    if (teacherData.password !== teacherData.confirm_password) {
      setTeacherError("Passwords don't match");
      return;
    }

    try {
      const payload = {
        email: teacherData.email,
        first_name: teacherData.first_name,
        last_name: teacherData.last_name,
        password: teacherData.password,
        role: 'teacher',
        school: schoolData.id,
      };

      const response = await axios.post(
        '/api/auth/create-teacher/',
        payload,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      
      await fetchDashboardData();
      setShowTeacherModal(false);
      resetTeacherForm();
    } catch (err) {
      console.error('Error creating teacher:', err.response || err);
      setTeacherError(err.response?.data?.error || 'Failed to create teacher.');
    }
  };

  const resetSubjectForm = () => {
    setSubjectName('');
    setSubjectDescription('');
    setSelectedYear('');
    setSubjectError(null);
  };

  const resetLearningSituationForm = () => {
    setLearningSituationName('');
    setLearningSituationDescription('');
    setSelectedYear('');
    setSubjectName('');
    setLearningSituationError(null);
  };

  const resetTeacherForm = () => {
    setTeacherData({
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      confirm_password: '',
    });
    setTeacherError(null);
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;
  if (!schoolData) return <div>No school data available.</div>;

  return (
    <Layout schoolName={schoolData.name}>
      <div>
        <h1>{schoolData.name}</h1>
        <p><strong>Address:</strong> {schoolData.address}</p>
        <p><strong>Phone:</strong> {schoolData.phone_number}</p>
        <p><strong>Region:</strong> {schoolData.region?.name || 'N/A'}</p>
        <p><strong>School Type:</strong> {schoolData.school_type?.name || 'N/A'}</p>

        <h2>Years</h2>
        {schoolData.years && schoolData.years.length > 0 ? (
          schoolData.years.map((year) => (
            <div 
              key={year.id} 
              style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}
            >
              <h3>{year.name}{year.division ? ` - ${year.division}` : ''}</h3>
              {year.subjects && year.subjects.length > 0 ? (
                <ul>
                  {year.subjects.map((subject) => (
                    <li key={subject.id}>
                      <strong>{subject.name}</strong>: {subject.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No subjects for this year.</p>
              )}
            </div>
          ))
        ) : (
          <p>No years associated with this school.</p>
        )}

        <div className="action-buttons">
          <ActionButton 
            label="Add New Subject" 
            onClick={() => setShowSubjectModal(true)} 
          />
          <ActionButton 
            label="Add New Learning Situation" 
            onClick={() => setShowLearningSituationModal(true)} 
          />
          {user && user.role === 'admin' && (
            <ActionButton 
              label="Add New Teacher" 
              onClick={() => setShowTeacherModal(true)} 
            />
          )}
        </div>

        <FormModal
          isOpen={showSubjectModal}
          onClose={() => setShowSubjectModal(false)}
          title="Create New Subject"
          onSubmit={handleSubjectSubmit}
          error={subjectError}
        >
          <SubjectForm
            subjectName={subjectName}
            setSubjectName={setSubjectName}
            subjectDescription={subjectDescription}
            setSubjectDescription={setSubjectDescription}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            years={schoolData.years}
          />
        </FormModal>

        <LearningSituationModal
          showModal={showLearningSituationModal}
          learningSituationName={learningSituationName}
          setLearningSituationName={setLearningSituationName}
          learningSituationDescription={learningSituationDescription}
          setLearningSituationDescription={setLearningSituationDescription}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          subjectName={subjectName}
          setSubjectName={setSubjectName}
          learningSituationError={learningSituationError}
          handleSubmit={handleLearningSituationSubmit}
          onClose={() => setShowLearningSituationModal(false)}
          schoolData={schoolData}
        />

        {user && user.role === 'admin' && (
          <TeacherModal
            showModal={showTeacherModal}
            teacherData={teacherData}
            setTeacherData={setTeacherData}
            teacherError={teacherError}
            handleSubmit={handleTeacherSubmit}
            onClose={() => setShowTeacherModal(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
