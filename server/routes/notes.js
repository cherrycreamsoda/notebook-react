// This file handles all the API endpoints for notes
// Think of it as the "controller" that decides what happens when your React app makes requests

const express = require("express")
const { body, validationResult, param } = require("express-validator")
const Note = require("../models/Note")

const router = express.Router()

// VALIDATION RULES - these check if the data from your React app is valid
const validateNote = [
  body("title").optional().trim().isLength({ max: 200 }).withMessage("Title must be less than 200 characters"),
  body("content").optional().isLength({ max: 50000 }).withMessage("Content must be less than 50,000 characters"),
  body("isPinned").optional().isBoolean().withMessage("isPinned must be a boolean"),
]

const validateId = [param("id").isMongoId().withMessage("Invalid note ID")]

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

// GET /api/notes - Get all notes with optional filtering and search
// This is like the "getFilteredNotes" function in your React app, but on the server
router.get("/", async (req, res) => {
  try {
    const { view, search, includeAll } = req.query // Get parameters from URL
    let notes

    // Special case: if includeAll is true, return ALL notes (for counting purposes)
    if (includeAll === "true") {
      notes = await Note.find({}).sort({ isPinned: -1, updatedAt: -1 })
    } else if (search) {
      // Search functionality
      const includeDeleted = view === "deleted"
      notes = await Note.searchNotes(search, includeDeleted)
    } else {
      // Filter by view (just like your React app's currentView)
      switch (view) {
        case "pinned":
          notes = await Note.getPinnedNotes()
          break
        case "deleted":
          notes = await Note.getDeletedNotes()
          break
        default:
          notes = await Note.getActiveNotes()
      }
    }

    // Send back the notes in a consistent format
    res.json({
      success: true,
      count: notes.length,
      data: notes,
    })
  } catch (error) {
    console.error("Error fetching notes:", error)
    res.status(500).json({
      error: "Failed to fetch notes",
      message: error.message,
    })
  }
})

// POST /api/notes - Create a new note
// This replaces your React app's "createNote" function
router.post("/", validateNote, handleValidationErrors, async (req, res) => {
  try {
    const { title, content = "", isPinned = false } = req.body

    // Create new note using the Note model
    const note = new Note({
      title: title || "New Note", // Use "New Note" as fallback only if title is undefined
      content,
      isPinned,
    })

    // Save to database
    const savedNote = await note.save()

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: savedNote,
    })
  } catch (error) {
    console.error("Error creating note:", error)
    res.status(500).json({
      error: "Failed to create note",
      message: error.message,
    })
  }
})

// PUT /api/notes/:id - Update a note
// This replaces your React app's "updateNote" function
router.put("/:id", validateId, validateNote, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, isPinned } = req.body

    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    // Update fields if provided (allow empty strings)
    if (title !== undefined) note.title = title || "" // Allow empty title
    if (content !== undefined) note.content = content
    if (isPinned !== undefined) note.isPinned = isPinned

    const updatedNote = await note.save()

    res.json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    })
  } catch (error) {
    console.error("Error updating note:", error)
    res.status(500).json({
      error: "Failed to update note",
      message: error.message,
    })
  }
})

// PUT /api/notes/:id/pin - Toggle pin status
// This replaces your React app's "togglePin" function
router.put("/:id/pin", validateId, handleValidationErrors, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    if (note.isDeleted) {
      return res.status(400).json({ error: "Cannot pin deleted notes" })
    }

    const updatedNote = await note.togglePin()

    res.json({
      success: true,
      message: `Note ${updatedNote.isPinned ? "pinned" : "unpinned"} successfully`,
      data: updatedNote,
    })
  } catch (error) {
    console.error("Error toggling pin:", error)
    res.status(500).json({
      error: "Failed to toggle pin",
      message: error.message,
    })
  }
})

// PUT /api/notes/:id/restore - Restore a deleted note
// This replaces your React app's "restoreNote" function
router.put("/:id/restore", validateId, handleValidationErrors, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    if (!note.isDeleted) {
      return res.status(400).json({ error: "Note is not deleted" })
    }

    const restoredNote = await note.restore()

    res.json({
      success: true,
      message: "Note restored successfully",
      data: restoredNote,
    })
  } catch (error) {
    console.error("Error restoring note:", error)
    res.status(500).json({
      error: "Failed to restore note",
      message: error.message,
    })
  }
})

// DELETE /api/notes/:id - Soft delete a note (move to trash)
// This replaces your React app's "deleteNote" function
router.delete("/:id", validateId, handleValidationErrors, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    if (note.isDeleted) {
      return res.status(400).json({ error: "Note is already deleted" })
    }

    const deletedNote = await note.softDelete()

    res.json({
      success: true,
      message: "Note moved to trash successfully",
      data: deletedNote,
    })
  } catch (error) {
    console.error("Error deleting note:", error)
    res.status(500).json({
      error: "Failed to delete note",
      message: error.message,
    })
  }
})

// DELETE /api/notes/:id/permanent - Permanently delete a note
// This replaces your React app's "permanentDelete" function
router.delete("/:id/permanent", validateId, handleValidationErrors, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return res.status(404).json({ error: "Note not found" })
    }

    // Actually remove from database (not just mark as deleted)
    await Note.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: "Note permanently deleted",
      data: { id: req.params.id },
    })
  } catch (error) {
    console.error("Error permanently deleting note:", error)
    res.status(500).json({
      error: "Failed to permanently delete note",
      message: error.message,
    })
  }
})

module.exports = router
