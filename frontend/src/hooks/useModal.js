import { useState, useCallback } from 'react';

/**
 * Custom hook for modal state management
 * Provides consistent modal open/close behavior and data handling
 * 
 * @param {Object} initialState - Initial modal state
 * @returns {Object} Modal state and control methods
 */
const useModal = (initialState = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Open modal with optional data
  const open = useCallback((modalData = null) => {
    setData(modalData || initialState);
    setError(null);
    setIsOpen(true);
  }, [initialState]);
  
  // Close modal and reset state
  const close = useCallback(() => {
    setIsOpen(false);
    setData(initialState);
    setError(null);
    setLoading(false);
  }, [initialState]);
  
  // Update modal data
  const updateData = useCallback((newData) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);
  
  // Set loading state
  const setModalLoading = useCallback((loadingState) => {
    setLoading(loadingState);
  }, []);
  
  // Set error state
  const setModalError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Toggle modal
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);
  
  return {
    // State
    isOpen,
    data,
    loading,
    error,
    
    // Methods
    open,
    close,
    toggle,
    updateData,
    setLoading: setModalLoading,
    setError: setModalError,
    clearError
  };
};

export default useModal; 