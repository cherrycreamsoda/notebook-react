"use client";
import React, { useState, useRef, useEffect } from "react";
import Portal from "./Portal"; // relative to widgets folder
import "../../styles/NoteTypeDropdown.css";
import {
  ChevronDown,
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

const NoteTypeDropdown = ({
  selectedType = "RICH_TEXT",
  onTypeChange = () => {},
  disabled = false,
  shouldBlink = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState(null);

  const selectedTypeData =
    NOTE_TYPES.find((t) => t.value === selectedType) || NOTE_TYPES[0];

  // blinking effect
  useEffect(() => {
    if (shouldBlink) {
      setIsBlinking(true);
      const t = setTimeout(() => setIsBlinking(false), 1000);
      return () => clearTimeout(t);
    }
  }, [shouldBlink]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setIsOpen(false);
    }
    document.addEventListener("pointerdown", onDocClick, true);
    return () => document.removeEventListener("pointerdown", onDocClick, true);
  }, []);

  // compute menu position
  useEffect(() => {
    function compute() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const left = Math.max(8, Math.min(r.left, window.innerWidth - 320));
      const top = r.bottom; // fixed positioning (viewport coords)
      setMenuStyle({
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        minWidth: "280px",
      });
    }
    if (isOpen) {
      compute();
      window.addEventListener("resize", compute);
      window.addEventListener("scroll", compute, true);
    }
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    if (e && e.preventDefault) e.preventDefault(); // stop blur
    if (!disabled) setIsOpen((s) => !s);
  };

  const handleTypeSelect = (type) => {
    if (type.value !== selectedType) onTypeChange(type.value);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className={`note-type-dropdown ${isBlinking ? "blinking" : ""}`}
        ref={triggerRef}
      >
        <button
          className={`dropdown-trigger ${isOpen ? "open" : ""} ${
            disabled ? "disabled" : ""
          }`}
          onClick={handleToggle}
          onMouseDown={(e) => e.preventDefault()}
          disabled={disabled}
          title={`Note Type: ${selectedTypeData.label}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <selectedTypeData.icon size={14} />
          <ChevronDown
            size={12}
            className={`chevron ${isOpen ? "rotated" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <Portal>
          <div
            ref={menuRef}
            className="dropdown-menu portal-dropdown-menu"
            style={{
              ...(menuStyle || {}),
              zIndex: 2147483647,
              pointerEvents: "auto",
            }}
            role="menu"
          >
            <div className="dropdown-header">
              <span>Note Type</span>
            </div>
            {NOTE_TYPES.map((type) => {
              const Icon = type.icon;
              const selected = type.value === selectedType;
              return (
                <button
                  key={type.value}
                  className={`dropdown-item ${selected ? "selected" : ""}`}
                  onMouseDown={(e) => e.preventDefault()} // keep open
                  onClick={() => handleTypeSelect(type)}
                  role="menuitem"
                >
                  <div className="item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="item-content">
                    <div className="item-label">{type.label}</div>
                    <div className="item-description">{type.description}</div>
                  </div>
                  {selected && (
                    <div className="selected-indicator">
                      <div className="selected-dot" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </>
  );
};

export default NoteTypeDropdown;
