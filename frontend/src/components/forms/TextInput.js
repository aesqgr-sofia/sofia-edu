import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized TextInput component
 * Used for text, email, password, and other input types
 */
const TextInput = forwardRef(({ 
  type = 'text',
  className = '',
  disabled = false,
  readOnly = false,
  ...props 
}, ref) => {
  const inputClasses = [
    'sofia-input',
    'sofia-input--text',
    disabled ? 'sofia-input--disabled' : '',
    readOnly ? 'sofia-input--readonly' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      ref={ref}
      type={type}
      className={inputClasses}
      disabled={disabled}
      readOnly={readOnly}
      {...props}
    />
  );
});

TextInput.displayName = 'TextInput';

TextInput.propTypes = {
  type: PropTypes.oneOf(['text', 'email', 'password', 'url', 'tel']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
};

export default TextInput; 