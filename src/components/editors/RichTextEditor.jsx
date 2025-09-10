"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import {
  DEFAULT_BUTTON_STATES,
  NAVIGATION_KEYS,
  KEYBOARD_SHORTCUTS,
  TYPING_DEBOUNCE_DELAY,
  BUTTON_STATE_DEBOUNCE_DELAY,
  RICH_TEXT_PLACEHOLDER,
} from "../../constants/richTextEditorConstants";
import { extractPlainText } from "../../utils/richTextEditorUtils";

/**
 * RichTextEditor - The core rich text editing functionality
 * Extracted from original RichTextEditor to work with BaseEditor pattern
 * Maintains all sophisticated rich text features and performance optimizations
 */
const RichTextEditor = ({ selectedNote, onContentChange, updateCounts }) => {
  const contentRef = useRef(null);
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);
  const [hasSelection, setHasSelection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [lastNoteId, setLastNoteId] = useState(null);
  const typingTimeoutRef = useRef(null);

  // Debounced button state updates for performance during typing
  const { debouncedCallback: debouncedUpdateButtonStates } = useDebounce(() => {
    if (!contentRef.current || (isTyping && !hasStartedTyping)) return;
    updateButtonStatesFromDOM();
  }, BUTTON_STATE_DEBOUNCE_DELAY);

  // Update button states from DOM
  const updateButtonStatesFromDOM = useCallback(() => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    setHasSelection(selection && !selection.isCollapsed);

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

  // Handle typing state for performance optimization
  const handleTypingStart = useCallback(() => {
    if (!hasStartedTyping) setHasStartedTyping(true);
    setIsTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      debouncedUpdateButtonStates();
    }, TYPING_DEBOUNCE_DELAY);
  }, [hasStartedTyping, debouncedUpdateButtonStates]);

  // Selection change handler for real-time button updates
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

  // Initialize content when note changes
  useEffect(() => {
    if (selectedNote) {
      const noteId = selectedNote._id;
      const isNewNote = noteId !== lastNoteId;

      if (isNewNote) {
        setHasStartedTyping(false);
        setLastNoteId(noteId);

        if (contentRef.current) {
          const content = selectedNote.content || "";
          contentRef.current.innerHTML = content;

          // Update counts using the content
          const plainText = extractPlainText(content);
          updateCounts(plainText);
        }

        // Update button states after content is set
        setTimeout(() => {
          if (contentRef.current) {
            updateButtonStatesFromDOM();
          }
        }, 50);
      }
    } else {
      setHasStartedTyping(false);
      setLastNoteId(null);
    }
  }, [selectedNote, updateButtonStatesFromDOM, updateCounts]);

  // Content change handler
  const handleContentChange = useCallback(() => {
    if (!contentRef.current) return;

    handleTypingStart();
    const htmlContent = contentRef.current.innerHTML;
    const plainText = extractPlainText(htmlContent);

    updateCounts(plainText);
    onContentChange(htmlContent);
  }, [handleTypingStart, updateCounts, onContentChange]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && KEYBOARD_SHORTCUTS[e.key]) {
      e.preventDefault();
      smartFormat(KEYBOARD_SHORTCUTS[e.key]);
    }
  }, []);

  // Paste handler - convert to plain text to prevent formatting issues
  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleContentChange();
    },
    [handleContentChange]
  );

  // Mouse up handler for selection changes
  const handleMouseUp = useCallback(() => {
    if (hasStartedTyping) {
      updateButtonStatesFromDOM();
    }
  }, [hasStartedTyping, updateButtonStatesFromDOM]);

  // Key up handler for navigation keys
  const handleKeyUp = useCallback(
    (e) => {
      if (NAVIGATION_KEYS.includes(e.key) && hasStartedTyping) {
        updateButtonStatesFromDOM();
      }
    },
    [hasStartedTyping, updateButtonStatesFromDOM]
  );

  // Smart formatting function with focus management
  const smartFormat = useCallback(
    (command) => {
      document.execCommand(command, false, null);
      contentRef.current?.focus();
      handleContentChange();
      updateButtonStatesFromDOM();
    },
    [handleContentChange, updateButtonStatesFromDOM]
  );

  // Toggle heading function
  const toggleHeading = useCallback(() => {
    const isHeading = document.queryCommandValue("formatBlock") === "h3";
    document.execCommand("formatBlock", false, isHeading ? "div" : "h3");
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesFromDOM();
  }, [handleContentChange, updateButtonStatesFromDOM]);

  // Toggle list function with sophisticated cursor positioning
  const toggleList = useCallback(
    (command) => {
      document.execCommand(command, false, null);
      contentRef.current?.focus();

      // Complex cursor positioning for lists
      setTimeout(() => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        // Find the list item
        while (
          currentNode &&
          currentNode.nodeName !== "LI" &&
          currentNode !== contentRef.current
        ) {
          currentNode = currentNode.parentNode;
        }

        if (currentNode && currentNode.nodeName === "LI") {
          const lastChild = currentNode.lastChild;
          const newRange = document.createRange();

          if (lastChild?.nodeType === Node.TEXT_NODE) {
            newRange.setStart(lastChild, lastChild.textContent.length);
          } else {
            newRange.selectNodeContents(currentNode);
            newRange.collapse(false);
          }

          newRange.setEnd(newRange.startContainer, newRange.startOffset);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }

        handleContentChange();
        updateButtonStatesFromDOM();
      }, 10);
    },
    [handleContentChange, updateButtonStatesFromDOM]
  );

  // Expose formatting functions to toolbar via global context
  useEffect(() => {
    window.richTextFormatting = {
      smartFormat,
      toggleHeading,
      toggleList,
      buttonStates,
      hasSelection,
    };

    return () => {
      window.richTextFormatting = null;
    };
  }, [smartFormat, toggleHeading, toggleList, buttonStates, hasSelection]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={contentRef}
      contentEditable
      onInput={handleContentChange}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onPaste={handlePaste}
      onMouseUp={handleMouseUp}
      className="note-content-input"
      data-placeholder={RICH_TEXT_PLACEHOLDER}
      suppressContentEditableWarning={true}
    />
  );
};

export default RichTextEditor;
