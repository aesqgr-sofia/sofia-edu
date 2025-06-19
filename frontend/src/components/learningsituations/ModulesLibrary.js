import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import { Button } from '../common';

/**
 * ModulesLibrary component
 * Handles the library sidebar with available modules for drag & drop
 */
const ModulesLibrary = ({
  visible,
  availableModules = [],
  filteredModules = [],
  searchQuery,
  loading = false,
  onClose,
  onSearchChange,
  onDragStart,
  onDragEnd,
  onCreateModule,
  onEditModule,
  onDeleteModule
}) => {
  const { t } = useTranslation(['common', 'learning', 'modules']);
  
  // Determine the icon and hint based on evaluable status
  const getEvaluableIcon = (module) => {
    if (module.evaluable) {
      return {
        icon: '📝',
        title: t('modules:evaluableIcon')
      };
    } else {
      return {
        icon: '🔒',
        title: t('modules:notEvaluableIcon')
      };
    }
  };

  return (
    <div className={`modules-library ${visible ? 'visible' : ''}`}>
      <div className="library-header">
        <h2>{t('common:library')}</h2>
        <div className="library-header-buttons">
          <Button 
            variant="tertiary"
            isIcon={true}
            onClick={onClose}
            title={t('common:close')}
            className="close-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </Button>
        </div>
      </div>
      
      <div className="library-search">
        <input
          type="text"
          placeholder={t('learning:searchModules')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="library-items">
        {loading ? (
          <LoadingSpinner message={t('common:loading')} />
        ) : filteredModules.length === 0 ? (
          <>
            {availableModules.length === 0 ? (
              <div className="library-empty">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                </svg>
                <p>{t('learning:noModulesSelected')}</p>
              </div>
            ) : (
              <div className="library-empty">
                <p>{t('learning:noModulesSelected')}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {filteredModules.map(module => (
              <div 
                key={module.id}
                className={`library-item ${module.isSelected ? 'selected' : ''}`}
                draggable={!module.isSelected}
                onDragStart={(e) => !module.isSelected && onDragStart(e, module)}
                onDragEnd={onDragEnd}
                title={module.isSelected ? t('common:modules') : t('common:module')}
              >
                <h3>
                  <span 
                    className="evaluable-icon" 
                    title={getEvaluableIcon(module).title}
                  >
                    {getEvaluableIcon(module).icon}
                  </span>
                  {module.title}
                </h3>
                <p dangerouslySetInnerHTML={{ 
                  __html: module.description && module.description.length > 150 
                    ? module.description.substring(0, 150) + '...' 
                    : module.description 
                }} />
                
                {/* Display Competences if available */}
                {module.competence_details && module.competence_details.length > 0 && (
                  <div className="competence-codes">
                    {module.competence_details.slice(0, 3).map(competence => (
                      <span key={competence.id} className="competence-code">
                        {competence.code}
                      </span>
                    ))}
                    {module.competence_details.length > 3 && (
                      <span className="competence-code">
                        +{module.competence_details.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="module-actions">
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditModule(module);
                    }}
                    title={t('common:edit')}
                    className="action-button edit-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L15.207 4.5 9.5 10.207l-3 3a.5.5 0 0 1-.708 0L2.5 10.914a.5.5 0 0 1 0-.708l3-3L10.207 2.5 10.854.146zM11.207 2.5 8.5 5.207 10.793 7.5l2.707-2.707L11.207 2.5zM7.793 5.914 2.5 11.207V13.5h2.293l5.207-5.207L7.793 5.914z"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteModule(module);
                    }}
                    title={t('common:delete')}
                    className="action-button delete-button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      <div className="library-footer">
        <Button 
          variant="primary"
          onClick={onCreateModule}
          disabled={!availableModules.length && !loading}
          className="create-module-button"
        >
          {t('common:add')} {t('common:module')}
        </Button>
      </div>
    </div>
  );
};

ModulesLibrary.propTypes = {
  visible: PropTypes.bool.isRequired,
  availableModules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    evaluable: PropTypes.bool,
    isSelected: PropTypes.bool,
    competence_details: PropTypes.array
  })),
  filteredModules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    evaluable: PropTypes.bool,
    isSelected: PropTypes.bool,
    competence_details: PropTypes.array
  })),
  searchQuery: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onDragStart: PropTypes.func.isRequired,
  onDragEnd: PropTypes.func.isRequired,
  onCreateModule: PropTypes.func.isRequired,
  onEditModule: PropTypes.func.isRequired,
  onDeleteModule: PropTypes.func.isRequired
};

export default ModulesLibrary; 