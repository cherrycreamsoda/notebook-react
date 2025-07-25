"use client";

import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import GlassmorphicFAB from "./components/GlassmorphicFAB";
import { checkBackendHealth } from "./services/api";
import { useNotes } from "./hooks/useNotes";
import "./styles/App.css";

function AppContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("notes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isTransitioningFullscreen, setIsTransitioningFullscreen] =
    useState(false);
  const [headerBackgroundEnabled, setHeaderBackgroundEnabled] = useState(true);

  const {
    notes,
    selectedNote,
    setSelectedNote,
    counts,
    loading,
    error,
    createError,
    clearError,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    togglePin,
    clearAllDeleted,
  } = useNotes();

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendHealth();
      setBackendConnected(isConnected);
      if (!isConnected) {
        // Error will be handled by useNotes hook
      }
      setInitialLoading(false);
    };
    checkConnection();
  }, []);

  // Load notes when view/search changes
  useEffect(() => {
    if (backendConnected) {
      loadNotes(currentView, searchTerm);
    }
  }, [currentView, searchTerm, backendConnected]);

  // Collapse sidebar in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setSidebarCollapsed(true);
    }
  }, [isFullscreen]);

  const handleCreateNote = async (noteData = {}) => {
    const result = await createNote(noteData); // Pass noteData here
    if (result && currentView !== "notes") {
      setCurrentView("notes");
    }
  };

  const handleDeleteNote = async (id) => {
    await deleteNote(id);
    // Reload notes after delete to get updated view
    await loadNotes(currentView, searchTerm);
  };

  const handleRestoreNote = async (id) => {
    await restoreNote(id);
    // Reload notes after restore to get updated view
    await loadNotes(currentView, searchTerm);
  };

  const handleTogglePin = async (id) => {
    await togglePin(id);
    // Reload notes to reflect new sorting
    await loadNotes(currentView, searchTerm);
  };

  const handleClearAllDeleted = async () => {
    await clearAllDeleted();
    setCurrentView("notes");
    await loadNotes("notes", "");
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setSearchTerm("");
  };

  const toggleFullscreen = async () => {
    if (!isFullscreen && !sidebarCollapsed) {
      setIsTransitioningFullscreen(true);
      setSidebarCollapsed(true);
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsFullscreen(true);
      setIsTransitioningFullscreen(false);
    } else {
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleToggleHeaderBackground = () => {
    setHeaderBackgroundEnabled(!headerBackgroundEnabled);
  };

  if (initialLoading) {
    return (
      <div className="app">
        <div className="app-loading">
          <LoadingSpinner message="Connecting to server..." size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <TopBar
        headerBackgroundEnabled={headerBackgroundEnabled}
        onToggleHeaderBackground={handleToggleHeaderBackground}
      />

      {(error || createError) && (
        <ErrorMessage
          message={error || createError}
          onDismiss={clearError}
          onRetry={() => loadNotes(currentView, searchTerm)}
        />
      )}

      <Sidebar
        notes={notes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onPermanentDelete={permanentDelete}
        onRestoreNote={handleRestoreNote}
        onTogglePin={handleTogglePin}
        onClearAllDeleted={handleClearAllDeleted}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        currentView={currentView}
        onViewChange={handleViewChange}
        counts={counts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        isFullscreen={isFullscreen}
      />

      <MainContent
        selectedNote={selectedNote}
        onUpdateNote={updateNote}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleSidebarToggle}
        onTogglePin={handleTogglePin}
        onDeleteNote={handleDeleteNote}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isTransitioningFullscreen={isTransitioningFullscreen}
        headerBackgroundEnabled={headerBackgroundEnabled}
      />

      <GlassmorphicFAB
        onCreateNote={handleCreateNote}
        selectedNote={selectedNote}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
