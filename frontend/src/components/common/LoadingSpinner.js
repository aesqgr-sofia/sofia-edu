import React from 'react';
import PropTypes from 'prop-types';
import '../styles/loading.css';

/**
 * LoadingSpinner component for displaying loading states
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Spinner size (small, medium, large)
 * @param {string} [props.color='primary'] - Spinner color theme
 * @param {string} [props.message] - Optional loading message
 * @param {boolean} [props.overlay=false] - Whether to show as full-screen overlay
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} LoadingSpinner component
 */
const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  message,
  overlay = false,
  className = ''
}) => {
  const spinnerClasses = [
    'sofia-spinner',
    `sofia-spinner--${size}`,
    `sofia-spinner--${color}`,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'sofia-spinner-container',
    overlay ? 'sofia-spinner-overlay' : '',
    message ? 'sofia-spinner-with-message' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}>
        <div className="sofia-spinner-circle"></div>
      </div>
      {message && (
        <div className="sofia-spinner-message">{message}</div>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  message: PropTypes.string,
  overlay: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner; 