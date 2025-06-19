import { useState, useCallback } from 'react';
import { useCRUD, useToast } from './index';

/**
 * Custom hook for module-specific operations
 * Extends the generic CRUD hook with module-specific logic
 */
const useModule = (options = {}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [competences, setCompetences] = useState([]);
  const [loadingCompetences, setLoadingCompetences] = useState(false);
  
  const toast = useToast();
  const modulesCrud = useCRUD('modules', {
    onCreateSuccess: (module) => {
      toast.showSuccess(`Module "${module.title}" created successfully!`);
      if (options.onCreateSuccess) options.onCreateSuccess(module);
    },
    onUpdateSuccess: (module) => {
      toast.showSuccess(`Module "${module.title}" updated successfully!`);
      if (options.onUpdateSuccess) options.onUpdateSuccess(module);
    },
    onCreateError: (error) => {
      handleValidationErrors(error);
      if (options.onCreateError) options.onCreateError(error);
    },
    onUpdateError: (error) => {
      handleValidationErrors(error);
      if (options.onUpdateError) options.onUpdateError(error);
    }
  });

  // Handle API validation errors
  const handleValidationErrors = useCallback((error) => {
    if (error.response?.data && typeof error.response.data === 'object') {
      const apiErrors = error.response.data;
      const formattedErrors = {};
      
      Object.entries(apiErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          formattedErrors[field] = messages.join(', ');
        } else {
          formattedErrors[field] = messages;
        }
      });
      
      setValidationErrors(formattedErrors);
    }
  }, []);

  // Validate module data before submission
  const validateModule = useCallback((moduleData) => {
    const errors = {};
    
    if (!moduleData.title?.trim()) {
      errors.title = 'Please enter a title for the module.';
    }
    
    if (!moduleData.description?.trim()) {
      errors.description = 'Please enter a description for the module.';
    }
    
    if (!moduleData.year) {
      errors.year = 'Please select a year.';
    }
    
    if (!moduleData.subject) {
      errors.subject = 'Please select a subject.';
    }
    
    if (!moduleData.specific_competences?.length) {
      errors.competences = 'Please select at least one competence.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  // Fetch competences for specific region, subject, and year
  const fetchCompetences = useCallback(async (regionId, subjectId, yearId) => {
    if (!regionId || !subjectId || !yearId) {
      console.error('Missing required parameters for fetching competences');
      return;
    }

    if (!modulesCrud.api) {
      console.error('API not ready yet');
      return;
    }

    try {
      setLoadingCompetences(true);
      
      const response = await modulesCrud.api.get('/specific-competences/', {
        params: { region: regionId, subject: subjectId, year: yearId }
      });
      
      setCompetences(response);
      return response;
    } catch (error) {
      console.error('Error fetching competences:', error);
      toast.showError('Failed to load competences for this subject and year');
      setCompetences([]);
      throw error;
    } finally {
      setLoadingCompetences(false);
    }
  }, [modulesCrud.api, toast]);

  // Create module with validation
  const createModule = useCallback(async (moduleData) => {
    if (!validateModule(moduleData)) {
      toast.showError('Please fix the validation errors before saving.');
      return false;
    }
    
    try {
      const result = await modulesCrud.create(moduleData);
      setValidationErrors({});
      return result;
    } catch (error) {
      return false;
    }
  }, [modulesCrud, validateModule, toast]);

  // Update module with validation
  const updateModule = useCallback(async (id, moduleData) => {
    if (!validateModule(moduleData)) {
      toast.showError('Please fix the validation errors before saving.');
      return false;
    }
    
    try {
      const result = await modulesCrud.update(id, moduleData);
      setValidationErrors({});
      return result;
    } catch (error) {
      return false;
    }
  }, [modulesCrud, validateModule, toast]);

  // Handle competence selection toggle
  const toggleCompetence = useCallback((competenceId, selectedCompetences, setSelectedCompetences, selectedCriteria, setSelectedCriteria) => {
    // Ensure selectedCompetences is an array
    const competences = Array.isArray(selectedCompetences) ? selectedCompetences : [];
    
    if (competences.includes(competenceId)) {
      // Remove competence and its criteria
      setSelectedCompetences(prev => Array.isArray(prev) ? prev.filter(id => id !== competenceId) : []);
      setSelectedCriteria(prev => {
        const newCriteria = { ...prev };
        delete newCriteria[competenceId];
        return newCriteria;
      });
    } else {
      // Add competence
      setSelectedCompetences(prev => Array.isArray(prev) ? [...prev, competenceId] : [competenceId]);
    }
  }, []);

  // Handle evaluation criteria toggle
  const toggleEvaluationCriteria = useCallback((competenceId, criterionId, selectedCriteria, setSelectedCriteria) => {
    setSelectedCriteria(prev => {
      const competenceCriteria = prev[competenceId] || [];
      const newCriteria = { ...prev };
      
      if (competenceCriteria.includes(criterionId)) {
        // Remove criterion
        newCriteria[competenceId] = competenceCriteria.filter(id => id !== criterionId);
        if (newCriteria[competenceId].length === 0) {
          delete newCriteria[competenceId];
        }
      } else {
        // Add criterion
        newCriteria[competenceId] = [...competenceCriteria, criterionId];
      }
      
      return newCriteria;
    });
  }, []);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    // CRUD operations
    ...modulesCrud,
    
    // Module-specific operations
    createModule,
    updateModule,
    fetchCompetences,
    toggleCompetence,
    toggleEvaluationCriteria,
    
    // Competences state
    competences,
    loadingCompetences,
    
    // Validation
    validationErrors,
    clearValidationErrors,
    validateModule,
    
    // Toast utilities
    ...toast
  };
};

export default useModule; 