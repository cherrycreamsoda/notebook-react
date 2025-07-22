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
  const [buttonStates, setButtonStates] = useState({});
  const [hasSelection, setHasSelection] = useState(false);
  const titleInputRef = useRef(null);
  const contentRef = useRef(null);

  // Update button states in real-time
  const updateButtonStates = useCallback(() => {
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

  // Listen for selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateButtonStates();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateButtonStates]);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title || "");
      const noteContent = selectedNote.content || "";

      if (contentRef.current && isInitialLoad) {
        contentRef.current.innerHTML = noteContent;
        updateCounts(noteContent);
        setIsInitialLoad(false);
        setTimeout(updateButtonStates, 100);
      }
    } else {
      setIsInitialLoad(true);
    }
  }, [selectedNote, updateButtonStates]);

  useEffect(() => {
    setIsInitialLoad(true);
  }, [selectedNote?._id]);

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
    }
  };

  const { debouncedCallback: debouncedUpdate, cleanup } = useDebounce(
    handleUpdate,
    800
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedUpdate("title", newTitle);
  };

  const handleContentChange = () => {
    if (!contentRef.current) return;

    const htmlContent = contentRef.current.innerHTML;
    updateCounts(htmlContent);
    debouncedUpdate("content", htmlContent);
    setTimeout(updateButtonStates, 50);
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
  };

  // Smart formatting for bold/italic/underline/strikethrough
  const smartFormat = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
  };

  // List formatting (these work naturally with double-enter)
  const toggleList = (command) => {
    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
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

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <div className="note-editor">
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
            <action.icon size={16} />
          </button>
        ))}
      </div>

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
        <div
          ref={contentRef}
          contentEditable
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onMouseUp={updateButtonStates}
          onKeyUp={updateButtonStates}
          className="note-content-input"
          data-placeholder="Start writing your note..."
          suppressContentEditableWarning={true}
        />

        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
