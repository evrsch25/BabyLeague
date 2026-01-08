import React from 'react';
import './AlertModal.css';

const AlertModal = ({ isOpen, title, message, buttonText = 'OK', onClose, type = 'info' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal-header">
          <div className="alert-modal-icon">{getIcon()}</div>
          <h2 className="alert-modal-title">{title}</h2>
          <button className="alert-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="alert-modal-body">
          <p className="alert-modal-message">{message}</p>
        </div>

        <div className="alert-modal-footer">
          <button 
            onClick={onClose} 
            className={`btn ${type === 'success' ? 'btn-success' : type === 'error' ? 'btn-danger' : 'btn-primary'}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

