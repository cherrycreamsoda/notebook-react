const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      // Removed trim: true to preserve spaces in titles
      maxlength: 200,
    },
    content: {
      type: String,
      default: "",
      maxlength: 50000,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
noteSchema.index({ isDeleted: 1, isPinned: 1, updatedAt: -1 });
noteSchema.index({ title: "text", content: "text" });

// Static methods for common queries
noteSchema.statics.getActiveNotes = function () {
  return this.find({ isDeleted: false }).sort({ isPinned: -1, updatedAt: -1 });
};

noteSchema.statics.getPinnedNotes = function () {
  return this.find({ isDeleted: false, isPinned: true }).sort({
    updatedAt: -1,
  });
};

noteSchema.statics.getDeletedNotes = function () {
  return this.find({ isDeleted: true }).sort({ updatedAt: -1 });
};

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

module.exports = mongoose.model("Note", noteSchema);
