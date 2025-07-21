import React from "react";
import {
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  ArrowLeft,
  RotateCcw,
  Trash,
  StickyNote,
  Github,
  PanelLeftClose,
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
  collapsed,
  onToggleCollapse,
  activeNotesCount,
  isFullscreen, // Add this prop
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingStates, setLoadingStates] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);
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
    const noteDate = new Date(date);
    const day = String(noteDate.getDate()).padStart(2, "0");
    const month = String(noteDate.getMonth() + 1).padStart(2, "0");
    const year = noteDate.getFullYear();

    let hours = noteDate.getHours();
    const minutes = String(noteDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const formattedHours = String(hours).padStart(2, "0");

    return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
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

  const isDeletePermanentlyMode = currentView === "deleted" && deletedCount > 0;

  const handleDeletedClick = () => {
    if (isDeletePermanentlyMode) {
      setConfirmDialog({
        action: "clearAll",
        message: `Permanently delete all ${deletedCount} deleted notes?`,
        position: {
          top: window.innerHeight / 2 - 50,
          left: window.innerWidth / 2 - 150,
        },
      });
    } else {
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

  const handleGithubClick = () => {
    window.open("https://github.com/cherrycreamsoda", "_blank");
  };

  if (collapsed) {
    return (
      <div className="sidebar sidebar-collapsed">
        <div className="sidebar-toggle-collapsed">
          <button
            className="github-btn"
            onClick={handleGithubClick}
            title="Visit GitHub Profile"
          >
            <Github size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar sidebar-expanded" ref={sidebarRef} tabIndex={0}>
      <div className="sidebar-header">
        <div className="sidebar-brand"></div>
        <div className="sidebar-header-actions">
          <button
            className="header-action-btn"
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

          {/* Add close button only in fullscreen mode */}
          {isFullscreen && (
            <button
              className="header-action-btn sidebar-close-btn"
              onClick={onToggleCollapse}
              title="Close Sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-content">
        <div className="search-container">
          <div className="search-input-wrapper">
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
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">
            <button
              className={`nav-item ${currentView === "notes" ? "active" : ""}`}
              onClick={() => onViewChange("notes")}
            >
              <StickyNote size={16} />
              <span>All Notes</span>
              <span className="nav-count">{activeNotesCount}</span>
            </button>

            <button
              className={`nav-item ${currentView === "pinned" ? "active" : ""}`}
              onClick={handlePinnedClick}
            >
              <Pin size={16} />
              <span>Pinned</span>
              <span className="nav-count">{pinnedCount}</span>
            </button>

            <button
              className={`nav-item ${
                currentView === "deleted" ? "active" : ""
              } ${isDeletePermanentlyMode ? "delete-mode" : ""}`}
              onClick={handleDeletedClick}
              title={
                isDeletePermanentlyMode
                  ? "Delete all permanently"
                  : "View deleted notes"
              }
            >
              <Trash2 size={16} />
              <span>{isDeletePermanentlyMode ? "Delete All" : "Deleted"}</span>
              <span className="nav-count">{deletedCount}</span>
            </button>
          </div>
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
                  <ArrowLeft size={14} />
                </button>
              )}
              <h3 className="section-title">{getSectionTitle()}</h3>
            </div>
            <span className="section-count">{notes.length}</span>
          </div>

          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <StickyNote size={32} />
                </div>
                <p className="empty-text">
                  {currentView === "pinned"
                    ? "No pinned notes"
                    : currentView === "deleted"
                    ? "No deleted notes"
                    : searchTerm
                    ? "No notes found"
                    : "No notes yet"}
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
                  style={{ "--item-index": index }}
                  onClick={() => {
                    onSelectNote(note);
                    setSelectedIndex(index);
                  }}
                >
                  <div className="note-content">
                    <h4 className="note-title">{note.title || "Untitled"}</h4>
                    <p className="note-preview">
                      {getPreview(note.content) || "No additional text"}
                    </p>
                    <div className="note-meta">
                      <span className="note-date">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="note-actions">
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
                              size={12}
                              inline={true}
                              showMessage={false}
                            />
                          ) : (
                            <RotateCcw size={12} />
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
                              size={12}
                              inline={true}
                              showMessage={false}
                            />
                          ) : (
                            <Trash size={12} />
                          )}
                        </button>
                      </>
                    ) : (
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
                              size={12}
                              inline={true}
                              showMessage={false}
                            />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                        <button
                          className={`note-action-btn pin ${
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
                              size={12}
                              inline={true}
                              showMessage={false}
                            />
                          ) : (
                            <Pin size={12} />
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
