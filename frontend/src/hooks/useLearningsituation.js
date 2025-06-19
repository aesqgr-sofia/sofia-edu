import { useState, useCallback } from 'react';
import { useCRUD, useToast } from './index';

/**
 * Custom hook for learning situation-specific operations
 * Extends the generic CRUD hook with learning situation-specific logic
 */
const useLearningsituation = (options = {}) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  
  const toast = useToast();
  const learningsituationsCrud = useCRUD('learning-situations', {
    onCreateSuccess: (situation) => {
      toast.showSuccess(`Learning Situation "${situation.title}" created successfully!`);
      if (options.onCreateSuccess) options.onCreateSuccess(situation);
    },
    onUpdateSuccess: (situation) => {
      toast.showSuccess(`Learning Situation "${situation.title}" updated successfully!`);
      if (options.onUpdateSuccess) options.onUpdateSuccess(situation);
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

  // Validate learning situation data before submission
  const validateLearningsituation = useCallback((situationData) => {
    const errors = {};
    
    if (!situationData.title?.trim()) {
      errors.title = 'Please enter a title for the learning situation.';
    }
    
    if (!situationData.year) {
      errors.year = 'Please select a year.';
    }
    
    if (!situationData.subject) {
      errors.subject = 'Please select a subject.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  // Fetch available modules for a specific subject
  const fetchAvailableModules = useCallback(async (subjectId) => {
    if (!subjectId) {
      console.error('Missing subject ID for fetching modules');
      return;
    }

    if (!learningsituationsCrud.api) {
      console.error('API not ready yet');
      return;
    }

    try {
      setLoadingModules(true);
      
      const response = await learningsituationsCrud.api.get('/modules/', {
        params: { subject: subjectId }
      });
      
      setAvailableModules(response);
      return response;
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.showError('Failed to load modules for this subject');
      setAvailableModules([]);
      throw error;
    } finally {
      setLoadingModules(false);
    }
  }, [learningsituationsCrud.api, toast]);

  // Fetch competence details for a module
  const fetchCompetenceDetailsForModule = useCallback(async (module) => {
    if (!learningsituationsCrud.api) {
      console.error('API not ready yet');
      return module;
    }

    try {
      // Fetch full competence data if we have competence IDs
      if (module.specific_competences && module.specific_competences.length > 0) {
        const competencesResponse = await learningsituationsCrud.api.get('/specific-competences/', {
          params: {
            subject: module.subject,
            year: module.year
          }
        });
        
        // Filter competences to only include the ones referenced in the module
        const moduleCompetences = competencesResponse.filter(competence =>
          module.specific_competences.includes(competence.id)
        );
        
        // Add the full competence objects to the module data
        module.competence_details = moduleCompetences;
        
        // Also create a mapping for criteria details
        if (module.selected_criteria && Object.keys(module.selected_criteria).length > 0) {
          const criteriaDetails = [];
          
          // Extract all selected criteria from the module
          Object.entries(module.selected_criteria).forEach(([competenceId, criteriaIds]) => {
            const competence = moduleCompetences.find(c => c.id === competenceId);
            if (competence && competence.evaluation_criteria) {
              criteriaIds.forEach(criterionId => {
                const criterion = competence.evaluation_criteria.find(c => c.id === criterionId);
                if (criterion) {
                  criteriaDetails.push({
                    ...criterion,
                    competence_id: competenceId
                  });
                }
              });
            }
          });
          
          module.criteria_details = criteriaDetails;
        }
      }
      
      return module;
    } catch (error) {
      console.error('Error fetching competence details:', error);
      return module;
    }
  }, [learningsituationsCrud.api]);

  // Add module to selected modules
  const addModule = useCallback(async (module, selectedModules, setSelectedModules) => {
    const updatedModules = Array.isArray(selectedModules) ? selectedModules : [];
    
    // Check if module is already selected
    if (!updatedModules.some(m => m.id === module.id)) {
      try {
        // Fetch competence and criteria details for the module
        const detailedModule = await fetchCompetenceDetailsForModule({ ...module });
        
        setSelectedModules(prev => Array.isArray(prev) ? [...prev, detailedModule] : [detailedModule]);
        
        // Update available modules to mark as selected
        setAvailableModules(prev => 
          prev.map(m => 
            m.id === module.id ? { ...m, isSelected: true } : m
          )
        );
        
        toast.showSuccess(`"${module.title}" added to Learning Situation`);
      } catch (error) {
        console.error('Error adding module with details:', error);
        // Fall back to adding without detailed data
        setSelectedModules(prev => Array.isArray(prev) ? [...prev, module] : [module]);
        toast.showSuccess(`"${module.title}" added to Learning Situation`);
      }
    }
  }, [fetchCompetenceDetailsForModule, toast]);

  // Remove module from selected modules
  const removeModule = useCallback((moduleId, selectedModules, setSelectedModules) => {
    setSelectedModules(prev => Array.isArray(prev) ? prev.filter(m => m.id !== moduleId) : []);
    
    // Update available modules to unmark as selected
    setAvailableModules(prev => 
      prev.map(m => 
        m.id === moduleId ? { ...m, isSelected: false } : m
      )
    );
    
    const moduleName = availableModules.find(m => m.id === moduleId)?.title || 'Module';
    toast.showSuccess(`"${moduleName}" removed from Learning Situation`);
  }, [availableModules, toast]);

  // Create learning situation with validation
  const createLearningsituation = useCallback(async (situationData) => {
    if (!validateLearningsituation(situationData)) {
      toast.showError('Please fix the validation errors before saving.');
      return false;
    }
    
    try {
      const result = await learningsituationsCrud.create(situationData);
      setValidationErrors({});
      return result;
    } catch (error) {
      return false;
    }
  }, [learningsituationsCrud, validateLearningsituation, toast]);

  // Update learning situation with validation
  const updateLearningsituation = useCallback(async (id, situationData) => {
    if (!validateLearningsituation(situationData)) {
      toast.showError('Please fix the validation errors before saving.');
      return false;
    }
    
    try {
      const result = await learningsituationsCrud.update(id, situationData);
      setValidationErrors({});
      return result;
    } catch (error) {
      return false;
    }
  }, [learningsituationsCrud, validateLearningsituation, toast]);

  // Filter modules based on search query
  const filterModules = useCallback((modules, searchQuery) => {
    if (!searchQuery.trim()) return modules;
    
    return modules.filter(module => {
      return (
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (module.description && 
         module.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, []);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    // CRUD operations
    ...learningsituationsCrud,
    
    // Learning situation-specific operations
    createLearningsituation,
    updateLearningsituation,
    fetchAvailableModules,
    fetchCompetenceDetailsForModule,
    addModule,
    removeModule,
    filterModules,
    
    // Modules state
    availableModules,
    loadingModules,
    
    // Validation
    validationErrors,
    clearValidationErrors,
    validateLearningsituation,
    
    // Toast utilities
    ...toast
  };
};

export default useLearningsituation; 