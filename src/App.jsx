import React from "react";
("use client");
import { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import { notesAPI, checkBackendHealth } from "./services/api";
import "./styles/App.css";

function App() {
  // State management
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("notes"); // "notes", "pinned", "deleted"

  // Loading and error states
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // State for maintaining all notes for counts
  const [allNotesForCounts, setAllNotesForCounts] = useState([]);

  // Check backend connection on app start
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await checkBackendHealth();
      setBackendConnected(isConnected);
      if (!isConnected) {
        setError(
          "Cannot connect to backend server. Make sure it's running on http://localhost:5000"
        );
      }
      setInitialLoading(false);
    };
    checkConnection();
  }, []);

  // Load notes when app starts or when view/search changes
  useEffect(() => {
    if (backendConnected) {
      loadNotes();
    }
  }, [currentView, searchTerm, backendConnected]);

  // Function to load all notes for counts
  const loadAllNotesForCounts = async () => {
    try {
      const allNotes = await notesAPI.getAllNotesIncludingDeleted();
      console.log("Loaded all notes for counts:", allNotes);
      setAllNotesForCounts(allNotes);
    } catch (error) {
      console.error("Error loading all notes for counts:", error);
    }
  };

  // Function to load notes from backend
  const loadNotes = async () => {
    try {
      setError(null);

      // Always load all notes for counts first
      await loadAllNotesForCounts();

      // Then fetch notes for current view
      const fetchedNotes = await notesAPI.getAllNotes(currentView, searchTerm);
      setNotes(fetchedNotes);

      // If selected note is not in the current view, deselect it
      if (
        selectedNote &&
        !fetchedNotes.find((note) => note._id === selectedNote._id)
      ) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      setError(`Failed to load notes: ${error.message}`);
    }
  };

  // Create a new note
  const createNote = async () => {
    try {
      setError(null);
      const newNote = await notesAPI.createNote();

      // Add to local state immediately for better UX
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      setAllNotesForCounts((prevNotes) => [newNote, ...prevNotes]);
      setSelectedNote(newNote);

      // Switch to Notes view when creating a new note
      if (currentView !== "notes") {
        setCurrentView("notes");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      setError(`Failed to create note: ${error.message}`);
    }
  };

  // Update a note
  const updateNote = async (id, updates) => {
    try {
      setError(null);
      const updatedNote = await notesAPI.updateNote(id, updates);

      // Update local state without causing flicker
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? updatedNote : note))
      );

      // Update allNotesForCounts as well
      setAllNotesForCounts((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? updatedNote : note))
      );

      // Update selected note if it's the one being updated
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(updatedNote);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      setError(`Failed to update note: ${error.message}`);
    }
  };

  // Delete a note (soft delete)
  const deleteNote = async (id) => {
    try {
      setError(null);
      await notesAPI.deleteNote(id);

      // Reload all data to ensure consistency
      await loadNotes();

      // Deselect if it was the selected note
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      setError(`Failed to delete note: ${error.message}`);
    }
  };

  // Permanently delete a note
  const permanentDelete = async (id) => {
    try {
      setError(null);
      await notesAPI.permanentDelete(id);

      // Remove from local state
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
      setAllNotesForCounts((prevNotes) =>
        prevNotes.filter((note) => note._id !== id)
      );

      // Deselect if it was the selected note
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Error permanently deleting note:", error);
      setError(`Failed to permanently delete note: ${error.message}`);
    }
  };

  // Clear all deleted notes
  const clearAllDeleted = async () => {
    try {
      setError(null);
      const deletedNotes = allNotesForCounts.filter((note) => note.isDeleted);

      // Delete all deleted notes permanently
      await Promise.all(
        deletedNotes.map((note) => notesAPI.permanentDelete(note._id))
      );

      // Reload all data
      await loadNotes();

      // Deselect if selected note was deleted
      if (selectedNote && selectedNote.isDeleted) {
        setSelectedNote(null);
      }

      // Switch back to notes view after clearing all
      setCurrentView("notes");
    } catch (error) {
      console.error("Error clearing deleted notes:", error);
      setError(`Failed to clear deleted notes: ${error.message}`);
    }
  };

  // Restore a deleted note
  const restoreNote = async (id) => {
    try {
      setError(null);
      await notesAPI.restoreNote(id);

      // Reload all data to ensure consistency
      await loadNotes();
    } catch (error) {
      console.error("Error restoring note:", error);
      setError(`Failed to restore note: ${error.message}`);
    }
  };

  // Toggle pin status
  const togglePin = async (id) => {
    try {
      setError(null);
      const updatedNote = await notesAPI.togglePin(id);

      // Update local state
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? updatedNote : note))
      );

      // Update allNotesForCounts as well
      setAllNotesForCounts((prevNotes) =>
        prevNotes.map((note) => (note._id === id ? updatedNote : note))
      );

      // Update selected note if it's the one being updated
      if (selectedNote && selectedNote._id === id) {
        setSelectedNote(updatedNote);
      }

      // Reload notes to reflect the new sorting
      await loadNotes();
    } catch (error) {
      console.error("Error toggling pin:", error);
      setError(`Failed to toggle pin: ${error.message}`);
    }
  };

  // Handle view changes
  const handleViewChange = (newView) => {
    setCurrentView(newView);
    setSearchTerm(""); // Clear search when switching views
  };

  // Handle search changes
  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  // Calculate the counts from allNotesForCounts
  const pinnedCount = allNotesForCounts.filter(
    (note) => note.isPinned && !note.isDeleted
  ).length;
  const deletedCount = allNotesForCounts.filter(
    (note) => note.isDeleted
  ).length;

  console.log("Current view:", currentView);
  console.log("All notes for counts:", allNotesForCounts.length);
  console.log("Deleted count:", deletedCount);
  console.log("Pinned count:", pinnedCount);

  // Show loading spinner while connecting
  if (initialLoading) {
    return (
      <ThemeProvider>
        <div className="app">
          <div className="app-loading">
            <LoadingSpinner message="Connecting to server..." size={32} />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="app">
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            onRetry={loadNotes}
          />
        )}

        <Sidebar
          notes={notes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          onPermanentDelete={permanentDelete}
          onRestoreNote={restoreNote}
          onTogglePin={togglePin}
          onClearAllDeleted={clearAllDeleted}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          currentView={currentView}
          onViewChange={handleViewChange}
          pinnedCount={pinnedCount}
          deletedCount={deletedCount}
        />

        <MainContent
          selectedNote={selectedNote}
          onUpdateNote={updateNote}
          onCreateNote={createNote}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
