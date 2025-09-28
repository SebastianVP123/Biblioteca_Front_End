// src/components/Common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = '#007bff' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${sizeClasses[size]}`}
         style={{ borderColor: `${color} transparent ${color} ${color}` }}>
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default LoadingSpinner;