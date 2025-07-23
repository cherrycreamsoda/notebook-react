const mongoose = require("mongoose");

// Base note schema with type-specific content handling
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      maxlength: 200,
    },
    // Content will be stored differently based on type
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },
    // Raw content for search and preview (always string)
    rawContent: {
      type: String,
      default: "",
      maxlength: 50000,
    },
    type: {
      type: String,
      enum: ["RICH_TEXT", "TEXT", "CHECKLIST", "REMINDERS", "DATASHEET"],
      default: "RICH_TEXT",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Type-specific metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
noteSchema.index({ isDeleted: 1, isPinned: 1, updatedAt: -1 });
noteSchema.index({ title: "text", rawContent: "text" });
noteSchema.index({ type: 1 });
noteSchema.index({ type: 1, isDeleted: 1 });

// Pre-save middleware to handle content processing based on type
noteSchema.pre("save", function (next) {
  try {
    // Process content based on type and update rawContent for search
    switch (this.type) {
      case "RICH_TEXT":
        // For rich text, extract plain text from HTML for search
        if (typeof this.content === "string") {
          const tempDiv = { innerHTML: this.content };
          // Simple HTML tag removal for search
          this.rawContent = this.content
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
        }
        break;

      case "TEXT":
        // For plain text, content and rawContent are the same
        this.rawContent = this.content || "";
        break;

      case "CHECKLIST":
        // For checklist, extract text from items for search
        if (this.content && this.content.items) {
          this.rawContent = this.content.items
            .map((item) => item.text || "")
            .join(" ");
        } else {
          this.rawContent = "";
        }
        break;

      case "REMINDERS":
        // For reminders, extract reminder text for search
        if (this.content && this.content.reminders) {
          this.rawContent = this.content.reminders
            .map((reminder) => reminder.text || "")
            .join(" ");
        } else {
          this.rawContent = "";
        }
        break;

      case "DATASHEET":
        // For datasheet, extract cell values for search
        if (this.content && this.content.rows) {
          this.rawContent = this.content.rows
            .map((row) =>
              row.cells
                ? row.cells.map((cell) => cell.value || "").join(" ")
                : ""
            )
            .join(" ");
        } else {
          this.rawContent = "";
        }
        break;

      default:
        this.rawContent = String(this.content || "");
    }

    next();
  } catch (error) {
    next(error);
  }
});

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
          { rawContent: { $regex: query, $options: "i" } },
        ],
      },
    ],
  };
  return this.find(searchFilter).sort({ isPinned: -1, updatedAt: -1 });
};

noteSchema.statics.getNotesByType = function (type, includeDeleted = false) {
  const filter = { type };
  if (!includeDeleted) {
    filter.isDeleted = false;
  }
  return this.find(filter).sort({ isPinned: -1, updatedAt: -1 });
};

// Instance methods for type-specific operations
noteSchema.methods.getPreviewText = function (maxLength = 100) {
  let preview = "";

  switch (this.type) {
    case "CHECKLIST":
      if (this.content && this.content.items && this.content.items.length > 0) {
        const firstItems = this.content.items.slice(0, 3);
        preview = firstItems
          .map(
            (item) =>
              `${item.checked ? "✓" : "○"} ${item.text || "Untitled item"}`
          )
          .join(", ");
        if (this.content.items.length > 3) {
          preview += ` and ${this.content.items.length - 3} more...`;
        }
      } else {
        preview = "Empty checklist";
      }
      break;

    case "REMINDERS":
      if (
        this.content &&
        this.content.reminders &&
        this.content.reminders.length > 0
      ) {
        preview = this.content.reminders
          .slice(0, 2)
          .map((reminder) => reminder.text || "Untitled reminder")
          .join(", ");
        if (this.content.reminders.length > 2) {
          preview += ` and ${this.content.reminders.length - 2} more...`;
        }
      } else {
        preview = "No reminders";
      }
      break;

    case "DATASHEET":
      if (this.content && this.content.rows && this.content.rows.length > 0) {
        preview = `${this.content.rows.length} rows of data`;
      } else {
        preview = "Empty datasheet";
      }
      break;

    default:
      preview = this.rawContent || "No content";
  }

  return preview.length > maxLength
    ? preview.substring(0, maxLength) + "..."
    : preview;
};

module.exports = mongoose.model("Note", noteSchema);
