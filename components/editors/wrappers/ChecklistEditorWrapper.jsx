"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import ChecklistEditor from "../ChecklistEditor";

const ChecklistEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
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

  useEffect(() => {
    if (selectedNote) {
      updateCounts(selectedNote.content || { items: [] });
    }
  }, [selectedNote, updateCounts]);

  const handleContentChange = (newContent) => {
    updateCounts(newContent);
    onContentChange(newContent);
  };

  return (
    <ChecklistEditor
      content={selectedNote?.content}
      onContentChange={handleContentChange}
    />
  );
};

const ChecklistEditorWrapper = (props) => {
  return (
    <BaseEditor
      {...props}
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
