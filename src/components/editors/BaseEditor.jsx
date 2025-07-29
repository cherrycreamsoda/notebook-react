"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

import NoteTypeDropdown from "../widgets/NoteTypeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";

import { useDebounce } from "../../hooks/useDebounce";

/**
 * BaseEditor - Abstract base class for all editor types
 * Provides common functionality, state management, and UI structure
 * NOW USES PROPER FLEX LAYOUT INSTEAD OF ABSOLUTE POSITIONING
 */
const BaseEditor = ({
  selectedNote,
  onUpdateNote,
  children,
  editorSpecificToolbar = null,
  showTitle = true,
  showToolbar = true,
  showStatusBar = true,
  editorClassName = "",
}) => {
  // Common state
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [shouldBlinkDropdown, setShouldBlinkDropdown] = useState(false);
  const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(null);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);

  // Common refs
  const titleInputRef = useRef(null);

  // Get note type
  const noteType = selectedNote?.type || "RICH_TEXT";

  // Focus management for new notes
  useEffect(() => {
    if (shouldFocusTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
      setShouldFocusTitle(false);
    }
  }, [shouldFocusTitle]);

  // Handle Enter key in title to move to content
  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Let child editors handle focus
      if (window.editorFocusHandler) {
        window.editorFocusHandler();
      }
    }
  };

  // Handle note changes
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      setIsUserEditing(false);
      setIsInitialLoad(false);

      // Check if this is a newly created note that should get focus
      const isNewlyCreated =
        selectedNote.title === "New Note" &&
        isContentEmpty(selectedNote.content);
      if (isNewlyCreated) {
        setShouldFocusTitle(true);
      }
    } else {
      setIsInitialLoad(true);
      setIsUserEditing(false);
    }
  }, [selectedNote]);

  // Abstract method - to be implemented by child editors
  const isContentEmpty = (content) => {
    if (!content) return true;
    if (typeof content === "string") return content.trim() === "";
    if (typeof content === "object") {
      if (content.items) {
        return content.items.length === 1 && !content.items[0].text;
      }
      if (content.rows) {
        return (
          content.rows.length === 1 &&
          content.rows[0].cells &&
          content.rows[0].cells.every((cell) => !cell.value)
        );
      }
      if (content.reminders) {
        return content.reminders.length === 1 && !content.reminders[0].text;
      }
    }
    return false;
  };

  // Common update counts method - to be overridden by child editors if needed
  const updateCounts = useCallback((content) => {
    let plainText = "";

    if (typeof content === "string") {
      // For text content, extract plain text from HTML if needed
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content || "";
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    } else if (typeof content === "object") {
      if (content && content.items && Array.isArray(content.items)) {
        // Checklist
        plainText = content.items.map((item) => item.text || "").join(" ");
      } else if (content && content.rows && Array.isArray(content.rows)) {
        // Datasheet
        plainText = content.rows
          .map((row) =>
            row.cells ? row.cells.map((cell) => cell.value || "").join(" ") : ""
          )
          .join(" ");
      } else if (
        content &&
        content.reminders &&
        Array.isArray(content.reminders)
      ) {
        // Reminders
        plainText = content.reminders
          .map((reminder) => reminder.text || "")
          .join(" ");
      }
    }

    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const chars = plainText.length;
    setWordCount(words);
    setCharCount(chars);
  }, []);

  // Common update handler
  const handleUpdate = async (field, value) => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await onUpdateNote(selectedNote._id, { [field]: value });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setIsUserEditing(false);
      }, 100);
    }
  };

  // Debounced update
  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    1500
  );

  // Title change handler
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true);
    debouncedUpdate("title", newTitle);
  };

  // Content change handler - to be called by child editors
  const handleContentChange = useCallback(
    (newContent) => {
      setIsUserEditing(true);
      updateCounts(newContent);
      debouncedUpdate("content", newContent);
    },
    [updateCounts, debouncedUpdate]
  );

  // Type change handlers
  const handleTypeChange = async (newType) => {
    if (!selectedNote || selectedNote.type === newType) return;

    const hasContent = () => {
      if (!selectedNote.content) return false;
      if (typeof selectedNote.content === "string") {
        return selectedNote.content.trim().length > 0;
      }
      if (typeof selectedNote.content === "object") {
        if (
          selectedNote.content.items &&
          Array.isArray(selectedNote.content.items)
        ) {
          return selectedNote.content.items.some(
            (item) => item.text && item.text.trim().length > 0
          );
        }
        if (
          selectedNote.content.rows &&
          Array.isArray(selectedNote.content.rows)
        ) {
          return selectedNote.content.rows.some((row) =>
            row.cells
              ? row.cells.some(
                  (cell) => cell.value && cell.value.trim().length > 0
                )
              : false
          );
        }
        if (
          selectedNote.content.reminders &&
          Array.isArray(selectedNote.content.reminders)
        ) {
          return selectedNote.content.reminders.some(
            (reminder) => reminder.text && reminder.text.trim().length > 0
          );
        }
      }
      return false;
    };

    if (hasContent()) {
      setTypeChangeConfirmation({
        newType,
        title: "Change Note Type?",
        message:
          "Changing the note type will clear all current content. This action cannot be undone.",
      });
    } else {
      await performTypeChange(newType);
    }
  };

  const performTypeChange = async (newType) => {
    if (!selectedNote) return;

    await handleUpdate("content", "");

    let newContent = "";
    if (newType === "CHECKLIST") {
      newContent = {
        items: [{ id: Date.now().toString(), text: "", checked: false }],
      };
    } else if (newType === "DATASHEET") {
      newContent = {
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
    } else if (newType === "REMINDERS") {
      newContent = {
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
    } else {
      newContent = "";
    }

    await handleUpdate("type", newType);
    await handleUpdate("content", newContent);

    setShouldBlinkDropdown(true);
    setTimeout(() => setShouldBlinkDropdown(false), 1000);
  };

  const confirmTypeChange = async () => {
    if (typeChangeConfirmation) {
      await performTypeChange(typeChangeConfirmation.newType);
      setTypeChangeConfirmation(null);
    }
  };

  const cancelTypeChange = () => {
    setTypeChangeConfirmation(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <>
      {/* NEW LAYOUT STRUCTURE - PROPER FLEX LAYOUT */}

      {/* Formatting Toolbar - FLEX ITEM */}
      {showToolbar && (
        <div className="formatting-toolbar">
          <NoteTypeDropdown
            selectedType={noteType}
            onTypeChange={handleTypeChange}
            disabled={!selectedNote}
            shouldBlink={shouldBlinkDropdown}
          />
          <div className="toolbar-separator"></div>
          {editorSpecificToolbar}
        </div>
      )}

      {/* Editor Content Area - FLEX ITEM THAT TAKES REMAINING SPACE */}
      <div className="editor-content-area">
        <div className={`note-editor ${editorClassName}`}>
          {showTitle && (
            <div className="note-header">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                placeholder="Untitled"
                className="note-title-input"
              />
              {isSaving && (
                <div className="saving-indicator">
                  <div className="saving-dot"></div>
                  <span>Saving...</span>
                </div>
              )}
            </div>
          )}

          <div
            className={`editor-container ${!showTitle ? "full-height" : ""}`}
          >
            <div className="content-wrapper">
              {React.cloneElement(children, {
                selectedNote,
                onContentChange: handleContentChange,
                updateCounts,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Word Count Bar - FLEX ITEM */}
      {showStatusBar && (
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      )}

      {/* Type Change Confirmation Dialog */}
      {typeChangeConfirmation && (
        <ConfirmationDialog
          title={typeChangeConfirmation.title}
          message={typeChangeConfirmation.message}
          onConfirm={confirmTypeChange}
          onCancel={cancelTypeChange}
          position={{
            top: window.innerHeight / 2 - 100,
            left: window.innerWidth / 2 - 200,
          }}
          confirmText="Change Type"
          cancelText="Cancel"
          type="warning"
        />
      )}
    </>
  );
};

export default BaseEditor;
