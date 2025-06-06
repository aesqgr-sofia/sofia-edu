import React from 'react';
import PropTypes from 'prop-types';
import '../../components/styles/button.css';

/**
 * Button component for user interactions
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button style variant (primary, secondary, tertiary, danger)
 * @param {string} [props.size='medium'] - Button size (small, medium, large)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.fullWidth=false] - Whether the button should take up the full width
 * @param {boolean} [props.isLoading=false] - Whether the button is in loading state
 * @param {boolean} [props.isIcon=false] - Whether it's an icon button
 * @param {string} [props.iconPosition='left'] - Position of the icon (left, right)
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.type='button'] - Button type (button, submit, reset)
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @returns {React.ReactElement} - Button component
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  isLoading = false,
  isIcon = false,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = [
    'sofia-button',
    `sofia-button--${variant}`,
    `sofia-button--${size}`,
    disabled ? 'sofia-button--disabled' : '',
    fullWidth ? 'sofia-button--full-width' : '',
    isLoading ? 'sofia-button--loading' : '',
    isIcon ? 'sofia-button--icon' : '',
    isIcon && variant !== 'primary' ? `sofia-button--icon-${variant}` : '',
    children && typeof children !== 'string' ? 'sofia-button--with-icon' : '',
    children && typeof children !== 'string' ? `sofia-button--icon-${iconPosition}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  isLoading: PropTypes.bool,
  isIcon: PropTypes.bool,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button; 