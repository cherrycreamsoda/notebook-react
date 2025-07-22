import React from "react";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Trash,
  Trash2,
  Pin,
  StickyNote,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmationDialog from "./ConfirmationDialog";
import { formatDate, getPreview } from "../utils/dateUtils";

const NoteList = ({
  notes,
  selectedNote,
  onSelectNote,
  currentView,
  onViewChange,
  onDeleteNote,
  onPermanentDelete,
  onRestoreNote,
  onTogglePin,
  onCreateNote,
  searchTerm,
  onSearchClear,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loadingStates, setLoadingStates] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Update selected index when notes or selectedNote changes
  useEffect(() => {
    if (selectedNote) {
      const index = notes.findIndex((note) => note._id === selectedNote._id);
      setSelectedIndex(index);
    } else {
      setSelectedIndex(-1);
    }
  }, [notes, selectedNote]);

  // Simplified keyboard navigation directly in component
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (confirmDialog) {
          setConfirmDialog(null);
          return;
        }
        if (searchTerm) {
          onSearchClear();
          return;
        }
      }

      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputFocused) {
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
    onSelectNote,
    confirmDialog,
    onSearchClear,
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

  const handleAction = async (actionFn, actionId) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [actionId]: true }));
      await actionFn();
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
    }
    setConfirmDialog(null);
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

  return (
    <div className="notes-section">
      <div className="section-header">
        <div className="section-title-container">
          {currentView !== "notes" && (
            <button
              className="back-button"
              onClick={() => onViewChange("notes")}
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
          <EmptyState
            currentView={currentView}
            searchTerm={searchTerm}
            onCreateNote={onCreateNote}
          />
        ) : (
          notes.map((note, index) => (
            <NoteItem
              key={note._id}
              note={note}
              index={index}
              isSelected={selectedNote?._id === note._id}
              isKeyboardSelected={index === selectedIndex}
              onSelect={() => {
                onSelectNote(note);
                setSelectedIndex(index);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                handleAction(
                  () => onDeleteNote(note._id),
                  `delete-${note._id}`
                );
              }}
              onRestore={(e) => {
                e.stopPropagation();
                handleAction(
                  () => onRestoreNote(note._id),
                  `restore-${note._id}`
                );
              }}
              onTogglePin={(e) => {
                e.stopPropagation();
                handleAction(() => onTogglePin(note._id), `pin-${note._id}`);
              }}
              onPermanentDelete={handlePermanentDelete}
              loadingStates={loadingStates}
            />
          ))
        )}
      </div>

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

const EmptyState = ({ currentView, searchTerm, onCreateNote }) => (
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
      <button className="create-first-note-btn" onClick={onCreateNote}>
        Create your first note
      </button>
    )}
  </div>
);

const NoteItem = ({
  note,
  index,
  isSelected,
  isKeyboardSelected,
  onSelect,
  onDelete,
  onRestore,
  onTogglePin,
  onPermanentDelete,
  loadingStates,
}) => (
  <div
    className={`note-item ${isSelected ? "selected" : ""} ${
      isKeyboardSelected ? "keyboard-selected" : ""
    }`}
    style={{ "--item-index": index }}
    onClick={onSelect}
  >
    <div className="note-content">
      <h4 className="note-title">{note.title || "Untitled"}</h4>
      <p className="note-preview">
        {getPreview(note.content) || "No additional text"}
      </p>
      <div className="note-meta">
        <span className="note-date">{formatDate(note.updatedAt)}</span>
      </div>
    </div>
    <div className="note-actions">
      {note.isDeleted ? (
        <>
          <button
            className="note-action-btn restore"
            onClick={onRestore}
            title="Restore note"
            disabled={loadingStates[`restore-${note._id}`]}
          >
            {loadingStates[`restore-${note._id}`] ? (
              <LoadingSpinner size={12} inline={true} showMessage={false} />
            ) : (
              <RotateCcw size={12} />
            )}
          </button>
          <button
            className="note-action-btn permanent-delete"
            onClick={(e) => onPermanentDelete(note._id, e)}
            title="Delete permanently"
            disabled={loadingStates[`permanent-${note._id}`]}
          >
            {loadingStates[`permanent-${note._id}`] ? (
              <LoadingSpinner size={12} inline={true} showMessage={false} />
            ) : (
              <Trash size={12} />
            )}
          </button>
        </>
      ) : (
        <>
          <button
            className="note-action-btn delete"
            onClick={onDelete}
            title="Delete note"
            disabled={loadingStates[`delete-${note._id}`]}
          >
            {loadingStates[`delete-${note._id}`] ? (
              <LoadingSpinner size={12} inline={true} showMessage={false} />
            ) : (
              <Trash2 size={12} />
            )}
          </button>
          <button
            className={`note-action-btn pin ${note.isPinned ? "active" : ""}`}
            onClick={onTogglePin}
            title={note.isPinned ? "Unpin note" : "Pin note"}
            disabled={loadingStates[`pin-${note._id}`]}
          >
            {loadingStates[`pin-${note._id}`] ? (
              <LoadingSpinner size={12} inline={true} showMessage={false} />
            ) : (
              <Pin size={12} />
            )}
          </button>
        </>
      )}
    </div>
  </div>
);

export default NoteList;
