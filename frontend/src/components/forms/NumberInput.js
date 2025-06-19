import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';

/**
 * NumberInput component with optional increment/decrement buttons
 * Handles numeric input with step controls
 */
const NumberInput = forwardRef(({ 
  value,
  onChange,
  step = 1,
  min,
  max,
  showControls = true,
  className = '',
  disabled = false,
  ...props 
}, ref) => {
  const containerClasses = [
    'sofia-number-input-container',
    showControls ? 'sofia-number-input--with-controls' : '',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'sofia-input',
    'sofia-number-input',
    disabled ? 'sofia-input--disabled' : ''
  ].filter(Boolean).join(' ');

  const handleIncrement = () => {
    if (disabled || onChange === undefined) return;
    
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue + step;
    
    if (max !== undefined && newValue > max) return;
    
    onChange({
      target: { 
        value: newValue.toString(),
        type: 'number'
      }
    });
  };

  const handleDecrement = () => {
    if (disabled || onChange === undefined) return;
    
    const currentValue = parseFloat(value) || 0;
    const newValue = currentValue - step;
    
    if (min !== undefined && newValue < min) return;
    
    onChange({
      target: { 
        value: newValue.toString(),
        type: 'number'
      }
    });
  };

  const canDecrement = !disabled && (min === undefined || parseFloat(value) > min);
  const canIncrement = !disabled && (max === undefined || parseFloat(value) < max);

  return (
    <div className={containerClasses}>
      {showControls && (
        <Button
          variant="secondary"
          size="small"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className="sofia-number-input-btn sofia-number-input-btn--decrement"
          type="button"
        >
          −
        </Button>
      )}
      
      <input
        ref={ref}
        type="number"
        className={inputClasses}
        value={value}
        onChange={onChange}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        {...props}
      />
      
      {showControls && (
        <Button
          variant="secondary"
          size="small"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className="sofia-number-input-btn sofia-number-input-btn--increment"
          type="button"
        >
          +
        </Button>
      )}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

NumberInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  showControls: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string
};

export default NumberInput; 