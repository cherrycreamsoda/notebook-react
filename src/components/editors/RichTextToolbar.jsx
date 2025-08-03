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
} from "lucide-react";
import { DEFAULT_BUTTON_STATES } from "../../constants/richTextEditorConstants";

/**
 * RichTextToolbar - Specialized toolbar for rich text formatting
 * Integrates with BaseEditor's toolbar system while providing rich text controls
 */
const RichTextToolbar = ({ selectedNote }) => {
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);

  // Update button states from global rich text formatting context
  useEffect(() => {
    const updateStates = () => {
      if (window.richTextFormatting) {
        setButtonStates(window.richTextFormatting.buttonStates);
      }
    };

    // Update states periodically for real-time feedback
    const interval = setInterval(updateStates, 100);
    return () => clearInterval(interval);
  }, []);

  // Get formatting functions from global context
  const getFormatting = () => window.richTextFormatting || {};

  const formatActions = [
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

  return (
    <>
      {formatActions.map((action, index) => (
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
};

export default RichTextToolbar;
