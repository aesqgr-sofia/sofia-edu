import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * ModuleFileUpload component
 * Handles file upload and display for modules
 */
const ModuleFileUpload = ({
  files = [],
  onFileSelect,
  onRemoveFile,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = null,
  errors = {}
}) => {
  const { t } = useTranslation(['modules', 'common']);
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t('modules:bytes')}`;
    const k = 1024;
    const sizes = [t('modules:bytes'), t('modules:kb'), t('modules:mb'), t('modules:gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate files
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} is too large (${formatFileSize(file.size)})`);
        return false;
      }
      
      // Check file type if specified
      if (acceptedTypes && !acceptedTypes.includes(file.type)) {
        console.warn(`File ${file.name} has unsupported type (${file.type})`);
        return false;
      }
      
      return true;
    });
    
    if (onFileSelect) {
      onFileSelect(validFiles);
    }
    
    // Clear the input
    e.target.value = '';
  };

  return (
    <Card>
      <div className="sofia-form-section">
        <h2>{t('modules:fileAttachments')}</h2>
        <p className="section-hint">
          {t('modules:fileAttachmentsHint')}
        </p>
        
        {errors.files && (
          <div className="sofia-form-error" style={{ marginBottom: '1rem' }}>
            {errors.files}
          </div>
        )}
        
        <div className="file-upload-container">
          <label htmlFor="fileUpload" className="file-upload-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {t('modules:uploadFiles')}
            <input 
              type="file"
              id="fileUpload"
              className="file-input"
              multiple
              onChange={handleFileSelect}
              accept={acceptedTypes ? acceptedTypes.join(',') : undefined}
            />
          </label>
          <small className="file-upload-hint">
            {t('modules:maximumFileSize', { size: formatFileSize(maxFileSize) })}
            {acceptedTypes && ` • ${t('modules:acceptedTypes', { types: acceptedTypes.join(', ') })}`}
          </small>
        </div>
        
        {files.length > 0 && (
          <div className="uploaded-files">
            <h4>{t('modules:uploadedFiles', { count: files.length })}</h4>
            <div className="file-list">
              {files.map((file, index) => (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  index={index}
                  onRemove={() => onRemoveFile(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Individual file item component
 */
const FileItem = ({ file, index, onRemove }) => {
  const { t } = useTranslation(['modules', 'common']);
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return `0 ${t('modules:bytes')}`;
    const k = 1024;
    const sizes = [t('modules:bytes'), t('modules:kb'), t('modules:mb'), t('modules:gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📋';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
        return '🎵';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📎';
    }
  };

  return (
    <div className="file-item">
      <div className="file-icon">{getFileIcon(file.name)}</div>
      <div className="file-details">
        <span className="file-name" title={file.name}>{file.name}</span>
        <span className="file-size">{formatFileSize(file.size)}</span>
      </div>
      <Button
        variant="tertiary"
        size="small"
        onClick={onRemove}
        className="remove-file-button"
        title={t('modules:removeFile')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Button>
    </div>
  );
};

ModuleFileUpload.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  onFileSelect: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  maxFileSize: PropTypes.number,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  errors: PropTypes.object
};

FileItem.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired
};

export default ModuleFileUpload; 