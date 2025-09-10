"use client";
import React, { useState, useRef, useEffect } from "react";

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
  onTypeChange,
  disabled = false,
  shouldBlink = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const dropdownRef = useRef(null);

  const selectedTypeData =
    NOTE_TYPES.find((type) => type.value === selectedType) || NOTE_TYPES[0];

  // Handle blinking effect
  useEffect(() => {
    if (shouldBlink) {
      setIsBlinking(true);
      const timer = setTimeout(() => {
        setIsBlinking(false);
      }, 1000); // Blink for 1 second
      return () => clearTimeout(timer);
    }
  }, [shouldBlink]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeSelect = (type) => {
    if (type.value !== selectedType) {
      onTypeChange(type.value);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`note-type-dropdown ${isBlinking ? "blinking" : ""}`}
      ref={dropdownRef}
    >
      <button
        className={`dropdown-trigger ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={handleToggle}
        disabled={disabled}
        title={`Note Type: ${selectedTypeData.label}`}
      >
        <selectedTypeData.icon size={14} />
        <ChevronDown
          size={12}
          className={`chevron ${isOpen ? "rotated" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <span>Note Type</span>
          </div>
          {NOTE_TYPES.map((type) => (
            <button
              key={type.value}
              className={`dropdown-item ${
                type.value === selectedType ? "selected" : ""
              }`}
              onClick={() => handleTypeSelect(type)}
            >
              <div className="item-icon">
                <type.icon size={16} />
              </div>
              <div className="item-content">
                <div className="item-label">{type.label}</div>
                <div className="item-description">{type.description}</div>
              </div>
              {type.value === selectedType && (
                <div className="selected-indicator">
                  <div className="selected-dot"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteTypeDropdown;
