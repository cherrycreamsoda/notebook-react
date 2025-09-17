"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDebounce } from "@hooks/useDebounce";
import {
  DEFAULT_BUTTON_STATES,
  NAVIGATION_KEYS,
  KEYBOARD_SHORTCUTS,
  TYPING_DEBOUNCE_DELAY,
  BUTTON_STATE_DEBOUNCE_DELAY,
  RICH_TEXT_PLACEHOLDER,
} from "@lib/constants/richTextEditorConstants";
import { extractPlainText } from "@lib/utils/richTextEditorUtils";

const RichTextEditor = ({ selectedNote, onContentChange, updateCounts }) => {
  const contentRef = useRef(null);
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);
  const [hasSelection, setHasSelection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [lastNoteId, setLastNoteId] = useState(null);
  const typingTimeoutRef = useRef(null);

  const { debouncedCallback: debouncedUpdateButtonStates } = useDebounce(() => {
    if (!contentRef.current || (isTyping && !hasStartedTyping)) return;
    updateButtonStatesFromDOM();
  }, BUTTON_STATE_DEBOUNCE_DELAY);

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

  const handleTypingStart = useCallback(() => {
    if (!hasStartedTyping) setHasStartedTyping(true);
    setIsTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      debouncedUpdateButtonStates();
    }, TYPING_DEBOUNCE_DELAY);
  }, [hasStartedTyping, debouncedUpdateButtonStates]);

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

          const plainText = extractPlainText(content);
          updateCounts(plainText);
        }

        setTimeout(() => {
          if (contentRef.current) updateButtonStatesFromDOM();
        }, 50);
      }
    } else {
      setHasStartedTyping(false);
      setLastNoteId(null);
    }
  }, [selectedNote, updateButtonStatesFromDOM, updateCounts, lastNoteId]);

  const handleContentChange = useCallback(() => {
    if (!contentRef.current) return;
    handleTypingStart();

    const htmlContent = contentRef.current.innerHTML;
    const plainText = extractPlainText(htmlContent);

    updateCounts(plainText);
    onContentChange(htmlContent);
  }, [handleTypingStart, updateCounts, onContentChange]);

  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && KEYBOARD_SHORTCUTS[e.key]) {
      e.preventDefault();
      smartFormat(KEYBOARD_SHORTCUTS[e.key]);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      contentRef.current?.blur();

      const noteList = document.querySelector(".notes-list");
      if (noteList && typeof noteList.focus === "function") {
        noteList.focus();
      }
    }
  }, []);

  const handlePaste = useCallback(
    (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleContentChange();
    },
    [handleContentChange]
  );

  const handleMouseUp = useCallback(() => {
    if (hasStartedTyping) updateButtonStatesFromDOM();
  }, [hasStartedTyping, updateButtonStatesFromDOM]);

  const handleKeyUp = useCallback(
    (e) => {
      if (NAVIGATION_KEYS.includes(e.key) && hasStartedTyping) {
        updateButtonStatesFromDOM();
      }
    },
    [hasStartedTyping, updateButtonStatesFromDOM]
  );

  const smartFormat = useCallback(
    (command) => {
      document.execCommand(command, false, null);
      contentRef.current?.focus();
      handleContentChange();
      updateButtonStatesFromDOM();
    },
    [handleContentChange, updateButtonStatesFromDOM]
  );

  const toggleHeading = useCallback(() => {
    const isHeading = document.queryCommandValue("formatBlock") === "h3";
    document.execCommand("formatBlock", false, isHeading ? "div" : "h3");
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesFromDOM();
  }, [handleContentChange, updateButtonStatesFromDOM]);

  const toggleList = useCallback(
    (command) => {
      document.execCommand(command, false, null);
      contentRef.current?.focus();

      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        let node = range.startContainer;

        while (node && node.nodeName !== "LI" && node !== contentRef.current) {
          node = node.parentNode;
        }

        if (node && node.nodeName === "LI") {
          const newRange = document.createRange();
          const lastChild = node.lastChild;

          if (lastChild?.nodeType === Node.TEXT_NODE) {
            newRange.setStart(lastChild, lastChild.textContent.length);
          } else {
            newRange.selectNodeContents(node);
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
