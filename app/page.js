"use client";
import React, { useState, useEffect, useCallback } from "react";
import styles from "./page.module.css";

import TopBar from "@components/layout/TopBar";
import Sidebar from "@components/layout/Sidebar";
import MainContent from "@components/layout/MainContent";
import fullscreenStyles from "../styles/Fullscreen.module.css";
import LoadingSpinner from "@components/common/LoadingSpinner";
import ErrorMessage from "@components/common/ErrorMessage";
import FloatingActionButton from "@components/widgets/FloatingActionButton";

import { useNotes } from "@hooks/useNotes";
import { checkBackendHealth } from "@lib/services/api";

function PageContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("notes");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isTransitioningFullscreen, setIsTransitioningFullscreen] =
    useState(false);
  const [headerBackgroundEnabled, setHeaderBackgroundEnabled] = useState(false);
  const topBarFullscreenClass = isFullscreen
    ? fullscreenStyles.fullscreenTopBar
    : "";

  const {
    notes,
    selectedNote,
    setSelectedNote,
    counts,
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

  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendHealth();
      setBackendConnected(isConnected);
      setInitialLoading(false);
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (backendConnected) {
      loadNotes(currentView, searchTerm);
    }
  }, [currentView, searchTerm, backendConnected]);

  useEffect(() => {
    if (isFullscreen) {
      setSidebarCollapsed(true);
    }
  }, [isFullscreen]);

  const handleCreateNote = useCallback(
    async (noteData = {}) => {
      const result = await createNote(noteData);
      if (result && currentView !== "notes") {
        setCurrentView("notes");
      }
    },
    [createNote, currentView]
  );

  const handleDeleteNote = useCallback(
    async (id) => {
      await deleteNote(id);
      await loadNotes(currentView, searchTerm);
    },
    [deleteNote, loadNotes, currentView, searchTerm]
  );

  const handleRestoreNote = useCallback(
    async (id) => {
      await restoreNote(id);
      await loadNotes(currentView, searchTerm);
    },
    [restoreNote, loadNotes, currentView, searchTerm]
  );

  const handleTogglePin = useCallback(
    async (id) => {
      await togglePin(id);
      await loadNotes(currentView, searchTerm);
    },
    [togglePin, loadNotes, currentView, searchTerm]
  );

  const handleClearAllDeleted = useCallback(async () => {
    await clearAllDeleted();
    setCurrentView("notes");
    await loadNotes("notes", "", { forceAllRefresh: true });
  }, [clearAllDeleted, loadNotes]);

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
      <div className={styles.app}>
        <div className={styles["app-loading"]}>
          <LoadingSpinner message="Connecting to server..." size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.app} ${isFullscreen ? "fullscreen-mode" : ""}`}>
      <TopBar
        headerBackgroundEnabled={headerBackgroundEnabled}
        onToggleHeaderBackground={handleToggleHeaderBackground}
        fullscreenClass={topBarFullscreenClass}
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
        expandedFullscreenClass={
          isFullscreen ? fullscreenStyles.fullscreenSidebarExpanded : ""
        }
        collapsedFullscreenClass={
          isFullscreen ? fullscreenStyles.fullscreenSidebarCollapsed : ""
        }
      />

      <MainContent
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
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

      <FloatingActionButton
        onCreateNote={handleCreateNote}
        selectedNote={selectedNote}
        sidebarCollapsed={sidebarCollapsed}
      />
    </div>
  );
}

export default function Page() {
  return <PageContent />;
}
