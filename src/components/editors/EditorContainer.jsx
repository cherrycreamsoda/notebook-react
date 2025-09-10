"use client";
import React from "react";

import RichTextEditorWrapper from "./wrappers/RichTextEditorWrapper";
import PlainTextEditor from "./PlainTextEditor";
import ChecklistEditorWrapper from "./wrappers/ChecklistEditorWrapper";
import RemindersEditorWrapper from "./wrappers/RemindersEditorWrapper";
import DatasheetEditorWrapper from "./wrappers/DatasheetEditorWrapper";

/**
 * EditorContainer - Main editor switcher component
 * Determines which editor to render based on note type
 * Replaces the old monolithic NoteEditor component
 */
const EditorContainer = ({ selectedNote, onUpdateNote }) => {
  if (!selectedNote) {
    return null;
  }

  const noteType = selectedNote.type || "RICH_TEXT";
  const commonProps = {
    selectedNote,
    onUpdateNote,
  };

  switch (noteType) {
    case "TEXT":
      return <PlainTextEditor {...commonProps} />;

    case "CHECKLIST":
      return <ChecklistEditorWrapper {...commonProps} />;

    case "REMINDERS":
      return <RemindersEditorWrapper {...commonProps} />;

    case "DATASHEET":
      return <DatasheetEditorWrapper {...commonProps} />;

    case "RICH_TEXT":
    default:
      return <RichTextEditorWrapper {...commonProps} />;
  }
};

export default EditorContainer;
