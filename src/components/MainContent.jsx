import React from "react";
import { useState, useEffect, useRef } from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Pin,
  Trash2,
  Maximize,
  Minimize,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import "../styles/MainContent.css";

const MainContent = ({
  selectedNote,
  onUpdateNote,
  onCreateNote,
  sidebarCollapsed,
  onToggleSidebar,
  onTogglePin,
  onDeleteNote,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingPin, setIsTogglingPin] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const titleInputRef = useRef(null);
  const updateTimeoutRef = useRef(null);

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

  // Debounced update function - waits 500ms after user stops typing
  const debouncedUpdate = (field, value) => {
    if (!selectedNote) return;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set saving state
    setIsSaving(true);

    // Set new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await onUpdateNote(selectedNote._id, { [field]: value });
      } catch (error) {
        console.error("Error updating note:", error);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };

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

  const handleTogglePin = async () => {
    if (!selectedNote || isTogglingPin) return;

    setIsTogglingPin(true);
    try {
      await onTogglePin(selectedNote._id);
    } catch (error) {
      console.error("Error toggling pin:", error);
    } finally {
      setIsTogglingPin(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteNote(selectedNote._id);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedNote) {
    return (
      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${isFullscreen ? "fullscreen" : ""}`}
      >
        <div className="main-header">
          <div className="header-left-actions">
            <button
              className="sidebar-toggle-btn-main"
              onClick={onToggleSidebar}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={16} />
              ) : (
                <PanelLeftClose size={16} />
              )}
            </button>
            <button
              className="fullscreen-toggle-btn"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
        <div className="main-content-inner">
          <div className="empty-main">
            <h1 className="welcome-title">Welcome to your Notebook</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      <div className="main-header">
        <div className="header-left-actions">
          <button
            className="sidebar-toggle-btn-main"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
          <button
            className="fullscreen-toggle-btn"
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>

        {/* Note action buttons - only show when note is loaded */}
        <div className="note-header-actions">
          <button
            className={`note-header-btn pin-btn ${
              selectedNote.isPinned ? "active" : ""
            }`}
            onClick={handleTogglePin}
            title={selectedNote.isPinned ? "Unpin note" : "Pin note"}
            disabled={isTogglingPin}
          >
            {isTogglingPin ? (
              <LoadingSpinner size={14} inline={true} showMessage={false} />
            ) : (
              <Pin size={14} />
            )}
          </button>

          <button
            className="note-header-btn delete-btn"
            onClick={handleDelete}
            title="Delete note"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <LoadingSpinner size={14} inline={true} showMessage={false} />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
      <div className="main-content-inner">
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
      </div>
    </div>
  );
};

export default MainContent;
