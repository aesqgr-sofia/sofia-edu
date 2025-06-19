import { useState, useCallback } from 'react';
import useApi from './useApi';

/**
 * Custom hook for CRUD operations
 * Standardizes Create, Read, Update, Delete operations with consistent error handling
 * 
 * @param {string} endpoint - API endpoint for the resource
 * @param {Object} options - Configuration options
 * @returns {Object} CRUD methods and state
 */
const useCRUD = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [items, setItems] = useState([]);
  const api = useApi('/api/core/', {
    onError: options.onError
  });
  
  // Create new item
  const create = useCallback(async (itemData) => {
    try {
      const newItem = await api.post(`${endpoint}/`, itemData);
      
      // Update items list if we have one
      if (Array.isArray(items)) {
        setItems(prev => [...prev, newItem]);
      }
      
      // Call success callback
      if (options.onCreateSuccess) {
        options.onCreateSuccess(newItem);
      }
      
      return newItem;
    } catch (error) {
      if (options.onCreateError) {
        options.onCreateError(error);
      }
      throw error;
    }
  }, [api, endpoint, items, options]);
  
  // Read single item
  const read = useCallback(async (id) => {
    try {
      const item = await api.get(`${endpoint}/${id}/`);
      setData(item);
      
      if (options.onReadSuccess) {
        options.onReadSuccess(item);
      }
      
      return item;
    } catch (error) {
      if (options.onReadError) {
        options.onReadError(error);
      }
      throw error;
    }
  }, [api, endpoint, options]);
  
  // Read all items with optional filters
  const readAll = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `${endpoint}/?${queryString}` : `${endpoint}/`;
      
      const itemsList = await api.get(url);
      setItems(itemsList);
      
      if (options.onReadAllSuccess) {
        options.onReadAllSuccess(itemsList);
      }
      
      return itemsList;
    } catch (error) {
      if (options.onReadAllError) {
        options.onReadAllError(error);
      }
      throw error;
    }
  }, [api, endpoint, options]);
  
  // Update existing item
  const update = useCallback(async (id, itemData, method = 'PUT') => {
    try {
      const apiMethod = method === 'PATCH' ? api.patch : api.put;
      const updatedItem = await apiMethod(`${endpoint}/${id}/`, itemData);
      
      // Update items list if we have one
      if (Array.isArray(items)) {
        setItems(prev => prev.map(item => 
          item.id === id ? updatedItem : item
        ));
      }
      
      // Update single data if it matches
      if (data && data.id === id) {
        setData(updatedItem);
      }
      
      if (options.onUpdateSuccess) {
        options.onUpdateSuccess(updatedItem);
      }
      
      return updatedItem;
    } catch (error) {
      if (options.onUpdateError) {
        options.onUpdateError(error);
      }
      throw error;
    }
  }, [api, endpoint, items, data, options]);
  
  // Delete item
  const remove = useCallback(async (id) => {
    try {
      await api.delete(`${endpoint}/${id}/`);
      
      // Remove from items list
      if (Array.isArray(items)) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
      
      // Clear single data if it matches
      if (data && data.id === id) {
        setData(null);
      }
      
      if (options.onDeleteSuccess) {
        options.onDeleteSuccess(id);
      }
      
      return true;
    } catch (error) {
      if (options.onDeleteError) {
        options.onDeleteError(error);
      }
      throw error;
    }
  }, [api, endpoint, items, data, options]);
  
  // Refresh data
  const refresh = useCallback(async (filters = {}) => {
    return readAll(filters);
  }, [readAll]);
  
  // Clear local state
  const clear = useCallback(() => {
    setData(null);
    setItems([]);
  }, []);
  
  return {
    // State
    data,
    items,
    loading: api.loading,
    error: api.error,
    
    // Methods
    create,
    read,
    readAll,
    update,
    remove,
    refresh,
    clear,
    clearError: api.clearError,
    
    // Expose API for custom calls
    api
  };
};

export default useCRUD; 