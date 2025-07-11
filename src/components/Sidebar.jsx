import React from "react";

import { useTheme } from "../contexts/ThemeContext";
import {
  Sun,
  Moon,
  Plus,
  Search,
  FileText,
  Pin,
  Trash2,
  FileX2,
} from "lucide-react";
import "../styles/Sidebar.css";

const Sidebar = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onTogglePin,
  searchTerm,
  onSearchChange,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const formatDate = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffTime = Math.abs(now - noteDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return noteDate.toLocaleDateString();
  };

  const getPreview = (content) => {
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Notes.</h1>
        <div className="sidebar-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="icon-button"
            onClick={onCreateNote}
            title="Create new note"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="search-container">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="notes-section">
        <div className="section-header">
          <span className="section-title">Notes</span>
          <span className="notes-count">{notes.length} notes</span>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <FileX2 size={48} className="empty-icon" />
              <p className="empty-text">No notes found</p>
              <button className="create-first-note-btn" onClick={onCreateNote}>
                Create your first note
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`note-item ${
                  selectedNote?.id === note.id ? "selected" : ""
                }`}
                onClick={() => onSelectNote(note)}
              >
                <div className="note-content">
                  <h3 className="note-title">{note.title || "Untitled"}</h3>
                  <p className="note-preview">
                    {getPreview(note.content) || "No additional text"}
                  </p>
                  <span className="note-date">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
                <div className="note-actions">
                  <button
                    className={`note-action-btn ${
                      note.isPinned ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    title={note.isPinned ? "Unpin note" : "Pin note"}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    className="note-action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="footer-item">
          <Pin size={16} />
          <span>Pinned</span>
        </div>
        <div className="footer-item">
          <Trash2 size={16} />
          <span>Deleted</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
