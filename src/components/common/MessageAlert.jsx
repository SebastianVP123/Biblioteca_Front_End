// src/components/Common/MessageAlert.jsx
import React from 'react';

const MessageAlert = ({ type, message, onClose }) => {
  if (!message) return null;

  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`border rounded-md p-4 mb-4 ${typeStyles[type] || typeStyles.info}`}>
      <div className="flex justify-between items-start">
        <p className="text-sm">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageAlert;