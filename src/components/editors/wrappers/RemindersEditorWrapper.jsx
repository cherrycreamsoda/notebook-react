"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import RemindersEditor from "../RemindersEditor";

/**
 * RemindersEditorWrapper - Simplified without custom toolbar
 * Now uses the global EditorToolbar through BaseEditor
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
  return (
    <BaseEditor
      {...props}
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
