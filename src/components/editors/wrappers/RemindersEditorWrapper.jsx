"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import RemindersEditor from "../RemindersEditor";

/**
 * RemindersEditorWrapper - Wraps existing RemindersEditor with BaseEditor
 * Maintains all existing RemindersEditor functionality
 */
const RemindersEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  // Set up global focus handler for title Enter key
  useEffect(() => {
    window.editorFocusHandler = () => {
      const firstInput = document.querySelector(
        ".reminders-editor .reminder-input"
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
      updateCounts(selectedNote.content || { reminders: [] });
    }
  }, [selectedNote, updateCounts]);

  const handleContentChange = (newContent) => {
    updateCounts(newContent);
    onContentChange(newContent);
  };

  return (
    <RemindersEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const RemindersEditorWrapper = (props) => {
  const editorModeIndicator = (
    <div className="editor-mode-indicator">
      <span>Reminders Mode</span>
    </div>
  );

  return (
    <BaseEditor
      {...props}
      editorSpecificToolbar={editorModeIndicator}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="reminders-mode"
    >
      <RemindersEditorContent />
    </BaseEditor>
  );
};

export default RemindersEditorWrapper;
