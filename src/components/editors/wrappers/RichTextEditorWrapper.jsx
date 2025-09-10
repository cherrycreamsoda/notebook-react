"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import RichTextEditor from "../RichTextEditor";

/**
 * RichTextEditorWrapper - Simplified without custom toolbar
 * Now uses the global EditorToolbar through BaseEditor
 */
const RichTextEditorWrapper = (props) => {
  // Set up global focus handler for title Enter key
  useEffect(() => {
    window.editorFocusHandler = () => {
      // Focus the rich text content area
      const contentDiv = document.querySelector(
        '.note-content-input[contenteditable="true"]'
      );
      if (contentDiv) {
        contentDiv.focus();
      }
    };
    return () => {
      window.editorFocusHandler = null;
    };
  }, []);

  return (
    <BaseEditor
      {...props}
      showTitle={true}
      showToolbar={true}
      showStatusBar={true}
      editorClassName="rich-text-mode"
    >
      <RichTextEditor />
    </BaseEditor>
  );
};

export default RichTextEditorWrapper;
