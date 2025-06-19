import React from 'react';
import PropTypes from 'prop-types';
import '../styles/forms.css';

/**
 * Reusable FormField component for consistent form styling
 * Handles label, input, validation, and help text
 */
const FormField = ({ 
  id,
  label,
  children,
  error,
  hint,
  required = false,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const fieldClasses = [
    'sofia-form-field',
    error ? 'sofia-form-field--error' : '',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'sofia-form-container',
    containerClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={fieldClasses}>
        {label && (
          <label htmlFor={id} className="sofia-form-label">
            {label}
            {required && <span className="sofia-form-required">*</span>}
          </label>
        )}
        
        <div className="sofia-form-input-container">
          {children}
        </div>
        
        {hint && !error && (
          <small className="sofia-form-hint">{hint}</small>
        )}
        
        {error && (
          <small className="sofia-form-error">{error}</small>
        )}
      </div>
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  error: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string
};

export default FormField; 