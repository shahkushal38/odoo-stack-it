import React from 'react';
import './AIModalData.css';

const AIModalData = ({ isOpen, onClose, data }) => {
    console.log("AIModalData props:", { isOpen, onClose, data });
  if (!isOpen) return null;
  console.log("AIModalData props:", { isOpen, onClose, data });
  return (
    <div className="ai-modal__backdrop" onClick={onClose}>
      <div className="ai-modal" onClick={e => e.stopPropagation()}>
        <h3>AI Analysis</h3>

        <div className="ai-modal__row">
          <span className="ai-modal__label">Reason:</span>
          <span className="ai-modal__value">{data.reason}</span>
        </div>
        <div className="ai-modal__row">
          <span className="ai-modal__label">Relevant:</span>
          <span className="ai-modal__value">{data.relevant ? "Yes" : "No"}</span>
        </div>
        <button className="ai-modal__close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AIModalData;
