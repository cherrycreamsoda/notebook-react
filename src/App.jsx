import React from "react";
import { useState } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import "./styles/App.css";

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("notes"); // "notes", "pinned", "deleted"

  const createNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isDeleted: false,
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    // Switch to Notes view when creating a new note
    setCurrentView("notes");
  };

  const updateNote = (id, updates) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
      )
    );
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote({ ...selectedNote, ...updates });
    }
  };

  const deleteNote = (id) => {
    updateNote(id, { isDeleted: true });
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const permanentDelete = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const restoreNote = (id) => {
    updateNote(id, { isDeleted: false });
  };

  const togglePin = (id) => {
    const note = notes.find((n) => n.id === id);
    updateNote(id, { isPinned: !note.isPinned });
  };

  const getFilteredNotes = () => {
    let filtered = [];

    if (currentView === "pinned") {
      filtered = notes.filter((note) => !note.isDeleted && note.isPinned);
    } else if (currentView === "deleted") {
      filtered = notes.filter((note) => note.isDeleted);
    } else {
      filtered = notes.filter((note) => !note.isDeleted);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort pinned notes to top when in main notes view
    if (currentView === "notes") {
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    } else {
      // Sort by update date for other views
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return filtered;
  };

  return (
    <ThemeProvider>
      <div className="app">
        <Sidebar
          notes={getFilteredNotes()}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          onPermanentDelete={permanentDelete}
          onRestoreNote={restoreNote}
          onTogglePin={togglePin}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          currentView={currentView}
          onViewChange={setCurrentView}
          allNotes={notes}
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
