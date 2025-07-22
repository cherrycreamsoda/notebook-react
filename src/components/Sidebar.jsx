import React from "react";
import { Plus, Github, PanelLeftClose } from "lucide-react";
import { useRef } from "react";
import "../styles/Sidebar.css";
import SearchBar from "./SearchBar";
import NavigationMenu from "./NavigationMenu";
import NoteList from "./NoteList";
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

  const handleCreateNote = () => {
    execute(onCreateNote, "Failed to create note");
  };

  const handleClearAllDeleted = () => {
    const isDeleteMode = currentView === "deleted" && counts.deleted > 0;
    if (isDeleteMode) {
      execute(onClearAllDeleted, "Failed to clear deleted notes");
    } else {
      onViewChange("deleted");
    }
  };

  const handleGithubClick = () => {
    window.open("https://github.com/cherrycreamsoda", "_blank");
  };

  const isDeletePermanentlyMode =
    currentView === "deleted" && counts.deleted > 0;

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
            onClick={handleCreateNote}
            title="Create new note"
            disabled={createLoading}
          >
            <Plus size={16} />
          </button>

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
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onClear={() => onSearchChange("")}
        />

        <NavigationMenu
          currentView={currentView}
          onViewChange={onViewChange}
          counts={counts}
          onDeleteAll={handleClearAllDeleted}
          isDeleteMode={isDeletePermanentlyMode}
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
          onCreateNote={handleCreateNote}
          searchTerm={searchTerm}
          onSearchClear={() => onSearchChange("")}
        />
      </div>
    </div>
  );
};

export default Sidebar;
