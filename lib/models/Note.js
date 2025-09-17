import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    content: { type: mongoose.Schema.Types.Mixed, default: "" },
    rawContent: { type: String, default: "" },
    type: { type: String, default: "TEXT" },
    pinned: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

NoteSchema.methods.getPreview = function (maxLength = 120) {
  let preview = "";
  try {
    switch ((this.type || "TEXT").toUpperCase()) {
      case "CHECKLIST":
        if (
          this.content &&
          this.content.items &&
          this.content.items.length > 0
        ) {
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
            .map((r) => r.text || "Untitled reminder")
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
        preview = this.rawContent || "";
    }
  } catch (e) {
    preview = this.rawContent || "";
  }

  if (!preview) preview = this.title || "";
  return preview.length > maxLength
    ? preview.substring(0, maxLength) + "..."
    : preview;
};

const Note = mongoose.models?.Note || mongoose.model("Note", NoteSchema);
export default Note;
