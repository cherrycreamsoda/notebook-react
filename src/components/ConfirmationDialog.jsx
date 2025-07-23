"use client";
import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import "../styles/ConfirmationDialog.css";

const ConfirmationDialog = ({
  message,
  onConfirm,
  onCancel,
  position = { top: 0, left: 0 },
  confirmText = "Yes",
  cancelText = "No",
  type = "default", // 'default', 'warning', 'danger'
  title = null,
}) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
      case "danger":
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`confirmation-dialog ${type}`}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="confirmation-content">
        {title && (
          <div className="confirmation-title">
            {getIcon()}
            <span>{title}</span>
          </div>
        )}
        <p className="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button
            className={`confirmation-btn confirm ${type}`}
            onClick={onConfirm}
          >
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
