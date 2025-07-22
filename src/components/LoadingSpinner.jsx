import React from "react";

import { Loader2 } from "lucide-react";
import "../styles/LoadingSpinner.css";

const LoadingSpinner = ({
  message = "Loading...",
  size = 24,
  inline = false,
  showMessage = true,
}) => {
  if (inline) {
    return <Loader2 size={size} className="spinner-icon-inline" />;
  }

  return (
    <div className="loading-spinner">
      <Loader2 size={size} className="spinner-icon" />
      {showMessage && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
