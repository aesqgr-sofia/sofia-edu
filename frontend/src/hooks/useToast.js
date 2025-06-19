import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for toast notifications
 * Provides centralized toast message management with auto-dismiss
 * 
 * @param {number} defaultDuration - Default duration for toast messages (ms)
 * @returns {Object} Toast state and control methods
 */
const useToast = (defaultDuration = 3000) => {
  const [toasts, setToasts] = useState([]);
  
  // Generate unique ID for toast
  const generateId = useCallback(() => {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }, []);
  
  // Add new toast
  const showToast = useCallback((message, type = 'success', duration = defaultDuration) => {
    const id = generateId();
    const newToast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      timestamp: Date.now()
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  }, [defaultDuration, generateId]);
  
  // Remove specific toast
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  // Clear all toasts
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Convenience methods for different toast types
  const showSuccess = useCallback((message, duration) => {
    return showToast(message, 'success', duration);
  }, [showToast]);
  
  const showError = useCallback((message, duration) => {
    return showToast(message, 'error', duration);
  }, [showToast]);
  
  const showWarning = useCallback((message, duration) => {
    return showToast(message, 'warning', duration);
  }, [showToast]);
  
  const showInfo = useCallback((message, duration) => {
    return showToast(message, 'info', duration);
  }, [showToast]);
  
  return {
    // State
    toasts,
    
    // Methods
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  };
};

export default useToast; 