"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import RichTextEditor from "../RichTextEditor";
import RichTextToolbar from "../RichTextToolbar";

/**
 * RichTextEditorWrapper - Wraps RichTextEditor functionality with BaseEditor
 * Maintains all sophisticated rich text features while achieving consistency
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
      editorSpecificToolbar={
        <RichTextToolbar selectedNote={props.selectedNote} />
      }
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
