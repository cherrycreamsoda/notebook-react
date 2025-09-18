"use client";
import React, { useEffect, useRef, useState } from "react";

import LoadingSpinner from "@components/common/LoadingSpinner";
import EditorContainer from "@components/editors/EditorContainer";

import { useAsyncAction } from "@hooks/useAsyncAction";

import "../../styles/MainContent.css";
import {
  PanelLeftOpen,
  PanelLeftClose,
  Pin,
  Trash2,
  Maximize,
  Minimize,
  X,
} from "lucide-react";

const MainContent = ({
  selectedNote,
  setSelectedNote,
  onUpdateNote,
  sidebarCollapsed,
  onToggleSidebar,
  onTogglePin,
  onDeleteNote,
  isFullscreen,
  onToggleFullscreen,
  headerBackgroundEnabled,
}) => {
  const { loading: pinLoading, execute: executePin } = useAsyncAction();
  const { loading: deleteLoading, execute: executeDelete } = useAsyncAction();
  const headerRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || !headerBackgroundEnabled) return;

    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.warn("Header background image failed to load");
    };
    img.src = "images/marble-header-bg.jpg";
  }, [headerBackgroundEnabled]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    if (!headerBackgroundEnabled) {
      if (imageLoaded) {
        setIsDisabling(true);
        setTimeout(() => {
          setIsDisabling(false);
          setImageLoaded(false);
        }, 800);
      }
    }
  }, [headerBackgroundEnabled, imageLoaded]);

  const handleTogglePin = () => {
    if (!selectedNote) return;
    executePin(() => onTogglePin(selectedNote._id), "Failed to toggle pin");
  };

  const handleCloseNote = () => {
    setSelectedNote(null);
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    executeDelete(
      () => onDeleteNote(selectedNote._id),
      "Failed to delete note"
    );
  };

  const getHeaderClasses = () => {
    let classes = "main-header";

    if (headerBackgroundEnabled) {
      classes += " background-enabled";
      if (imageLoaded) {
        classes += " image-loaded";
      }
    } else {
      classes += " background-disabled";
      if (isDisabling) {
        classes += " fading-out";
      }
    }

    return classes;
  };

  if (!selectedNote) {
    return (
      <div
        className={`main-content ${
          sidebarCollapsed ? "sidebar-collapsed" : ""
        } ${isFullscreen ? "fullscreen" : ""}`.trim()}
      >
        <MainHeader
          ref={headerRef}
          className={getHeaderClasses()}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={onToggleSidebar}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
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
      }`.trim()}
    >
      <MainHeader
        ref={headerRef}
        handleCloseNote={handleCloseNote}
        className={getHeaderClasses()}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={onToggleSidebar}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        selectedNote={selectedNote}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
        pinLoading={pinLoading}
        deleteLoading={deleteLoading}
      />

      <div className="main-content-inner">
        <EditorContainer
          selectedNote={selectedNote}
          onUpdateNote={onUpdateNote}
        />
      </div>
    </div>
  );
};

const MainHeader = React.forwardRef(
  (
    {
      className,
      sidebarCollapsed,
      onToggleSidebar,
      isFullscreen,
      onToggleFullscreen,
      handleCloseNote,
      selectedNote,
      onTogglePin,
      onDelete,
      pinLoading,
      deleteLoading,
    },
    ref
  ) => (
    <div className={className} ref={ref}>
      <div className="header-left-actions">
        <button
          className={`note-header-btn ${sidebarCollapsed ? "" : "active"}`}
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
          className={`note-header-btn ${isFullscreen ? "active" : ""}`}
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>

      {selectedNote && (
        <div className="note-header-actions">
          <button
            className={`note-header-btn pin-btn ${
              selectedNote.pinned ? "active" : ""
            }`}
            onClick={onTogglePin}
            title={selectedNote.pinned ? "Unpin note" : "Pin note"}
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

          <button
            className="note-header-btn"
            onClick={handleCloseNote}
            title="Close Note"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
);

export default MainContent;
