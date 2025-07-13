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
import LoadingSpinner from "./LoadingSpinner";
import ConfirmationDialog from "./ConfirmationDialog";
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
  onPermanentDelete,
  onRestoreNote,
  onClearAllDeleted,
  pinnedCount,
  deletedCount,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingStates, setLoadingStates] = useState({}); // Track loading for individual actions
  const [confirmDialog, setConfirmDialog] = useState(null); // For confirmation dialogs
  const searchInputRef = useRef(null);
  const sidebarRef = useRef(null);

  // Update selected index when notes or selectedNote changes
  useEffect(() => {
    if (selectedNote) {
      const index = notes.findIndex((note) => note._id === selectedNote._id);
      setSelectedIndex(index);
    } else {
      setSelectedIndex(-1);
    }
  }, [notes, selectedNote]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle ESC key for search and confirmation dialog
      if (e.key === "Escape") {
        if (confirmDialog) {
          setConfirmDialog(null);
          return;
        }
        if (searchTerm) {
          onSearchChange("");
          if (searchInputRef.current) {
            searchInputRef.current.blur();
          }
          return;
        }
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
  }, [
    selectedIndex,
    notes,
    searchTerm,
    onSearchChange,
    onSelectNote,
    confirmDialog,
  ]);

  // Close confirmation dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (confirmDialog && !e.target.closest(".confirmation-dialog")) {
        setConfirmDialog(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmDialog]);

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
  };

  const handlePinnedClick = () => {
    onViewChange("pinned");
  };

  // Check if we should show delete permanently mode
  const isDeletePermanentlyMode = currentView === "deleted" && deletedCount > 0;

  const handleDeletedClick = () => {
    if (isDeletePermanentlyMode) {
      // Show confirmation for delete all
      setConfirmDialog({
        action: "clearAll",
        message: `Permanently delete all ${deletedCount} deleted notes?`,
        position: {
          top: window.innerHeight / 2 - 50,
          left: window.innerWidth / 2 - 150,
        },
      });
    } else {
      // Just switch to deleted view
      onViewChange("deleted");
    }
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

  // Helper function to handle actions with loading states
  const handleAction = async (actionFn, actionId) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [actionId]: true }));
      await actionFn();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  // Handle permanent delete with confirmation
  const handlePermanentDelete = (noteId, event) => {
    const rect = event.target.getBoundingClientRect();
    setConfirmDialog({
      noteId,
      message: "Permanently delete this note?",
      position: {
        top: rect.top - 80,
        left: rect.left - 150,
      },
    });
  };

  const confirmPermanentDelete = async () => {
    if (confirmDialog.noteId) {
      await handleAction(
        () => onPermanentDelete(confirmDialog.noteId),
        `permanent-${confirmDialog.noteId}`
      );
    } else if (confirmDialog.action === "clearAll") {
      await handleAction(onClearAllDeleted, "clearAll");
    }
    setConfirmDialog(null);
  };

  console.log(
    "Sidebar render - currentView:",
    currentView,
    "deletedCount:",
    deletedCount,
    "isDeletePermanentlyMode:",
    isDeletePermanentlyMode
  );

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
            onClick={() => handleAction(onCreateNote, "create")}
            title="Create new note"
            disabled={loadingStates.create}
          >
            {loadingStates.create ? (
              <LoadingSpinner size={16} inline={true} showMessage={false} />
            ) : (
              <Plus size={16} />
            )}
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
          <div className="section-actions">
            <span className="notes-count">{notes.length} notes</span>
          </div>
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
                key={note._id}
                className={`note-item ${
                  selectedNote?._id === note._id ? "selected" : ""
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
                          handleAction(
                            () => onRestoreNote(note._id),
                            `restore-${note._id}`
                          );
                        }}
                        title="Restore note"
                        disabled={loadingStates[`restore-${note._id}`]}
                      >
                        {loadingStates[`restore-${note._id}`] ? (
                          <LoadingSpinner
                            size={14}
                            inline={true}
                            showMessage={false}
                          />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                      </button>
                      <button
                        className="note-action-btn permanent-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePermanentDelete(note._id, e);
                        }}
                        title="Delete permanently"
                        disabled={loadingStates[`permanent-${note._id}`]}
                      >
                        {loadingStates[`permanent-${note._id}`] ? (
                          <LoadingSpinner
                            size={14}
                            inline={true}
                            showMessage={false}
                          />
                        ) : (
                          <Trash size={14} />
                        )}
                      </button>
                    </>
                  ) : (
                    /* For active notes - show delete and pin */
                    <>
                      <button
                        className="note-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(
                            () => onDeleteNote(note._id),
                            `delete-${note._id}`
                          );
                        }}
                        title="Delete note"
                        disabled={loadingStates[`delete-${note._id}`]}
                      >
                        {loadingStates[`delete-${note._id}`] ? (
                          <LoadingSpinner
                            size={14}
                            inline={true}
                            showMessage={false}
                          />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                      <button
                        className={`note-action-btn pin-btn ${
                          note.isPinned ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(
                            () => onTogglePin(note._id),
                            `pin-${note._id}`
                          );
                        }}
                        title={note.isPinned ? "Unpin note" : "Pin note"}
                        disabled={loadingStates[`pin-${note._id}`]}
                      >
                        {loadingStates[`pin-${note._id}`] ? (
                          <LoadingSpinner
                            size={14}
                            inline={true}
                            showMessage={false}
                          />
                        ) : (
                          <Pin size={14} />
                        )}
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
          <span className="footer-count">({pinnedCount})</span>
        </div>
        <div
          className={`footer-item ${
            currentView === "deleted" ? "active" : ""
          } ${isDeletePermanentlyMode ? "delete-all-mode" : ""}`}
          onClick={handleDeletedClick}
          title={
            isDeletePermanentlyMode
              ? "Delete all permanently"
              : "View deleted notes"
          }
        >
          <Trash2 size={16} />
          <span>
            {isDeletePermanentlyMode ? "Delete Permanently" : "Deleted"}
          </span>
          <span className="footer-count">({deletedCount})</span>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmationDialog
          message={confirmDialog.message}
          position={confirmDialog.position}
          onConfirm={confirmPermanentDelete}
          onCancel={() => setConfirmDialog(null)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default Sidebar;
