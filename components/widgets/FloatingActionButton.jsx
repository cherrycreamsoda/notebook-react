"use client";
import React, { useState, useRef, useEffect } from "react";

import "../../styles/FloatingActionButton.css";
import {
  Plus,
  LayoutDashboard,
  FileText,
  Type,
  CheckSquare,
  Bell,
  Table,
} from "lucide-react";

const NOTE_TYPES = [
  {
    value: "RICH_TEXT",
    label: "Rich Text",
    icon: FileText,
    description: "Full formatting with rich text features",
  },
  {
    value: "TEXT",
    label: "Text",
    icon: Type,
    description: "Plain text without formatting",
  },
  {
    value: "CHECKLIST",
    label: "Checklist",
    icon: CheckSquare,
    description: "Task list with checkboxes",
  },
  {
    value: "REMINDERS",
    label: "Reminders",
    icon: Bell,
    description: "Time-based reminders",
  },
  {
    value: "DATASHEET",
    label: "Datasheet",
    icon: Table,
    description: "Structured data tables",
  },
];

const FloatingActionButton = ({
  onCreateNote,
  selectedNote,
  sidebarCollapsed,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef(null);
  const shouldShow = !selectedNote;

  const handleDashboardClick = () => {
    console.log("Dashboard feature coming soon!");
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsHolding(true);
    holdTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
      setIsHolding(false);
    }, 600); // 600ms hold time
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    setIsHolding(false);

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (!isExpanded) {
      onCreateNote();
    }
  };

  const handleMouseLeave = () => {
    setIsHolding(false);
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    handleMouseDown(e);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleMouseUp(e);
  };

  const handleTypeSelect = async (noteType) => {
    const noteData = {
      type: noteType.value,
      title: "New Note",
      content:
        noteType.value === "CHECKLIST"
          ? { items: [{ id: Date.now().toString(), text: "", checked: false }] }
          : noteType.value === "DATASHEET"
          ? {
              columns: [
                { id: "title", name: "Title", type: "text", width: "flex" },
                {
                  id: "amount",
                  name: "Amount",
                  type: "number",
                  width: "120px",
                },
                {
                  id: "datetime",
                  name: "Date & Time",
                  type: "datetime",
                  width: "200px",
                },
              ],
              rows: [
                {
                  id: Date.now().toString(),
                  cells: [
                    { columnId: "title", value: "" },
                    { columnId: "amount", value: "" },
                    { columnId: "datetime", value: "" },
                  ],
                },
              ],
            }
          : "",
    };

    await onCreateNote(noteData);

    setIsExpanded(false);
  };

  const handleClickOutside = (e) => {
    if (isExpanded && !e.target.closest(".glassmorphic-fab")) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isExpanded]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`glassmorphic-fab ${shouldShow ? "visible" : "hidden"} ${
        !sidebarCollapsed ? "sidebar-open" : ""
      } ${isExpanded ? "expanded" : ""}`}
    >
      {isExpanded && (
        <div className="fab-expanded-menu">
          {NOTE_TYPES.map((noteType, index) => (
            <button
              key={noteType.value}
              className="fab-type-button"
              onClick={() => handleTypeSelect(noteType)}
              title={`Create ${noteType.label}`}
              style={{ "--delay": `${index * 0.05}s` }}
            >
              <noteType.icon size={20} />
              <span className="fab-type-label">{noteType.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="fab-container">
        <button
          className={`fab-button fab-create ${isHolding ? "holding" : ""} ${
            isExpanded ? "expanded" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title={
            isExpanded ? "Close menu" : "Create new note (hold for options)"
          }
        >
          <Plus size={24} className={isExpanded ? "rotated" : ""} />
        </button>

        <button
          className="fab-button fab-dashboard"
          onClick={handleDashboardClick}
          title="Dashboard (Coming Soon)"
        >
          <LayoutDashboard size={20} />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
