import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => {
    const token = localStorage.getItem('authToken');
    console.log('Initial authToken:', token); // Debug log
    return token;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    console.log('Initial saved user:', savedUser); // Debug log
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Error parsing saved user:', e);
      return null;
    }
  });

  // Debug effect to monitor user state changes
  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  const login = (token, userData = null) => {
    console.log('Login called with:', { token, userData }); // Debug log
    
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    
    if (userData) {
      console.log('Setting user data:', userData); // Debug log
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    console.log('Logout called'); // Debug log
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // Debug log the current context value
  const contextValue = { authToken, user, login, logout, setUser };
  console.log('AuthContext value:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};