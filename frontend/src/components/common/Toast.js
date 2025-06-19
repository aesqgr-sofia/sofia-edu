import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/toast.css';

/**
 * Individual Toast component
 */
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const toastClasses = [
    'sofia-toast',
    `sofia-toast--${toast.type}`,
    isVisible ? 'sofia-toast--visible' : '',
    isRemoving ? 'sofia-toast--removing' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={toastClasses}>
      <div className="sofia-toast-content">
        <span className="sofia-toast-icon">{getToastIcon()}</span>
        <span className="sofia-toast-message">{toast.message}</span>
      </div>
      <button 
        className="sofia-toast-close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired
  }).isRequired,
  onRemove: PropTypes.func.isRequired
};

/**
 * ToastContainer component for displaying multiple toasts
 */
const ToastContainer = ({ toasts, onRemove, position = 'top-right' }) => {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  const containerClasses = [
    'sofia-toast-container',
    `sofia-toast-container--${position}`
  ].join(' ');

  return (
    <div className={containerClasses}>
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

ToastContainer.propTypes = {
  toasts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired
  })),
  onRemove: PropTypes.func.isRequired,
  position: PropTypes.oneOf([
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ])
};

export { Toast, ToastContainer };
export default ToastContainer; 