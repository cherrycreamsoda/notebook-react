"use client";

import React, { useEffect, useRef } from "react";
import { Type } from "lucide-react";
import BaseEditor from "./BaseEditor";

/**
 * PlainTextEditor - Simple textarea editor
 * Extends BaseEditor with plain text specific functionality
 */
const PlainTextEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  const plainTextRef = useRef(null);

  // Set up global focus handler for title Enter key
  useEffect(() => {
    window.editorFocusHandler = () => {
      if (plainTextRef.current) {
        plainTextRef.current.focus();
      }
    };
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  // Initialize content
  useEffect(() => {
    if (selectedNote && plainTextRef.current) {
      plainTextRef.current.value = selectedNote.content || "";
      updateCounts(selectedNote.content || "");
    }
  }, [selectedNote, updateCounts]);

  const handleContentChange = (e) => {
    if (!plainTextRef.current) return;
    const textContent = plainTextRef.current.value;
    updateCounts(textContent);
    onContentChange(textContent);
  };

  const editorModeIndicator = (
    <div className="editor-mode-indicator">
      <Type size={14} />
      <span>Plain Text Mode</span>
    </div>
  );

  return (
    <textarea
      ref={plainTextRef}
      onChange={handleContentChange}
      className="note-content-textarea"
      placeholder="Start writing your note..."
    />
  );
};

const PlainTextEditor = (props) => {
  const editorModeIndicator = (
    <div className="editor-mode-indicator">
      <Type size={14} />
      <span>Plain Text Mode</span>
    </div>
  );

  return (
    <BaseEditor
      {...props}
      editorSpecificToolbar={editorModeIndicator}
      showTitle={true}
      showToolbar={true}
      showStatusBar={true}
      editorClassName=""
    >
      <PlainTextEditorContent />
    </BaseEditor>
  );
};

export default PlainTextEditor;
