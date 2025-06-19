import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Button, Card, Page } from '../components/common';
import './Planner.css';

function Planner() {
  const { t } = useTranslation(['planner', 'common', 'navigation']);
  const { authTokens, user, authToken, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(null);

  useEffect(() => {
    // Print all token information to debug
    console.log('Auth context data:', { authTokens, authToken, user });
    console.log('Auth token from localStorage:', localStorage.getItem('authToken'));
    
    // Try to fetch with whatever token is available
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Let's try several token options to find the right one
      const token = authToken || (authTokens?.access) || localStorage.getItem('authToken');
      
      console.log('Using token for fetch:', token);
      
      if (!token) {
        console.error('No valid auth token found');
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Try the format from Dashboard.js
      const response = await axios.get('/api/auth/dashboard/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      console.log('School data response:', response.data);
      
      if (response.data) {
        const school = response.data; // The dashboard endpoint likely returns the school directly
        console.log('Found school:', school);
        setSchoolData(school);
        
        // The years might be included in the school data already
        if (school.years && school.years.length > 0) {
          console.log('Years found in school data:', school.years);
          const sortedYears = [...school.years].sort((a, b) => a.name.localeCompare(b.name));
          setSchoolYears(sortedYears);
          setSelectedYearId(sortedYears[0].id);
          setIsLoading(false);
        } else {
          // If years aren't included, fetch them separately
          fetchSchoolYears(school.id, token);
        }
      } else {
        console.warn('No school data found in response:', response.data);
        setSchoolData(null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching school data:', err);
      
      // Enhanced error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        if (err.response.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Maybe add a button to redirect to login page
          // or try to refresh the token
        } else if (err.response.status === 403) {
          setError('You do not have permission to access this data.');
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data.message || err.response.data.error || 'Failed to load school data'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message);
        setError('Failed to load school data: ' + err.message);
      }
      
      setIsLoading(false);
    }
  };

  const fetchSchoolYears = async (schoolId, token) => {
    try {
      console.log(`Fetching years for school ID: ${schoolId}`);
      
      if (!schoolId) {
        console.error('No school ID provided for fetching years');
        setError('Cannot load years: Invalid school ID');
        setIsLoading(false);
        return;
      }
      
      // Use the passed token parameter
      const response = await axios.get(`/api/schools/${schoolId}/years/`, {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      console.log('School years response:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Sort years by name if needed
        const sortedYears = response.data.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Sorted years:', sortedYears);
        setSchoolYears(sortedYears);
        setSelectedYearId(sortedYears[0].id); // Select the first year by default
      } else {
        console.warn('No years found for school:', schoolId);
        setSchoolYears([]);
      }
    } catch (err) {
      console.error('Error fetching school years:', err);
      
      // Enhanced error logging
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 404) {
          setError(`School years not found for ID: ${schoolId}`);
        } else {
          setError(`Failed to load school years: ${err.response.data.message || err.response.data.error || 'Server error'}`);
        }
      } else if (err.request) {
        setError('Server did not respond when loading years. Please try again later.');
      } else {
        setError('Failed to load school years: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearClick = (yearId) => {
    setSelectedYearId(yearId);
  };

  const handleSubjectClick = (subject) => {
    // Navigate to the subject detail page with the subject ID
    navigate(`/subject/${subject.id}/learning-situations`, { 
      state: { 
        subject: subject,
        yearName: schoolYears.find(y => y.id === selectedYearId)?.name || "",
        schoolId: schoolData.id
      } 
    });
  };

  const getYearSubjects = (yearId) => {
    const year = schoolYears.find(y => y.id === yearId);
    return year?.subjects || [];
  };

  // Render the content
  const renderContent = () => {
    if (isLoading) {
      return (
        <Page className="sofia-py-4">
          <div className="planner-loading">{t('planner:loadingSchoolData')}</div>
        </Page>
      );
    }

    if (error) {
      const isAuthError = error.includes("Authentication") || error.includes("session") || error.includes("log in");
      
      return (
        <Page className="sofia-py-4">
          <Card title={t('common:error')}>
            <p>{error}</p>
            {isAuthError && (
              <Button 
                variant="primary"
                onClick={() => {
                  if (logout) logout();
                  navigate('/login');
                }}
              >
                {t('common:loginAgain')}
              </Button>
            )}
          </Card>
        </Page>
      );
    }

    if (!schoolData) {
      return (
        <Page className="sofia-py-4">
          <Card title={t('planner:missingData')}>
            <p>{t('planner:noSchoolData')}</p>
          </Card>
        </Page>
      );
    }

    return (
      <Page 
        title={t('planner:schoolYearPlanner')}
        className="sofia-py-4"
      >
        {schoolYears.length === 0 ? (
          <Card>
            <div className="no-years-message">
              {t('planner:noAcademicYears')}
            </div>
          </Card>
        ) : (
          <div className="years-grid">
            {schoolYears.map(year => (
              <Card
                key={year.id}
                className={`year-card ${year.id === selectedYearId ? 'selected' : ''}`}
                onClick={() => handleYearClick(year.id)}
                title={year.name}
              >
                <div className="subjects-list">
                  {year.subjects && year.subjects.length > 0 ? (
                    <ul>
                      {year.subjects.map(subject => (
                        <li key={subject.id} className="subject-item" onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectClick(subject);
                        }}>
                          <span className="subject-name">{subject.name}</span>
                          {subject.description && (
                            <p className="subject-description">{subject.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-subjects-message">
                      {t('planner:noSubjectsForYear')}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Page>
    );
  };

  // Return the component wrapped in Layout
  return (
    <Layout schoolName={schoolData?.name || t('planner:schoolPlanner')} sidebar={<Sidebar schoolName={schoolData?.name} />}>
      {renderContent()}
    </Layout>
  );
}

export default Planner; 