import { useState, useCallback } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

/**
 * Generic API hook for standardized API operations
 * Handles loading states, error management, and authentication
 * 
 * @param {string} baseUrl - Base URL for API calls
 * @param {Object} options - Configuration options
 * @returns {Object} API methods and state
 */
const useApi = (baseUrl = '', options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAuthHeaders } = useAuth();
  
  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Generic request method
  const request = useCallback(async (method, url, data = null, config = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const fullUrl = baseUrl + url;
      const headers = {
        ...getAuthHeaders(),
        ...config.headers
      };
      
      const response = await axios({
        method,
        url: fullUrl,
        data,
        headers,
        ...config
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'An error occurred';
      setError(errorMessage);
      
      // Call optional error handler
      if (options.onError) {
        options.onError(errorMessage, err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, getAuthHeaders, options]);
  
  // GET request
  const get = useCallback((url, config = {}) => {
    return request('GET', url, null, config);
  }, [request]);
  
  // POST request
  const post = useCallback((url, data, config = {}) => {
    return request('POST', url, data, config);
  }, [request]);
  
  // PUT request
  const put = useCallback((url, data, config = {}) => {
    return request('PUT', url, data, config);
  }, [request]);
  
  // PATCH request
  const patch = useCallback((url, data, config = {}) => {
    return request('PATCH', url, data, config);
  }, [request]);
  
  // DELETE request
  const del = useCallback((url, config = {}) => {
    return request('DELETE', url, null, config);
  }, [request]);
  
  return {
    // State
    loading,
    error,
    
    // Methods
    get,
    post,
    put,
    patch,
    delete: del,
    clearError,
    request
  };
};

export default useApi; 