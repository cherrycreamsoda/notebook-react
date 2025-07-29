"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import ChecklistEditor from "../ChecklistEditor";

/**
 * ChecklistEditorWrapper - Wraps existing ChecklistEditor with BaseEditor
 * Maintains all existing ChecklistEditor functionality
 */
const ChecklistEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  // Set up global focus handler for title Enter key
  useEffect(() => {
    window.editorFocusHandler = () => {
      const firstInput = document.querySelector(
        ".checklist-editor .item-input"
      );
      if (firstInput) {
        firstInput.focus();
      }
    };
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  // Initialize counts
  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { items: [] });
    }
  }, [selectedNote, updateCounts]);

  const handleContentChange = (newContent) => {
    updateCounts(newContent);
    onContentChange(newContent);
  };

  const editorModeIndicator = (
    <div className="editor-mode-indicator">
      <span>Checklist Mode</span>
    </div>
  );

  return (
    <ChecklistEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const ChecklistEditorWrapper = (props) => {
  const editorModeIndicator = (
    <div className="editor-mode-indicator">
      <span>Checklist Mode</span>
    </div>
  );

  return (
    <BaseEditor
      {...props}
      editorSpecificToolbar={editorModeIndicator}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="checklist-mode"
    >
      <ChecklistEditorContent />
    </BaseEditor>
  );
};

export default ChecklistEditorWrapper;
