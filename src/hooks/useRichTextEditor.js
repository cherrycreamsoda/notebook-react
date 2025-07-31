import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "./useDebounce.js";
import {
  DEFAULT_BUTTON_STATES,
  NAVIGATION_KEYS,
} from "../constants/richTextEditorConstants.js";
import {
  extractPlainText,
  getWordCharCount,
  hasRichTextContent,
} from "../utils/richTextEditorUtils.js";

export const useRichTextEditor = ({ selectedNote, onUpdateNote }) => {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [buttonStates, setButtonStates] = useState(DEFAULT_BUTTON_STATES);
  const [hasSelection, setHasSelection] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [lastNoteId, setLastNoteId] = useState(null);
  const [shouldBlinkDropdown, setShouldBlinkDropdown] = useState(false);
  const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(null);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);

  const titleInputRef = useRef(null);
  const contentRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const cursorPositionRef = useRef(null);

  useEffect(() => {
    if (shouldFocusTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
      setShouldFocusTitle(false);
    }
  }, [shouldFocusTitle]);

  const { debouncedCallback: debouncedUpdateButtonStates } = useDebounce(() => {
    if (!contentRef.current || (isTyping && !hasStartedTyping)) return;
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
  }, 150);

  const updateButtonStatesImmediate = useCallback(() => {
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

  const handleTypingStart = () => {
    if (!hasStartedTyping) setHasStartedTyping(true);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      debouncedUpdateButtonStates();
    }, 200);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!isTyping || hasStartedTyping) debouncedUpdateButtonStates();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [debouncedUpdateButtonStates, isTyping, hasStartedTyping]);

  useEffect(() => {
    if (selectedNote) {
      const noteId = selectedNote._id;
      const isNewNote = noteId !== lastNoteId;

      if (isNewNote) {
        setTitle(selectedNote.title || "");
        setIsUserEditing(false);
        setHasStartedTyping(false);
        setLastNoteId(noteId);

        const isNewlyCreated =
          selectedNote.title === "New Note" &&
          (!selectedNote.content ||
            (typeof selectedNote.content === "string" &&
              selectedNote.content.trim() === ""));

        if (isNewlyCreated) setShouldFocusTitle(true);

        if (contentRef.current) {
          contentRef.current.innerHTML = selectedNote.content || "";
          updateCounts(selectedNote.content || "");
        }

        setTimeout(() => {
          if (contentRef.current) updateButtonStatesImmediate();
        }, 50);
      }
    } else {
      setHasStartedTyping(false);
      setIsUserEditing(false);
      setLastNoteId(null);
    }
  }, [selectedNote, updateButtonStatesImmediate]);

  const updateCounts = (content) => {
    const text = extractPlainText(content);
    const { words, chars } = getWordCharCount(text);
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
      setTimeout(() => setIsUserEditing(false), 100);
    }
  };

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    1500
  );

  useEffect(() => cleanup, [cleanup]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true);
    debouncedUpdate("title", newTitle);
  };

  const handleContentChange = () => {
    if (!contentRef.current) return;
    setIsUserEditing(true);
    handleTypingStart();
    const htmlContent = contentRef.current.innerHTML;
    updateCounts(htmlContent);
    debouncedUpdate("content", htmlContent);
  };

  const handleTypeChange = async (newType) => {
    if (!selectedNote || selectedNote.type === newType) return;
    if (hasRichTextContent(selectedNote.content)) {
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

  const cancelTypeChange = () => setTypeChangeConfirmation(null);

  const toggleHeading = () => {
    const isHeading = document.queryCommandValue("formatBlock") === "h3";
    document.execCommand("formatBlock", false, isHeading ? "div" : "h3");
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  const smartFormat = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  const toggleList = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    setTimeout(() => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      let currentNode = range.startContainer;
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
      updateButtonStatesImmediate();
    }, 10);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key)) {
      e.preventDefault();
      smartFormat({ b: "bold", i: "italic", u: "underline" }[e.key]);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleContentChange();
  };

  const handleMouseUp = () => {
    if (hasStartedTyping) updateButtonStatesImmediate();
  };

  const handleKeyUp = (e) => {
    if (NAVIGATION_KEYS.includes(e.key) && hasStartedTyping) {
      updateButtonStatesImmediate();
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      contentRef.current?.focus();
    }
  };

  return {
    refs: { titleInputRef, contentRef },
    title,
    isSaving,
    wordCount,
    charCount,
    buttonStates,
    shouldBlinkDropdown,
    typeChangeConfirmation,
    shouldFocusTitle,
    handlers: {
      handleTitleChange,
      handleTitleKeyDown,
      handleContentChange,
      handleKeyDown,
      handleKeyUp,
      handlePaste,
      handleMouseUp,
      handleTypeChange,
      confirmTypeChange,
      cancelTypeChange,
      toggleHeading,
      smartFormat,
      toggleList,
    },
  };
};
