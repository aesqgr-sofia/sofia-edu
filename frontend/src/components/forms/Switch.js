import React from 'react';
import PropTypes from 'prop-types';
import './Switch.css';

/**
 * Switch component for toggling boolean values
 * A modern toggle switch with smooth animations
 */
const Switch = ({
  id,
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  label,
  className = '',
  'aria-label': ariaLabel
}) => {
  const handleChange = (e) => {
    if (onChange && !disabled) {
      onChange(e);
    }
  };

  const switchClasses = [
    'sofia-switch',
    `sofia-switch--${size}`,
    checked ? 'sofia-switch--checked' : '',
    disabled ? 'sofia-switch--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="sofia-switch-container">
      <label className="sofia-switch-label" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sofia-switch-input"
          aria-label={ariaLabel || label}
        />
        <span className={switchClasses}>
          <span className="sofia-switch-thumb"></span>
        </span>
        {label && <span className="sofia-switch-text">{label}</span>}
      </label>
    </div>
  );
};

Switch.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  label: PropTypes.string,
  className: PropTypes.string,
  'aria-label': PropTypes.string
};

export default Switch; 