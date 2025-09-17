export const NOTE_TYPES = {
  RICH_TEXT: "RICH_TEXT",
  CHECKLIST: "CHECKLIST",
  DATASHEET: "DATASHEET",
  REMINDERS: "REMINDERS",
};

export const NOTE_FIELDS = {
  TITLE: "title",
  CONTENT: "content",
  TYPE: "type",
};

export const TYPE_CHANGE_WARNING = {
  title: "Change Note Type?",
  message:
    "Changing the note type will clear all current content. This action cannot be undone.",
};

export const DEFAULT_DATASHEET_COLUMNS = [
  { id: "title", name: "Title", type: "text", width: "flex" },
  { id: "amount", name: "Amount", type: "number", width: "120px" },
  { id: "datetime", name: "Date & Time", type: "datetime", width: "200px" },
];
