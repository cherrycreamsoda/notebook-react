"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import DatasheetEditor from "../DatasheetEditor";

/**
 * DatasheetEditorWrapper - Simplified without custom toolbar
 * Now uses the global EditorToolbar through BaseEditor
 */
const DatasheetEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  // Set up global focus handler for title Enter key
  useEffect(() => {
    window.editorFocusHandler = () => {
      // DatasheetEditor handles auto-focus internally
      // Just blur the title to let the datasheet take focus
    };
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  // Initialize counts
  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { columns: [], rows: [] });
    }
  }, [selectedNote, updateCounts]);

  const handleContentChange = (newContent) => {
    updateCounts(newContent);
    onContentChange(newContent);
  };

  return (
    <DatasheetEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const DatasheetEditorWrapper = (props) => {
  return (
    <BaseEditor
      {...props}
      showTitle={false}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="datasheet-mode"
    >
      <DatasheetEditorContent />
    </BaseEditor>
  );
};

export default DatasheetEditorWrapper;
