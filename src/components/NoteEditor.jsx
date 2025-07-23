import React from "react";
("use client");

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Minus,
} from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

const NoteEditor = ({ selectedNote, onUpdateNote }) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [buttonStates, setButtonStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    heading: false,
  });
  const [hasSelection, setHasSelection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [lastNoteId, setLastNoteId] = useState(null);
  const titleInputRef = useRef(null);
  const contentRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const cursorPositionRef = useRef(null);

  // Save cursor position
  const saveCursorPosition = useCallback(() => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      cursorPositionRef.current = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
    }
  }, []);

  // Restore cursor position
  const restoreCursorPosition = useCallback(() => {
    if (!contentRef.current || !cursorPositionRef.current) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();

      // Check if the saved nodes still exist in the DOM
      if (
        contentRef.current.contains(cursorPositionRef.current.startContainer)
      ) {
        range.setStart(
          cursorPositionRef.current.startContainer,
          cursorPositionRef.current.startOffset
        );
        range.setEnd(
          cursorPositionRef.current.endContainer,
          cursorPositionRef.current.endOffset
        );

        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      // If restoration fails, place cursor at end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Debounced button state updates to prevent flickering
  const { debouncedCallback: debouncedUpdateButtonStates } = useDebounce(() => {
    if (!contentRef.current || (isTyping && !hasStartedTyping)) return;

    const selection = window.getSelection();
    const hasTextSelection = selection && !selection.isCollapsed;

    setHasSelection(hasTextSelection);
    setButtonStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      heading: document.queryCommandValue("formatBlock") === "h3",
    });
  }, 150);

  // Immediate button state updates (for formatting buttons)
  const updateButtonStatesImmediate = useCallback(() => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    const hasTextSelection = selection && !selection.isCollapsed;

    setHasSelection(hasTextSelection);
    setButtonStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      heading: document.queryCommandValue("formatBlock") === "h3",
    });
  }, []);

  // Handle typing state
  const handleTypingStart = () => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      debouncedUpdateButtonStates();
    }, 200);
  };

  // Listen for selection changes (but debounced during initial typing)
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!isTyping || hasStartedTyping) {
        debouncedUpdateButtonStates();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [debouncedUpdateButtonStates, isTyping, hasStartedTyping]);

  // Handle note changes - FIXED to prevent cursor jumping and title overwriting
  useEffect(() => {
    if (selectedNote) {
      const noteId = selectedNote._id;
      const isNewNote = noteId !== lastNoteId;

      if (isNewNote) {
        // Only reset everything for a completely new note
        setTitle(selectedNote.title || "");
        setIsUserEditing(false);
        setHasStartedTyping(false);
        setLastNoteId(noteId);

        if (contentRef.current) {
          contentRef.current.innerHTML = selectedNote.content || "";
          updateCounts(selectedNote.content || "");
          setIsInitialLoad(false);

          // Initialize button states for new note
          setTimeout(() => {
            if (contentRef.current) {
              updateButtonStatesImmediate();
            }
          }, 50);
        }
      } else {
        // For updates to the same note, only update if user is not actively editing
        if (!isUserEditing) {
          // Only update title if it's different and user isn't editing
          if (selectedNote.title !== title) {
            setTitle(selectedNote.title || "");
          }

          // Only update content if it's different and preserve cursor
          if (
            contentRef.current &&
            selectedNote.content !== contentRef.current.innerHTML
          ) {
            saveCursorPosition();
            contentRef.current.innerHTML = selectedNote.content || "";
            updateCounts(selectedNote.content || "");
            // Restore cursor position after a brief delay
            setTimeout(() => {
              restoreCursorPosition();
            }, 10);
          }
        }
      }
    } else {
      setIsInitialLoad(true);
      setHasStartedTyping(false);
      setIsUserEditing(false);
      setLastNoteId(null);
    }
  }, [
    selectedNote,
    isUserEditing,
    title,
    updateButtonStatesImmediate,
    saveCursorPosition,
    restoreCursorPosition,
  ]);

  const updateCounts = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const chars = plainText.length;
    setWordCount(words);
    setCharCount(chars);
  };

  const handleUpdate = async (field, value) => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await onUpdateNote(selectedNote._id, { [field]: value });
    } finally {
      setIsSaving(false);
      // Reset editing state after save completes
      setTimeout(() => {
        setIsUserEditing(false);
      }, 100);
    }
  };

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    800
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true); // Mark as user editing
    debouncedUpdate("title", newTitle);
  };

  const handleContentChange = () => {
    if (!contentRef.current) return;

    setIsUserEditing(true); // Mark as user editing
    handleTypingStart();
    const htmlContent = contentRef.current.innerHTML;
    updateCounts(htmlContent);
    debouncedUpdate("content", htmlContent);
  };

  // Smart heading toggle
  const toggleHeading = () => {
    const isCurrentlyHeading =
      document.queryCommandValue("formatBlock") === "h3";

    if (isCurrentlyHeading) {
      document.execCommand("formatBlock", false, "div");
    } else {
      document.execCommand("formatBlock", false, "h3");
    }

    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  // Smart formatting for bold/italic/underline/strikethrough
  const smartFormat = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  // List formatting (these work naturally with double-enter)
  const toggleList = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  const formatActions = [
    {
      icon: Bold,
      action: () => smartFormat("bold"),
      title: hasSelection
        ? "Bold Selection (Ctrl+B)"
        : "Toggle Bold Mode (Ctrl+B)",
      isActive: () => buttonStates.bold,
      type: "smart",
    },
    {
      icon: Italic,
      action: () => smartFormat("italic"),
      title: hasSelection
        ? "Italic Selection (Ctrl+I)"
        : "Toggle Italic Mode (Ctrl+I)",
      isActive: () => buttonStates.italic,
      type: "smart",
    },
    {
      icon: Underline,
      action: () => smartFormat("underline"),
      title: hasSelection
        ? "Underline Selection (Ctrl+U)"
        : "Toggle Underline Mode (Ctrl+U)",
      isActive: () => buttonStates.underline,
      type: "smart",
    },
    {
      icon: Minus,
      action: () => smartFormat("strikeThrough"),
      title: hasSelection
        ? "Strikethrough Selection"
        : "Toggle Strikethrough Mode",
      isActive: () => buttonStates.strikeThrough,
      type: "smart",
    },
    {
      icon: List,
      action: () => toggleList("insertUnorderedList"),
      title: "Bullet List",
      isActive: () => buttonStates.insertUnorderedList,
      type: "list",
    },
    {
      icon: ListOrdered,
      action: () => toggleList("insertOrderedList"),
      title: "Numbered List",
      isActive: () => buttonStates.insertOrderedList,
      type: "list",
    },
    {
      icon: Type,
      action: toggleHeading,
      title: buttonStates.heading ? "Remove Heading" : "Make Heading",
      isActive: () => buttonStates.heading,
      type: "toggle",
    },
  ];

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault();
          smartFormat("bold");
          break;
        case "i":
          e.preventDefault();
          smartFormat("italic");
          break;
        case "u":
          e.preventDefault();
          smartFormat("underline");
          break;
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleContentChange();
  };

  // Handle mouse events for button state updates
  const handleMouseUp = () => {
    if (hasStartedTyping) {
      updateButtonStatesImmediate();
    }
  };

  const handleKeyUp = (e) => {
    // Only update button states for navigation keys, not typing keys
    const navigationKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
      "PageUp",
      "PageDown",
    ];
    if (navigationKeys.includes(e.key) && hasStartedTyping) {
      updateButtonStatesImmediate();
    }
  };

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <>
      {/* Formatting Toolbar - will be positioned by MainContent */}
      <div className="formatting-toolbar-container">
        <div className="formatting-toolbar">
          {formatActions.map((action, index) => (
            <button
              key={index}
              className={`format-btn ${action.isActive() ? "active" : ""} ${
                action.type
              }`}
              onClick={action.action}
              title={action.title}
            >
              <action.icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="note-editor">
        <div className="note-header">
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
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

        <div className="editor-container">
          <div className="content-wrapper">
            <div
              ref={contentRef}
              contentEditable
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onPaste={handlePaste}
              onMouseUp={handleMouseUp}
              className="note-content-input"
              data-placeholder="Start writing your note..."
              suppressContentEditableWarning={true}
            />
          </div>
        </div>
      </div>

      {/* Word Count Bar - will be positioned by MainContent */}
      <div className="editor-status-container">
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      </div>
    </>
  );
};

export default NoteEditor;
