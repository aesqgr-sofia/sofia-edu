import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook for authentication operations
 * Provides easy access to auth state and common auth operations
 * 
 * @returns {Object} Authentication state and methods
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { authToken, user, logout } = context;
  
  // Check if user is authenticated
  const isAuthenticated = Boolean(authToken);
  
  // Get authorization headers for API calls
  const getAuthHeaders = () => ({
    Authorization: `Token ${authToken}`,
    'Content-Type': 'application/json'
  });
  
  // Check if user has specific role/permission
  const hasRole = (role) => {
    return user?.role === role;
  };
  
  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Unknown User';
    return user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}`
      : user.username || user.email || 'User';
  };
  
  return {
    // State
    authToken,
    user,
    isAuthenticated,
    
    // Methods
    logout,
    getAuthHeaders,
    hasRole,
    getUserDisplayName
  };
};

export default useAuth; 