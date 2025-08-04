"use client";
import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Minus,
  FileText,
} from "lucide-react";

import NoteTypeDropdown from "./NoteTypeDropdown";
import { DEFAULT_BUTTON_STATES } from "../../constants/richTextEditorConstants";

/**
 * EditorToolbar - Global toolbar component for all editor types
 * Dynamically renders appropriate tools based on the current editor type
 * Consolidates all toolbar functionality in one place
 */
const EditorToolbar = ({
  noteType = "RICH_TEXT",
  selectedNote,
  onTypeChange,
  shouldBlinkDropdown = false,
}) => {
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);

  // Update button states for rich text editor
  useEffect(() => {
    if (noteType === "RICH_TEXT") {
      const updateStates = () => {
        if (window.richTextFormatting) {
          setButtonStates(window.richTextFormatting.buttonStates);
        }
      };

      // Update states periodically for real-time feedback
      const interval = setInterval(updateStates, 100);
      return () => clearInterval(interval);
    }
  }, [noteType]);

  // Get formatting functions from global rich text context
  const getFormatting = () => window.richTextFormatting || {};

  // Rich text formatting actions
  const richTextActions = [
    {
      icon: Bold,
      action: () => getFormatting().smartFormat?.("bold"),
      title: "Bold (Ctrl+B)",
      isActive: () => buttonStates.bold,
      type: "smart",
    },
    {
      icon: Italic,
      action: () => getFormatting().smartFormat?.("italic"),
      title: "Italic (Ctrl+I)",
      isActive: () => buttonStates.italic,
      type: "smart",
    },
    {
      icon: Underline,
      action: () => getFormatting().smartFormat?.("underline"),
      title: "Underline (Ctrl+U)",
      isActive: () => buttonStates.underline,
      type: "smart",
    },
    {
      icon: Minus,
      action: () => getFormatting().smartFormat?.("strikeThrough"),
      title: "Strikethrough",
      isActive: () => buttonStates.strikeThrough,
      type: "smart",
    },
    {
      icon: List,
      action: () => getFormatting().toggleList?.("insertUnorderedList"),
      title: "Bullet List",
      isActive: () => buttonStates.insertUnorderedList,
      type: "list",
    },
    {
      icon: ListOrdered,
      action: () => getFormatting().toggleList?.("insertOrderedList"),
      title: "Numbered List",
      isActive: () => buttonStates.insertOrderedList,
      type: "list",
    },
    {
      icon: Type,
      action: () => getFormatting().toggleHeading?.(),
      title: "Heading",
      isActive: () => buttonStates.heading,
      type: "toggle",
    },
  ];

  // Render editor-specific toolbar content
  const renderEditorSpecificTools = () => {
    switch (noteType) {
      case "RICH_TEXT":
        return (
          <>
            {richTextActions.map((action, index) => (
              <button
                key={index}
                className={`format-btn ${action.isActive() ? "active" : ""} ${
                  action.type
                }`}
                onClick={action.action}
                title={action.title}
                disabled={!selectedNote}
              >
                <action.icon size={14} />
              </button>
            ))}
          </>
        );

      case "TEXT":
        return (
          <div className="editor-mode-indicator">
            <Type size={14} />
            <span>Plain Text Mode</span>
          </div>
        );

      case "CHECKLIST":
        return (
          <div className="editor-mode-indicator">
            <span>Checklist Mode</span>
          </div>
        );

      case "REMINDERS":
        return (
          <div className="editor-mode-indicator">
            <span>Reminders Mode</span>
          </div>
        );

      case "DATASHEET":
        return (
          <div className="editor-mode-indicator">
            <span>Datasheet Mode</span>
          </div>
        );

      default:
        return (
          <div className="editor-mode-indicator">
            <FileText size={14} />
            <span>Editor Mode</span>
          </div>
        );
    }
  };

  return (
    <div className="formatting-toolbar">
      <NoteTypeDropdown
        selectedType={noteType}
        onTypeChange={onTypeChange}
        disabled={!selectedNote}
        shouldBlink={shouldBlinkDropdown}
      />
      <div className="toolbar-separator" />
      {renderEditorSpecificTools()}
    </div>
  );
};

export default EditorToolbar;
