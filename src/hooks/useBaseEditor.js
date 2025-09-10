import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import {
  isContentEmpty,
  extractPlainText,
  hasNoteContent,
} from "../utils/baseEditorUtils.js";
import {
  NOTE_TYPES,
  NOTE_FIELDS,
  TYPE_CHANGE_WARNING,
  DEFAULT_DATASHEET_COLUMNS,
} from "../constants/noteConstants.js";

export const useBaseEditor = ({ selectedNote, onUpdateNote }) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [shouldBlinkDropdown, setShouldBlinkDropdown] = useState(false);
  const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(null);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);

  const titleInputRef = useRef(null);
  const noteType = selectedNote?.type || NOTE_TYPES.RICH_TEXT;

  const updateCounts = useCallback((content) => {
    const plainText = extractPlainText(content);
    setWordCount(plainText.trim().split(/\s+/).length || 0);
    setCharCount(plainText.length);
  }, []);

  const handleUpdate = async (field, value) => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await onUpdateNote(selectedNote._id, { [field]: value });
    } finally {
      setIsSaving(false);
      setTimeout(() => setIsUserEditing(false), 100); // allow React to settle first
    }
  };

  const [isUserEditing, setIsUserEditing] = useState(false);

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    1500
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true); // <- track user input
    debouncedUpdate(NOTE_FIELDS.TITLE, newTitle);
  };

  const handleContentKeyDown = (e, content) => {
    if (e.key === "Enter") {
      debouncedUpdate.cancel?.(); // cancel the debounce timer
      handleUpdate(NOTE_FIELDS.CONTENT, content); // force immediate save
    }
  };

  const handleContentChange = useCallback(
    (newContent) => {
      updateCounts(newContent);
      debouncedUpdate(NOTE_FIELDS.CONTENT, newContent);
    },
    [updateCounts, debouncedUpdate]
  );

  const performTypeChange = async (newType) => {
    if (!selectedNote) return;

    let newContent = "";
    const now = Date.now().toString();

    switch (newType) {
      case NOTE_TYPES.CHECKLIST:
        newContent = { items: [{ id: now, text: "", checked: false }] };
        break;
      case NOTE_TYPES.DATASHEET:
        newContent = {
          columns: DEFAULT_DATASHEET_COLUMNS,
          rows: [
            {
              id: now,
              cells: DEFAULT_DATASHEET_COLUMNS.map((col) => ({
                columnId: col.id,
                value: "",
              })),
            },
          ],
        };
        break;
      case NOTE_TYPES.REMINDERS:
        newContent = {
          reminders: [
            {
              id: now,
              text: "",
              datetime: "",
              completed: false,
              priority: "medium",
            },
          ],
        };
        break;
      default:
        newContent = "";
    }

    await handleUpdate(NOTE_FIELDS.TYPE, newType);
    await handleUpdate(NOTE_FIELDS.CONTENT, newContent);

    setShouldBlinkDropdown(true);
    setTimeout(() => setShouldBlinkDropdown(false), 1000);
  };

  const handleTypeChange = async (newType) => {
    if (!selectedNote || selectedNote.type === newType) return;

    if (hasNoteContent(selectedNote.content)) {
      setTypeChangeConfirmation({
        newType,
        ...TYPE_CHANGE_WARNING,
      });
    } else {
      await performTypeChange(newType);
    }
  };

  const confirmTypeChange = async () => {
    if (typeChangeConfirmation) {
      await performTypeChange(typeChangeConfirmation.newType);
      setTypeChangeConfirmation(null);
    }
  };

  const cancelTypeChange = () => setTypeChangeConfirmation(null);

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.editorFocusHandler?.();
    }
  };

  useEffect(() => {
    if (shouldFocusTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
      setShouldFocusTitle(false);
    }
  }, [shouldFocusTitle]);

  useEffect(() => {
    if (selectedNote) {
      // Prevent overwrite if user is typing
      if (!isUserEditing) {
        setTitle(selectedNote.title || "");
      }

      if (
        selectedNote.title === "New Note" &&
        isContentEmpty(selectedNote.content)
      ) {
        setShouldFocusTitle(true);
      }
    }
  }, [selectedNote]);

  useEffect(() => cleanup, [cleanup]);

  return {
    title,
    isSaving,
    wordCount,
    charCount,
    noteType,
    titleInputRef,
    typeChangeConfirmation,
    shouldBlinkDropdown,
    handleTitleChange,
    handleContentChange,
    handleTypeChange,
    confirmTypeChange,
    cancelTypeChange,
    handleTitleKeyDown,
    updateCounts,
  };
};
