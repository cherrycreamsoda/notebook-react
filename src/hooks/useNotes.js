"use client";

import { useState } from "react";
import { notesAPI } from "../services/api";
import { useAsyncAction } from "./useAsyncAction";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const { loading, error, execute, clearError } = useAsyncAction();

  const updateNoteInArrays = (noteId, updatedNote) => {
    const updateFn = (notes) =>
      notes.map((note) => (note._id === noteId ? updatedNote : note));
    setNotes(updateFn);
    setAllNotes(updateFn);

    if (selectedNote?._id === noteId) {
      setSelectedNote(updatedNote);
    }
  };

  const removeNoteFromArrays = (noteId) => {
    const removeFn = (notes) => notes.filter((note) => note._id !== noteId);
    setNotes(removeFn);
    setAllNotes(removeFn);

    if (selectedNote?._id === noteId) {
      setSelectedNote(null);
    }
  };

  const loadNotes = async (view = "", search = "") => {
    return execute(async () => {
      const [allNotesData, filteredNotes] = await Promise.all([
        notesAPI.getAllNotesIncludingDeleted(),
        notesAPI.getAllNotes(view, search),
      ]);

      setAllNotes(allNotesData);
      setNotes(filteredNotes);

      // Deselect note if not in current view
      if (
        selectedNote &&
        !filteredNotes.find((note) => note._id === selectedNote._id)
      ) {
        setSelectedNote(null);
      }

      return { allNotesData, filteredNotes };
    }, "Failed to load notes");
  };

  const createNote = async (noteData = {}) => {
    return execute(async () => {
      // Check if the last note is still empty/unchanged
      if (
        selectedNote &&
        selectedNote.title === "New Note" &&
        (!selectedNote.content || selectedNote.content.trim() === "")
      ) {
        // Don't create a new note, just focus on the existing empty one
        return selectedNote;
      }

      const newNote = await notesAPI.createNote(noteData);
      setNotes((prev) => [newNote, ...prev]);
      setAllNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      return newNote;
    }, "Failed to create note");
  };

  const updateNote = async (id, updates) => {
    return execute(async () => {
      const updatedNote = await notesAPI.updateNote(id, updates);
      updateNoteInArrays(id, updatedNote);
      return updatedNote;
    }, "Failed to update note");
  };

  const deleteNote = async (id) => {
    return execute(async () => {
      await notesAPI.deleteNote(id);
      // Reload to get updated data
      return true;
    }, "Failed to delete note");
  };

  const permanentDelete = async (id) => {
    return execute(async () => {
      await notesAPI.permanentDelete(id);
      removeNoteFromArrays(id);
      return true;
    }, "Failed to permanently delete note");
  };

  const restoreNote = async (id) => {
    return execute(async () => {
      await notesAPI.restoreNote(id);
      return true;
    }, "Failed to restore note");
  };

  const togglePin = async (id) => {
    return execute(async () => {
      const updatedNote = await notesAPI.togglePin(id);
      updateNoteInArrays(id, updatedNote);
      return updatedNote;
    }, "Failed to toggle pin");
  };

  const clearAllDeleted = async () => {
    return execute(async () => {
      const deletedNotes = allNotes.filter((note) => note.isDeleted);
      await Promise.all(
        deletedNotes.map((note) => notesAPI.permanentDelete(note._id))
      );

      if (selectedNote?.isDeleted) {
        setSelectedNote(null);
      }
      return true;
    }, "Failed to clear deleted notes");
  };

  // Calculate counts
  const counts = {
    active: allNotes.filter((note) => !note.isDeleted).length,
    pinned: allNotes.filter((note) => note.isPinned && !note.isDeleted).length,
    deleted: allNotes.filter((note) => note.isDeleted).length,
  };

  return {
    notes,
    allNotes,
    selectedNote,
    setSelectedNote,
    counts,
    loading,
    error,
    clearError,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    togglePin,
    clearAllDeleted,
  };
};
