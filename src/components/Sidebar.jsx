"use client";

import { Plus, Github, PanelLeftClose } from "lucide-react";
import React, { useRef, useState } from "react";
import "../styles/Sidebar.css";
import SearchBar from "./SearchBar";
import NavigationMenu from "./NavigationMenu";
import NoteList from "./NoteList";
import ConfirmationDialog from "./ConfirmationDialog";
import { useAsyncAction } from "../hooks/useAsyncAction";

const Sidebar = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onPermanentDelete,
  onRestoreNote,
  onTogglePin,
  onClearAllDeleted,
  searchTerm,
  onSearchChange,
  currentView,
  onViewChange,
  counts,
  collapsed,
  onToggleCollapse,
  isFullscreen,
}) => {
  const sidebarRef = useRef(null);
  const { loading: createLoading, execute } = useAsyncAction();
  const [deleteAllConfirmation, setDeleteAllConfirmation] = useState(null);

  const handleCreateNote = async () => {
    try {
      await execute(async () => {
        await onCreateNote({
          type: "TEXT",
          title: "New Note",
          content: "",
        });
      }, "Failed to create note");
    } catch (error) {
      console.error("Create note error:", error);
    }
  };

  const handleDeleteAllClick = () => {
    if (currentView === "deleted" && counts.deleted > 0) {
      setDeleteAllConfirmation({
        message: `Permanently delete all ${counts.deleted} deleted notes? This action cannot be undone.`,
        title: "Delete All Notes?",
        type: "danger",
      });
    } else {
      onViewChange("deleted");
    }
  };

  const confirmDeleteAll = async () => {
    try {
      await execute(onClearAllDeleted, "Failed to clear deleted notes");
      setDeleteAllConfirmation(null);
    } catch (error) {
      setDeleteAllConfirmation(null);
    }
  };

  const cancelDeleteAll = () => {
    setDeleteAllConfirmation(null);
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
    <>
      <div className="sidebar sidebar-expanded" ref={sidebarRef} tabIndex={0}>
        <div className="sidebar-header">
          <div className="sidebar-brand"></div>
          <div className="sidebar-header-actions">
            <button
              className="header-action-btn"
              onClick={() => handleCreateNote()}
              title="Create new note"
              disabled={createLoading}
            >
              <Plus size={16} />
            </button>

            {(isFullscreen || window.innerWidth <= 768) && (
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
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onClear={() => onSearchChange("")}
          />

          <NavigationMenu
            currentView={currentView}
            onViewChange={onViewChange}
            counts={counts}
            onDeleteAll={handleDeleteAllClick}
            isDeleteMode={currentView === "deleted" && counts.deleted > 0}
          />

          <NoteList
            notes={notes}
            selectedNote={selectedNote}
            onSelectNote={onSelectNote}
            currentView={currentView}
            onViewChange={onViewChange}
            onDeleteNote={onDeleteNote}
            onPermanentDelete={onPermanentDelete}
            onRestoreNote={onRestoreNote}
            onTogglePin={onTogglePin}
            onCreateNote={() =>
              onCreateNote({
                type: "TEXT",
                title: "New Note",
                content: "",
              })
            }
            searchTerm={searchTerm}
            onSearchClear={() => onSearchChange("")}
          />
        </div>
      </div>

      {deleteAllConfirmation && (
        <ConfirmationDialog
          title={deleteAllConfirmation.title}
          message={deleteAllConfirmation.message}
          onConfirm={confirmDeleteAll}
          onCancel={cancelDeleteAll}
          position={{
            top: window.innerHeight / 2 - 100,
            left: window.innerWidth / 2 - 200,
          }}
          confirmText="Delete All"
          cancelText="Cancel"
          type={deleteAllConfirmation.type}
        />
      )}
    </>
  );
};

export default Sidebar;
