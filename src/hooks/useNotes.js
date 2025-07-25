"use client"

import { useState } from "react"
import { notesAPI } from "../services/api"
import { useAsyncAction } from "./useAsyncAction"

export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [allNotes, setAllNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [lastCreatedNote, setLastCreatedNote] = useState(null)
  const [createError, setCreateError] = useState(null)
  const { loading, error, execute, clearError } = useAsyncAction()

  const updateNoteInArrays = (noteId, updatedNote) => {
    const updateFn = (notes) => notes.map((note) => (note._id === noteId ? updatedNote : note))
    setNotes(updateFn)
    setAllNotes(updateFn)

    if (selectedNote?._id === noteId) {
      setSelectedNote(updatedNote)
    }
  }

  const removeNoteFromArrays = (noteId) => {
    const removeFn = (notes) => notes.filter((note) => note._id !== noteId)
    setNotes(removeFn)
    setAllNotes(removeFn)

    if (selectedNote?._id === noteId) {
      setSelectedNote(null)
    }
  }

  const loadNotes = async (view = "", search = "") => {
    return execute(async () => {
      const [allNotesData, filteredNotes] = await Promise.all([
        notesAPI.getAllNotesIncludingDeleted(),
        notesAPI.getAllNotes(view, search),
      ])

      setAllNotes(allNotesData)
      setNotes(filteredNotes)

      // Deselect note if not in current view
      if (selectedNote && !filteredNotes.find((note) => note._id === selectedNote._id)) {
        setSelectedNote(null)
      }

      return { allNotesData, filteredNotes }
    }, "Failed to load notes")
  }

  // New function to fetch a specific note's latest data
  const fetchNoteById = async (noteId) => {
    return execute(async () => {
      // Find the note in our current data first
      const existingNote = allNotes.find((note) => note._id === noteId) || notes.find((note) => note._id === noteId)

      if (existingNote) {
        return existingNote
      }

      // If not found locally, we could fetch from server, but for now return null
      return null
    }, "Failed to fetch note")
  }

  // Updated setSelectedNote to be a simple setter without fetching
  const selectNote = (note) => {
    setSelectedNote(note)
    // Clear any create errors when selecting a note
    setCreateError(null)
  }

  const createNote = async (noteData = {}) => {
    return execute(async () => {
      // Check if we just created a note and it's still empty
      if (lastCreatedNote) {
        const isLastNoteEmpty =
          lastCreatedNote.title === "New Note" &&
          (!lastCreatedNote.content ||
            (typeof lastCreatedNote.content === "string" && lastCreatedNote.content.trim() === "") ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.items &&
              lastCreatedNote.content.items.length === 1 &&
              !lastCreatedNote.content.items[0].text) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.columns &&
              lastCreatedNote.content.rows &&
              lastCreatedNote.content.rows.length === 1 &&
              lastCreatedNote.content.rows[0].cells &&
              lastCreatedNote.content.rows[0].cells.every((cell) => !cell.value)) ||
            (typeof lastCreatedNote.content === "object" &&
              lastCreatedNote.content.reminders &&
              lastCreatedNote.content.reminders.length === 1 &&
              !lastCreatedNote.content.reminders[0].text))

        if (isLastNoteEmpty) {
          // Show error and focus on existing note
          setCreateError("Note already created. Please add content to the existing note first.")
          setSelectedNote(lastCreatedNote)

          // Clear error after 3 seconds
          setTimeout(() => {
            setCreateError(null)
          }, 3000)

          return lastCreatedNote
        }
      }

      // Set up proper content based on note type
      let defaultContent = ""
      const noteType = noteData.type || "RICH_TEXT"

      switch (noteType) {
        case "CHECKLIST":
          defaultContent = {
            items: [{ id: Date.now().toString(), text: "", checked: false }],
          }
          break
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
          }
          break
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
          }
          break
        default:
          defaultContent = ""
      }

      // Create note with proper defaults
      const noteWithDefaults = {
        title: "New Note",
        content: defaultContent,
        isPinned: false,
        type: noteType,
        ...noteData, // Override with any provided data
      }

      const newNote = await notesAPI.createNote(noteWithDefaults)
      setNotes((prev) => [newNote, ...prev])
      setAllNotes((prev) => [newNote, ...prev])
      setSelectedNote(newNote)
      setLastCreatedNote(newNote)
      setCreateError(null)
      return newNote
    }, "Failed to create note")
  }

  const updateNote = async (id, updates) => {
    return execute(async () => {
      const updatedNote = await notesAPI.updateNote(id, updates)
      updateNoteInArrays(id, updatedNote)

      // Update lastCreatedNote if it's the same note
      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(updatedNote)
      }

      return updatedNote
    }, "Failed to update note")
  }

  const deleteNote = async (id) => {
    return execute(async () => {
      await notesAPI.deleteNote(id)

      // Clear lastCreatedNote if it's the deleted note
      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null)
      }

      return true
    }, "Failed to delete note")
  }

  const permanentDelete = async (id) => {
    return execute(async () => {
      await notesAPI.permanentDelete(id)
      removeNoteFromArrays(id)

      // Clear lastCreatedNote if it's the deleted note
      if (lastCreatedNote?._id === id) {
        setLastCreatedNote(null)
      }

      return true
    }, "Failed to permanently delete note")
  }

  const restoreNote = async (id) => {
    return execute(async () => {
      await notesAPI.restoreNote(id)
      return true
    }, "Failed to restore note")
  }

  const togglePin = async (id) => {
    return execute(async () => {
      const updatedNote = await notesAPI.togglePin(id)
      updateNoteInArrays(id, updatedNote)
      return updatedNote
    }, "Failed to toggle pin")
  }

  const clearAllDeleted = async () => {
    return execute(async () => {
      // First, refresh the notes to get the latest state
      const latestAllNotes = await notesAPI.getAllNotesIncludingDeleted()
      const deletedNotes = latestAllNotes.filter((note) => note.isDeleted)

      if (deletedNotes.length === 0) {
        // No deleted notes to clear
        return { success: true, deletedCount: 0, errors: [] }
      }

      // Use Promise.allSettled to handle individual failures gracefully
      const deleteResults = await Promise.allSettled(
        deletedNotes.map(async (note) => {
          try {
            await notesAPI.permanentDelete(note._id)
            return { success: true, noteId: note._id, title: note.title }
          } catch (error) {
            return {
              success: false,
              noteId: note._id,
              title: note.title,
              error: error.message,
            }
          }
        }),
      )

      // Process results
      const successful = []
      const failed = []

      deleteResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            successful.push(result.value)
            // Remove from local state
            removeNoteFromArrays(result.value.noteId)
          } else {
            failed.push(result.value)
          }
        } else {
          failed.push({ error: result.reason?.message || "Unknown error" })
        }
      })

      // Clear selected note if it was deleted
      if (selectedNote?.isDeleted) {
        setSelectedNote(null)
      }

      // Clear lastCreatedNote if it was deleted
      if (lastCreatedNote?.isDeleted) {
        setLastCreatedNote(null)
      }

      // If some deletions failed, throw an error with details
      if (failed.length > 0 && successful.length === 0) {
        throw new Error(`Failed to delete any notes. Errors: ${failed.map((f) => f.error).join(", ")}`)
      } else if (failed.length > 0) {
        console.warn(`Some notes could not be deleted:`, failed)
        // Still return success if at least some were deleted
      }

      return {
        success: true,
        deletedCount: successful.length,
        failedCount: failed.length,
        errors: failed,
      }
    }, "Failed to clear deleted notes")
  }

  // Calculate counts
  const counts = {
    active: allNotes.filter((note) => !note.isDeleted).length,
    pinned: allNotes.filter((note) => note.isPinned && !note.isDeleted).length,
    deleted: allNotes.filter((note) => note.isDeleted).length,
  }

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
      clearError()
      setCreateError(null)
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
  }
}
