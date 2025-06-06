import React from 'react';
import { Form } from 'react-bootstrap';

const FormModal = ({ 
  isOpen, 
  onClose, 
  title, 
  onSubmit, 
  children, 
  error 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <form onSubmit={onSubmit}>
          {children}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ marginRight: '1rem' }}
            >
              Cancel
            </button>
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal; 