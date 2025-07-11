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

  const togglePin = (id) => {
    const note = notes.find((n) => n.id === id);
    updateNote(id, { isPinned: !note.isPinned });
  };

  const filteredNotes = notes.filter(
    (note) =>
      !note.isDeleted &&
      (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <ThemeProvider>
      <div className="app">
        <Sidebar
          notes={filteredNotes}
          selectedNote={selectedNote}
          onSelectNote={setSelectedNote}
          onCreateNote={createNote}
          onDeleteNote={deleteNote}
          onTogglePin={togglePin}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
