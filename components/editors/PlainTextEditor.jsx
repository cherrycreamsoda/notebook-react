"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";

import BaseEditor from "./BaseEditor";

const PlainTextEditorContent = ({
  selectedNote,
  onContentChange,
  updateCounts,
}) => {
  const plainTextRef = useRef(null);
  const [lastNoteId, setLastNoteId] = useState(null);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      plainTextRef.current?.blur();

      const noteList = document.querySelector(".notes-list");
      if (noteList && typeof noteList.focus === "function") {
        noteList.focus();
      }
    }
  }, []);

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

  useEffect(() => {
    if (selectedNote && plainTextRef.current) {
      const noteId = selectedNote._id;
      const isNewNote = noteId !== lastNoteId;

      if (isNewNote) {
        setHasStartedTyping(false);
        setLastNoteId(noteId);

        plainTextRef.current.value = selectedNote.content || "";
        updateCounts(selectedNote.content || "");
      }
    } else {
      setHasStartedTyping(false);
      setLastNoteId(null);
    }
  }, [selectedNote, updateCounts, lastNoteId]);

  const handleContentChange = (e) => {
    if (!plainTextRef.current) return;
    if (!hasStartedTyping) setHasStartedTyping(true);

    const textContent = plainTextRef.current.value;
    updateCounts(textContent);
    onContentChange(textContent);
  };

  return (
    <textarea
      ref={plainTextRef}
      onChange={handleContentChange}
      onKeyDown={handleKeyDown}
      className="note-content-textarea"
      placeholder="Start writing your note..."
    />
  );
};

const PlainTextEditor = (props) => {
  return (
    <BaseEditor
      {...props}
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
