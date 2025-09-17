"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import DatasheetEditor from "../DatasheetEditor";

const DatasheetEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  useEffect(() => {
    window.editorFocusHandler = () => {};
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

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
