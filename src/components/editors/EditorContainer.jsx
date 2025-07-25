"use client";
import React from "react";
import RichTextEditor from "./RichTextEditor";
import PlainTextEditor from "./PlainTextEditor";
import ChecklistEditorWrapper from "./ChecklistEditorWrapper";
import RemindersEditorWrapper from "./RemindersEditorWrapper";
import DatasheetEditorWrapper from "./DatasheetEditorWrapper";

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
      return <RichTextEditor {...commonProps} />;
  }
};

export default EditorContainer;
