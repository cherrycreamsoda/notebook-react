"use client";
import React from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "@components/common/LoadingSpinner";

const RichTextEditorWrapper = dynamic(
  () => import("./wrappers/RichTextEditorWrapper"),
  { ssr: false, loading: () => <LoadingSpinner size={20} /> }
);
const ChecklistEditorWrapper = dynamic(
  () => import("./wrappers/ChecklistEditorWrapper"),
  { ssr: false, loading: () => <LoadingSpinner size={20} /> }
);
const RemindersEditorWrapper = dynamic(
  () => import("./wrappers/RemindersEditorWrapper"),
  { ssr: false, loading: () => <LoadingSpinner size={20} /> }
);
const DatasheetEditorWrapper = dynamic(
  () => import("./wrappers/DatasheetEditorWrapper"),
  { ssr: false, loading: () => <LoadingSpinner size={20} /> }
);
import PlainTextEditor from "./PlainTextEditor";

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

export default React.memo(EditorContainer);
