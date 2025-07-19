import React from "react";
import { useState, useEffect, useRef } from "react";
import { FileText, Plus, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import "../styles/MainContent.css";

const MainContent = ({
  selectedNote,
  onUpdateNote,
  onCreateNote,
  sidebarCollapsed,
  onToggleSidebar,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
        }`}
      >
        <div className="main-header">
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
        </div>
        <div className="main-content-inner">
          <div className="empty-main">
            <div className="empty-main-icon">
              <FileText size={64} />
            </div>
            <h2 className="empty-main-title">What can I help you write?</h2>
            <p className="empty-main-subtitle">
              Select a note from the sidebar or create a new one to get started
            </p>
            <button className="create-new-note-btn" onClick={onCreateNote}>
              <Plus size={16} />
              Create New Note
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`main-content ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      <div className="main-header">
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
