import React from "react";
import { useState, useEffect, useRef } from "react";
import { FileText, Plus } from "lucide-react";
import "../styles/MainContent.css";

const MainContent = ({ selectedNote, onUpdateNote, onCreateNote }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (selectedNote) {
      onUpdateNote(selectedNote.id, { title: newTitle });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (selectedNote) {
      onUpdateNote(selectedNote.id, { content: newContent });
    }
  };

  if (!selectedNote) {
    return (
      <div className="main-content">
        <div className="empty-main">
          <div className="empty-main-icon">
            <FileText size={64} />
          </div>
          <h2 className="empty-main-title">Select a note to start writing</h2>
          <p className="empty-main-subtitle">
            Choose a note from the sidebar or create a new one
          </p>
          <button className="create-new-note-btn" onClick={onCreateNote}>
            <Plus size={16} />
            Create New Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="note-editor">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="note-title-input"
        />
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
          className="note-content-input"
        />
      </div>
    </div>
  );
};

export default MainContent;
