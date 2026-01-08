import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h2 className="confirm-modal-title">{title}</h2>
          <button className="confirm-modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="confirm-modal-body">
          <p className="confirm-modal-message">{message}</p>
        </div>

        <div className="confirm-modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

