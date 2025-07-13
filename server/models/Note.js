// This file defines what a "Note" looks like in the database
// It's like creating a blueprint or template for your notes

const mongoose = require("mongoose");

// Schema = blueprint/template for how data should look
const noteSchema = new mongoose.Schema(
  {
    // These are the same fields your React app uses!
    title: {
      type: String,
      required: false, // Allow empty titles
      trim: true, // Remove extra spaces
      maxlength: 200, // Limit title length
      default: "", // Default to empty string
    },
    content: {
      type: String,
      default: "", // Empty by default
      maxlength: 50000, // Allow for very long notes
    },
    isPinned: {
      type: Boolean,
      default: false, // Not pinned by default
    },
    isDeleted: {
      type: Boolean,
      default: false, // Not deleted by default
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set when note is created
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set when note is updated
    },
  },
  {
    timestamps: true, // This automatically manages createdAt and updatedAt
  }
);

// INDEXES - these make searching faster (like an index in a book)
noteSchema.index({ isDeleted: 1, isPinned: 1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text" }); // For text search

// MIDDLEWARE - runs before saving to update the updatedAt field
noteSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// INSTANCE METHODS - these are like "actions" you can perform on a single note
// Think of them as functions that belong to each note

// Soft delete - mark as deleted but don't actually remove from database
noteSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.updatedAt = new Date();
  return this.save();
};

// Restore a deleted note
noteSchema.methods.restore = function () {
  this.isDeleted = false;
  this.updatedAt = new Date();
  return this.save();
};

// Toggle pin status
noteSchema.methods.togglePin = function () {
  this.isPinned = !this.isPinned;
  this.updatedAt = new Date();
  return this.save();
};

// STATIC METHODS - these work on the entire collection of notes
// Think of them as functions that work on ALL notes

// Get all active notes (not deleted)
noteSchema.statics.getActiveNotes = function () {
  return this.find({ isDeleted: false }).sort({ isPinned: -1, updatedAt: -1 });
};

// Get only pinned notes
noteSchema.statics.getPinnedNotes = function () {
  return this.find({ isDeleted: false, isPinned: true }).sort({
    updatedAt: -1,
  });
};

// Get only deleted notes
noteSchema.statics.getDeletedNotes = function () {
  return this.find({ isDeleted: true }).sort({ updatedAt: -1 });
};

// Search notes by title or content
noteSchema.statics.searchNotes = function (query, includeDeleted = false) {
  const searchFilter = {
    $and: [
      includeDeleted ? {} : { isDeleted: false },
      {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { content: { $regex: query, $options: "i" } },
        ],
      },
    ],
  };

  return this.find(searchFilter).sort({ isPinned: -1, updatedAt: -1 });
};

// Export the model so other files can use it
module.exports = mongoose.model("Note", noteSchema);
