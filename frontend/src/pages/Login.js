// src/pages/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import logo from '../components/logo.svg'; // Adjust path if needed

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/login/', { username, password });
      console.log('Login response:', response.data); // Debug log

      // Extract user data and ensure role is included
      const { token, user: userData } = response.data;
      
      // Add role if it's not in the response (temporary fix)
      const enhancedUserData = {
        ...userData,
        role: userData.role || (username === 'admin' ? 'admin' : 'teacher') // Temporary fallback
      };
      
      console.log('Enhanced user data:', enhancedUserData); // Debug log
      
      login(token, enhancedUserData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response || err);
      setError(err.response?.data?.error || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', textAlign: 'center' }}>
      {/* Logo Section */}
      <img 
        src={logo} 
        alt="Company Logo" 
        style={{ width: '150px', marginBottom: '1rem' }} 
      />
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <div style={{ textAlign: 'center' }}>
          <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
