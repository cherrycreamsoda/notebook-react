"use client";
import React, { useEffect } from "react";

import BaseEditor from "../BaseEditor";
import RichTextEditor from "../RichTextEditor";

const RichTextEditorWrapper = (props) => {
  useEffect(() => {
    window.editorFocusHandler = () => {
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
