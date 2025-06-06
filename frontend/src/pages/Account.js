import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Account = () => {
  const { user } = useContext(AuthContext);

  return (
    <Layout>
      <div className="account-page">
        <h1>Account Information</h1>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '2rem', 
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>User Details</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong>Role: </strong>
                <span style={{ 
                  backgroundColor: user?.role === 'admin' ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginLeft: '0.5rem'
                }}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                </span>
              </div>
              <div>
                <strong>Username: </strong>
                <span>{user?.username || 'N/A'}</span>
              </div>
              <div>
                <strong>Email: </strong>
                <span>{user?.email || 'N/A'}</span>
              </div>
              {user?.school && (
                <div>
                  <strong>School: </strong>
                  <span>{user.school.name || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Add more sections here if needed */}
          
          {process.env.NODE_ENV === 'development' && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px',
              fontSize: '0.8em' 
            }}>
              <strong>Debug Information:</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Account; 