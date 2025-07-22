import React from "react";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";

const NoteEditor = ({ selectedNote, onUpdateNote }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setContent(selectedNote.content || "");

      // Auto-select title text for new notes
      if (selectedNote.title === "New Note" && titleInputRef.current) {
        setTimeout(() => {
          titleInputRef.current.select();
        }, 100);
      }
    }
  }, [selectedNote]);

  const handleUpdate = async (field, value) => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await onUpdateNote(selectedNote._id, { [field]: value });
    } finally {
      setIsSaving(false);
    }
  };

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    500
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedUpdate("title", newTitle);
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedUpdate("content", newContent);
  };

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="note-editor">
      <div className="note-header">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="note-title-input"
        />
        {isSaving && (
          <div className="saving-indicator">
            <div className="saving-dot"></div>
            <span>Saving...</span>
          </div>
        )}
      </div>
      <textarea
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing your note..."
        className="note-content-input"
      />
    </div>
  );
};

export default NoteEditor;
