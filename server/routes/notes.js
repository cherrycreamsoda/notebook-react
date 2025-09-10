const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

// Get all notes with optional filtering and search
router.get("/", async (req, res) => {
  try {
    const { view, search, includeAll, type } = req.query;
    let notes;

    if (includeAll === "true") {
      notes = await Note.find({}).sort({ isPinned: -1, updatedAt: -1 });
    } else if (search) {
      const includeDeleted = view === "deleted";
      notes = await Note.searchNotes(search, includeDeleted);
    } else if (type) {
      const includeDeleted = view === "deleted";
      notes = await Note.getNotesByType(type, includeDeleted);
    } else {
      switch (view) {
        case "pinned":
          notes = await Note.getPinnedNotes();
          break;
        case "deleted":
          notes = await Note.getDeletedNotes();
          break;
        default:
          notes = await Note.getActiveNotes();
      }
    }

    res.json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      error: "Failed to fetch notes",
      message: error.message,
    });
  }
});

// Create a new note
router.post("/", async (req, res) => {
  try {
    const {
      title = "New Note",
      content = "",
      isPinned = false,
      type = "RICH_TEXT",
    } = req.body;

    const note = new Note({ title, content, isPinned, type });
    const savedNote = await note.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: savedNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({
      error: "Failed to create note",
      message: error.message,
    });
  }
});

// Update a note
router.put("/:id", async (req, res) => {
  try {
    const { title, content, isPinned, type } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (type !== undefined) note.type = type;

    const updatedNote = await note.save();

    res.json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({
      error: "Failed to update note",
      message: error.message,
    });
  }
});

// Toggle pin status
router.put("/:id/pin", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.isDeleted) {
      return res.status(400).json({ error: "Cannot pin deleted notes" });
    }

    note.isPinned = !note.isPinned;
    const updatedNote = await note.save();

    res.json({
      success: true,
      message: `Note ${
        updatedNote.isPinned ? "pinned" : "unpinned"
      } successfully`,
      data: updatedNote,
    });
  } catch (error) {
    console.error("Error toggling pin:", error);
    res.status(500).json({
      error: "Failed to toggle pin",
      message: error.message,
    });
  }
});

// Restore a deleted note
router.put("/:id/restore", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (!note.isDeleted) {
      return res.status(400).json({ error: "Note is not deleted" });
    }

    note.isDeleted = false;
    const restoredNote = await note.save();

    res.json({
      success: true,
      message: "Note restored successfully",
      data: restoredNote,
    });
  } catch (error) {
    console.error("Error restoring note:", error);
    res.status(500).json({
      error: "Failed to restore note",
      message: error.message,
    });
  }
});

// Soft delete a note
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (note.isDeleted) {
      return res.status(400).json({ error: "Note is already deleted" });
    }

    note.isDeleted = true;
    const deletedNote = await note.save();

    res.json({
      success: true,
      message: "Note moved to trash successfully",
      data: deletedNote,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      error: "Failed to delete note",
      message: error.message,
    });
  }
});

// Permanently delete a note
router.delete("/:id/permanent", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({
      success: true,
      message: "Note permanently deleted",
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error("Error permanently deleting note:", error);
    res.status(500).json({
      error: "Failed to permanently delete note",
      message: error.message,
    });
  }
});

module.exports = router;
