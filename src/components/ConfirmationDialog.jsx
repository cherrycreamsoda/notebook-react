import React from "react";
import { Check, X } from "lucide-react";
import "../styles/ConfirmationDialog.css";

const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  position = { top: 0, left: 0 },
  confirmText = "Yes",
  cancelText = "No",
}) => {
  return (
    <div
      className="confirmation-dialog"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="confirmation-content">
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button className="confirmation-btn confirm" onClick={onConfirm}>
            <Check size={12} />
            {confirmText}
          </button>
          <button className="confirmation-btn cancel" onClick={onCancel}>
            <X size={12} />
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
