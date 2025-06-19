import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Standardized Select component
 * Handles dropdown selections with consistent styling
 */
const Select = forwardRef(({ 
  options = [],
  placeholder = '-- Select --',
  className = '',
  disabled = false,
  loading = false,
  ...props 
}, ref) => {
  const selectClasses = [
    'sofia-input',
    'sofia-select',
    disabled ? 'sofia-input--disabled' : '',
    loading ? 'sofia-select--loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="sofia-select-container">
      <select
        ref={ref}
        className={selectClasses}
        disabled={disabled || loading}
        {...props}
      >
        {placeholder && (
          <option value="">{loading ? 'Loading...' : placeholder}</option>
        )}
        {options.map((option) => {
          // Handle both string arrays and object arrays
          const value = typeof option === 'string' ? option : option.value || option.id;
          const label = typeof option === 'string' ? option : option.label || option.name || option.value;
          
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {loading && <div className="sofia-select-spinner" />}
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
      })
    ])
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func
};

export default Select; 