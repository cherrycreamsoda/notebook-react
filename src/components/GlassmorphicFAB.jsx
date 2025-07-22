import React from "react";
import { Plus, LayoutDashboard } from "lucide-react";
import "../styles/GlassmorphicFAB.css";

const GlassmorphicFAB = ({ onCreateNote, selectedNote, sidebarCollapsed }) => {
  const shouldShow = !selectedNote;

  const handleDashboardClick = () => {
    // Coming soon functionality - could show a toast or tooltip
    console.log("Dashboard feature coming soon!");
  };

  return (
    <div
      className={`glassmorphic-fab ${shouldShow ? "visible" : "hidden"} ${
        !sidebarCollapsed ? "sidebar-open" : ""
      }`}
    >
      <button
        className="fab-button fab-create"
        onClick={onCreateNote}
        title="Create new note"
      >
        <Plus size={24} />
      </button>
      <button
        className="fab-button fab-dashboard"
        onClick={handleDashboardClick}
        title="Dashboard (Coming Soon)"
      >
        <LayoutDashboard size={20} />
      </button>
    </div>
  );
};

export default GlassmorphicFAB;
