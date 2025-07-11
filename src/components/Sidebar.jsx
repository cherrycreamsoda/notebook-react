import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Sun,
  Moon,
  Plus,
  Search,
  Pin,
  Trash2,
  FileX2,
  X,
  ArrowLeft,
  RotateCcw,
  Trash,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  currentView,
  onViewChange,
  allNotes,
  onPermanentDelete,
  onRestoreNote,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // Update selected index when notes or selectedNote changes
  useEffect(() => {
    if (selectedNote) {
      const index = notes.findIndex((note) => note.id === selectedNote.id);
      setSelectedIndex(index);
    } else {
      setSelectedIndex(-1);
    }
  }, [notes, selectedNote]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle ESC key for search
      if (e.key === "Escape" && searchTerm) {
        onSearchChange("");
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
        return;
      }

      // Only handle arrow keys if sidebar is focused or no input is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputFocused && activeElement !== searchInputRef.current) {
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        if (notes.length === 0) return;

        let newIndex = selectedIndex;

        if (e.key === "ArrowUp") {
          newIndex = selectedIndex <= 0 ? notes.length - 1 : selectedIndex - 1;
        } else if (e.key === "ArrowDown") {
          newIndex = selectedIndex >= notes.length - 1 ? 0 : selectedIndex + 1;
        }

        setSelectedIndex(newIndex);
        onSelectNote(notes[newIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, notes, searchTerm, onSearchChange, onSelectNote]);

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

  const clearSearch = () => {
    onSearchChange("");
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const handleBackToNotes = () => {
    onViewChange("notes");
    onSearchChange(""); // Clear search when going back
  };

  const handlePinnedClick = () => {
    onViewChange("pinned");
    onSearchChange(""); // Clear search when switching views
  };

  const handleDeletedClick = () => {
    onViewChange("deleted");
    onSearchChange(""); // Clear search when switching views
  };

  const getSectionTitle = () => {
    switch (currentView) {
      case "pinned":
        return "Pinned Notes";
      case "deleted":
        return "Deleted Notes";
      default:
        return "Notes";
    }
  };

  const getPinnedCount = () => {
    return allNotes.filter((note) => !note.isDeleted && note.isPinned).length;
  };

  const getDeletedCount = () => {
    return allNotes.filter((note) => note.isDeleted).length;
  };

  return (
    <div className="sidebar" ref={sidebarRef} tabIndex={0}>
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
          ref={searchInputRef}
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={clearSearch}
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="notes-section">
        <div className="section-header">
          <div className="section-title-container">
            {currentView !== "notes" && (
              <button
                className="back-button"
                onClick={handleBackToNotes}
                title="Back to notes"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <span className="section-title">{getSectionTitle()}</span>
          </div>
          <span className="notes-count">{notes.length} notes</span>
        </div>

        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <FileX2 size={48} className="empty-icon" />
              <p className="empty-text">
                {currentView === "pinned"
                  ? "No pinned notes"
                  : currentView === "deleted"
                  ? "No deleted notes"
                  : searchTerm
                  ? "No notes found"
                  : "No notes found"}
              </p>
              {currentView === "notes" && !searchTerm && (
                <button
                  className="create-first-note-btn"
                  onClick={onCreateNote}
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            notes.map((note, index) => (
              <div
                key={note.id}
                className={`note-item ${
                  selectedNote?.id === note.id ? "selected" : ""
                } ${index === selectedIndex ? "keyboard-selected" : ""}`}
                onClick={() => {
                  onSelectNote(note);
                  setSelectedIndex(index);
                }}
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
                  {/* For deleted notes - show restore and permanent delete */}
                  {note.isDeleted ? (
                    <>
                      <button
                        className="note-action-btn restore"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestoreNote(note.id);
                        }}
                        title="Restore note"
                      >
                        <RotateCcw size={14} />
                      </button>
                      <button
                        className="note-action-btn permanent-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              "Are you sure you want to permanently delete this note? This action cannot be undone."
                            )
                          ) {
                            onPermanentDelete(note.id);
                          }
                        }}
                        title="Delete permanently"
                      >
                        <Trash size={14} />
                      </button>
                    </>
                  ) : (
                    /* For active notes - show delete and pin (pin always visible when active) */
                    <>
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
                      <button
                        className={`note-action-btn pin-btn ${
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
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-footer">
        <div
          className={`footer-item ${currentView === "pinned" ? "active" : ""}`}
          onClick={handlePinnedClick}
        >
          <Pin size={16} />
          <span>Pinned</span>
          <span className="footer-count">({getPinnedCount()})</span>
        </div>
        <div
          className={`footer-item ${currentView === "deleted" ? "active" : ""}`}
          onClick={handleDeletedClick}
        >
          <Trash2 size={16} />
          <span>Deleted</span>
          <span className="footer-count">({getDeletedCount()})</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
