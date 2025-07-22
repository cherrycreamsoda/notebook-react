import React from "react";

import { StickyNote, Pin, Trash2 } from "lucide-react";

const NavigationMenu = ({
  currentView,
  onViewChange,
  counts,
  onDeleteAll,
  isDeleteMode,
}) => {
  return (
    <div className="sidebar-nav">
      <div className="nav-section">
        <button
          className={`nav-item ${currentView === "notes" ? "active" : ""}`}
          onClick={() => onViewChange("notes")}
        >
          <StickyNote size={16} />
          <span>All Notes</span>
          <span className="nav-count">{counts.active}</span>
        </button>

        <button
          className={`nav-item ${currentView === "pinned" ? "active" : ""}`}
          onClick={() => onViewChange("pinned")}
        >
          <Pin size={16} />
          <span>Pinned</span>
          <span className="nav-count">{counts.pinned}</span>
        </button>

        <button
          className={`nav-item ${currentView === "deleted" ? "active" : ""} ${
            isDeleteMode ? "delete-mode" : ""
          }`}
          onClick={isDeleteMode ? onDeleteAll : () => onViewChange("deleted")}
          title={isDeleteMode ? "Delete all permanently" : "View deleted notes"}
        >
          <Trash2 size={16} />
          <span>{isDeleteMode ? "Delete All" : "Deleted"}</span>
          <span className="nav-count">{counts.deleted}</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationMenu;
