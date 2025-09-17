"use client";

import { useState, useMemo } from "react";

import { notesAPI } from "@lib/services/api";
import { useAsyncAction } from "./useAsyncAction";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [lastCreatedNote, setLastCreatedNote] = useState(null);
  const [createError, setCreateError] = useState(null);
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

  const loadNotes = async (view = "", search = "", options = {}) => {
    return execute(async () => {
      const needAllNotes =
        view === "all" ||
        allNotes.length === 0 ||
        options.forceAllRefresh === true;

      if (needAllNotes) {
        const [allNotesData, filteredNotes] = await Promise.all([
          notesAPI.getAllNotesIncludingDeleted(),
          notesAPI.getAllNotes(view, search),
        ]);

        setAllNotes(allNotesData);
        setNotes(filteredNotes);

        if (
          selectedNote &&
          !filteredNotes.find((note) => note._id === selectedNote._id)
        ) {
          setSelectedNote(null);
        }

        return { allNotesData, filteredNotes };
      } else {
        const filteredNotes = await notesAPI.getAllNotes(view, search);
        setNotes(filteredNotes);

        if (
          selectedNote &&
          !filteredNotes.find((note) => note._id === selectedNote._id)
        ) {
          setSelectedNote(null);
        }

        return { allNotesData: allNotes, filteredNotes };
      }
    }, "Failed to load notes");
  };

  const fetchNoteById = async (noteId) => {
    return execute(async () => {
      const existingNote =
        allNotes.find((note) => note._id === noteId) ||
        notes.find((note) => note._id === noteId);

      if (existingNote) {
        return existingNote;
      }

      try {
        const serverNote = await notesAPI.fetchNoteById(noteId);
        if (serverNote && serverNote._id) {
          setAllNotes((prev) => [serverNote, ...prev]);
          return serverNote;
        }
      } catch (e) {}

      return null;
    }, "Failed to fetch note");
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setCreateError(null);
  };

  const createNote = async (noteData = {}) => {
    return execute(async () => {
      if (lastCreatedNote) {
        const isLastNoteEmpty =
          lastCreatedNote.title === "New Note" &&
          (!lastCreatedNote.content ||
            (typeof lastCreatedNote.content === "string" &&
              lastCreatedNote.content.trim() === "") ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.items &&
              lastCreatedNote.content.items.length === 1 &&
              !lastCreatedNote.content.items[0].text) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.columns &&
              lastCreatedNote.content.rows &&
              lastCreatedNote.content.rows.length === 1 &&
              lastCreatedNote.content.rows[0].cells &&
              lastCreatedNote.content.rows[0].cells.every(
                (cell) => !cell.value
              )) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.reminders &&
              lastCreatedNote.content.reminders.length === 1 &&
              !lastCreatedNote.content.reminders[0].text));

        if (isLastNoteEmpty) {
          setCreateError(
            "Note already created. Please add content to the existing note first."
          );
          setSelectedNote(lastCreatedNote);

          setTimeout(() => {
            setCreateError(null);
          }, 3000);

          return lastCreatedNote;
        }
      }

      let defaultContent = "";
      const noteType = noteData.type || "RICH_TEXT";

      switch (noteType) {
        case "CHECKLIST":
          defaultContent = {
            items: [{ id: Date.now().toString(), text: "", checked: false }],
          };
          break;
        case "REMINDERS":
          defaultContent = {
            reminders: [
              {
                id: Date.now().toString(),
                text: "",
                datetime: "",
                completed: false,
                priority: "medium",
              },
            ],
          };
          break;
        case "DATASHEET":
          defaultContent = {
            columns: [
              { id: "title", name: "Title", type: "text", width: "flex" },
              { id: "amount", name: "Amount", type: "number", width: "120px" },
              {
                id: "datetime",
                name: "Date & Time",
                type: "datetime",
                width: "200px",
              },
            ],
            rows: [
              {
                id: Date.now().toString(),
                cells: [
                  { columnId: "title", value: "" },
                  { columnId: "amount", value: "" },
                  { columnId: "datetime", value: "" },
                ],
              },
            ],
          };
          break;
        default:
          defaultContent = "";
      }

      const noteWithDefaults = {
        title: "New Note",
        content: defaultContent,
        pinned: false,
        type: noteType,
        ...noteData,
      };

      const newNote = await notesAPI.createNote(noteWithDefaults);
      setNotes((prev) => [newNote, ...prev]);
      setAllNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      setLastCreatedNote(newNote);
      setCreateError(null);
      return newNote;
    }, "Failed to create note");
  };

  const updateNote = async (id, updates) => {
    return execute(async () => {
      const updatedNote = await notesAPI.updateNote(id, updates);
      updateNoteInArrays(id, updatedNote);

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(updatedNote);
      }

      return updatedNote;
    }, "Failed to update note");
  };

  const deleteNote = async (id) => {
    return execute(async () => {
      let noteToDelete =
        allNotes.find((note) => note._id === id) ||
        notes.find((note) => note._id === id);

      if (!noteToDelete) {
        try {
          const serverNote = await notesAPI.fetchNoteById(id);
          if (serverNote && serverNote._id) {
            noteToDelete = serverNote;
            setAllNotes((prev) => {
              if (prev.find((n) => n._id === serverNote._id)) return prev;
              return [serverNote, ...prev];
            });
          }
        } catch (e) {}
      }

      if (noteToDelete?.pinned) {
        setCreateError("Unpin the note before deleting.");
        setSelectedNote(noteToDelete);

        setTimeout(() => {
          setCreateError(null);
        }, 3000);

        return { blocked: true, note: noteToDelete };
      }

      const deletedNote = await notesAPI.deleteNote(id);

      if (deletedNote && deletedNote._id) {
        updateNoteInArrays(deletedNote._id, deletedNote);

        if (selectedNote?._id === deletedNote._id) {
          setSelectedNote(deletedNote);
        }
      }

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null);
      }

      return deletedNote;
    }, "Failed to delete note");
  };

  const permanentDelete = async (id) => {
    return execute(async () => {
      const result = await notesAPI.permanentDelete(id);
      removeNoteFromArrays(id);

      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null);
      }

      return result;
    }, "Failed to permanently delete note");
  };

  const restoreNote = async (id) => {
    return execute(async () => {
      const restoredNote = await notesAPI.restoreNote(id);

      if (restoredNote && restoredNote._id) {
        updateNoteInArrays(restoredNote._id, restoredNote);
        if (selectedNote?._id === restoredNote._id) {
          setSelectedNote(restoredNote);
        }
      }

      return restoredNote;
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
      const latestAllNotes = await notesAPI.getAllNotesIncludingDeleted();
      const deletedNotes = latestAllNotes.filter((note) => note.deleted);

      if (deletedNotes.length === 0) {
        return { success: true, deletedCount: 0, errors: [] };
      }

      const deleteResults = await Promise.allSettled(
        deletedNotes.map(async (note) => {
          try {
            await notesAPI.permanentDelete(note._id);
            return { success: true, noteId: note._id, title: note.title };
          } catch (error) {
            return {
              success: false,
              noteId: note._id,
              title: note.title,
              error: error.message,
            };
          }
        })
      );

      const successful = [];
      const failed = [];

      deleteResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successful.push(result.value);
            removeNoteFromArrays(result.value.noteId);
          } else {
            failed.push(result.value);
          }
        } else {
          failed.push({ error: result.reason?.message || "Unknown error" });
        }
      });

      if (selectedNote?.deleted) {
        setSelectedNote(null);
      }

      if (lastCreatedNote?.deleted) {
        setLastCreatedNote(null);
      }

      if (failed.length > 0 && successful.length === 0) {
        throw new Error(
          `Failed to delete any notes. Errors: ${failed
            .map((f) => f.error)
            .join(", ")}`
        );
      } else if (failed.length > 0) {
        console.warn(`Some notes could not be deleted:`, failed);
      }

      return {
        success: true,
        deletedCount: successful.length,
        failedCount: failed.length,
        errors: failed,
      };
    }, "Failed to clear deleted notes");
  };

  const counts = useMemo(() => {
    return {
      active: allNotes.filter((note) => !note.deleted).length,
      pinned: allNotes.filter((note) => note.pinned && !note.deleted).length,
      deleted: allNotes.filter((note) => note.deleted).length,
    };
  }, [allNotes]);

  return {
    notes,
    allNotes,
    selectedNote,
    setSelectedNote: selectNote,
    counts,
    loading,
    error,
    createError,
    clearError: () => {
      clearError();
      setCreateError(null);
    },
    loadNotes,
    fetchNoteById,
    createNote,
    updateNote,
    deleteNote,
    permanentDelete,
    restoreNote,
    togglePin,
    clearAllDeleted,
  };
};
