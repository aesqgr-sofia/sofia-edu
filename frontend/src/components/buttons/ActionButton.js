import React from 'react';

const ActionButton = ({ onClick, label, className = "btn-blue", style = {} }) => (
  <button 
    className={className}
    onClick={onClick}
    style={{ padding: '0.5rem 1rem', marginTop: '1rem', ...style }}
  >
    {label}
  </button>
);

export default ActionButton; 