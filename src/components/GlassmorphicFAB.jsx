import React from "react";
import { Plus, LayoutDashboard } from "lucide-react";
import "../styles/GlassmorphicFAB.css";

const GlassmorphicFAB = ({ onCreateNote }) => {
  return (
    <div className="glassmorphic-fab">
      <button
        className="fab-button fab-create"
        onClick={onCreateNote}
        title="Create new note"
      >
        <Plus size={24} />
      </button>
      <button
        className="fab-button fab-dashboard"
        title="Dashboard (Coming Soon)"
      >
        <LayoutDashboard size={20} />
      </button>
    </div>
  );
};

export default GlassmorphicFAB;
