import React from "react";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Pin,
  Trash2,
  Maximize,
  Minimize,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import NoteEditor from "./NoteEditor";
import { useAsyncAction } from "../hooks/useAsyncAction";
import "../styles/MainContent.css";

const MainContent = ({
  selectedNote,
  onUpdateNote,
  sidebarCollapsed,
  onToggleSidebar,
  onTogglePin,
  onDeleteNote,
  isFullscreen,
  onToggleFullscreen,
  isTransitioningFullscreen,
}) => {
  const { loading: pinLoading, execute: executePin } = useAsyncAction();
  const { loading: deleteLoading, execute: executeDelete } = useAsyncAction();

  const handleTogglePin = () => {
    if (!selectedNote) return;
    executePin(() => onTogglePin(selectedNote._id), "Failed to toggle pin");
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    executeDelete(
      () => onDeleteNote(selectedNote._id),
      "Failed to delete note"
    );
  };

  if (!selectedNote) {
    return (
      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${isFullscreen ? "fullscreen" : ""}`}
      >
        <MainHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          isTransitioningFullscreen={isTransitioningFullscreen}
        />
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
      <MainHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        isTransitioningFullscreen={isTransitioningFullscreen}
        selectedNote={selectedNote}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
        pinLoading={pinLoading}
        deleteLoading={deleteLoading}
      />
      <div className="main-content-inner">
        <NoteEditor selectedNote={selectedNote} onUpdateNote={onUpdateNote} />
      </div>
    </div>
  );
};

const MainHeader = ({
  sidebarCollapsed,
  onToggleSidebar,
  isFullscreen,
  onToggleFullscreen,
  isTransitioningFullscreen,
  selectedNote,
  onTogglePin,
  onDelete,
  pinLoading,
  deleteLoading,
}) => (
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
        disabled={isTransitioningFullscreen}
      >
        {isTransitioningFullscreen ? (
          <LoadingSpinner size={16} inline={true} showMessage={false} />
        ) : isFullscreen ? (
          <Minimize size={16} />
        ) : (
          <Maximize size={16} />
        )}
      </button>
    </div>

    {selectedNote && (
      <div className="note-header-actions">
        <button
          className={`note-header-btn pin-btn ${
            selectedNote.isPinned ? "active" : ""
          }`}
          onClick={onTogglePin}
          title={selectedNote.isPinned ? "Unpin note" : "Pin note"}
          disabled={pinLoading}
        >
          {pinLoading ? (
            <LoadingSpinner size={14} inline={true} showMessage={false} />
          ) : (
            <Pin size={14} />
          )}
        </button>

        <button
          className="note-header-btn delete-btn"
          onClick={onDelete}
          title="Delete note"
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <LoadingSpinner size={14} inline={true} showMessage={false} />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
    )}
  </div>
);

export default MainContent;
