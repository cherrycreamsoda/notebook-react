import React from "react";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import "../styles/ErrorMessage.css";

const ErrorMessage = ({ message, onDismiss, onRetry }) => {
  return (
    <div className="error-message">
      <div className="error-content">
        <AlertCircle size={20} className="error-icon" />
        <span className="error-text">{message}</span>
        <div className="error-actions">
          {onRetry && (
            <button className="error-retry-btn" onClick={onRetry} title="Retry">
              <RefreshCw size={16} />
            </button>
          )}
          {onDismiss && (
            <button
              className="error-dismiss-btn"
              onClick={onDismiss}
              title="Dismiss"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
