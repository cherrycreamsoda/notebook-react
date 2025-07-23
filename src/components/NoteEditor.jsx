import React, { useState, useEffect, useRef, useCallback } from "react";
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
import NoteTypeDropdown from "./NoteTypeDropdown";
import ChecklistEditor from "./ChecklistEditor";
import ConfirmationDialog from "./ConfirmationDialog";

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
  const [shouldBlinkDropdown, setShouldBlinkDropdown] = useState(false);
  const [typeChangeConfirmation, setTypeChangeConfirmation] = useState(null);
  const [shouldFocusTitle, setShouldFocusTitle] = useState(false);
  const titleInputRef = useRef(null);
  const contentRef = useRef(null);
  const plainTextRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const cursorPositionRef = useRef(null);

  // Determine note type and content
  const noteType = selectedNote?.type || "RICH_TEXT";
  const isPlainText = noteType === "TEXT";
  const isChecklist = noteType === "CHECKLIST";
  const isRichText = noteType === "RICH_TEXT";

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

      // Focus appropriate content area based on note type
      if (isPlainText && plainTextRef.current) {
        plainTextRef.current.focus();
      } else if (isRichText && contentRef.current) {
        contentRef.current.focus();
      } else if (isChecklist) {
        // For checklist, focus the first input
        const firstInput = document.querySelector(
          ".checklist-editor .item-input"
        );
        if (firstInput) {
          firstInput.focus();
        }
      }
    }
  };

  // Save cursor position with better handling for list elements
  const saveCursorPosition = useCallback(() => {
    if (!contentRef.current) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Store more detailed cursor information
      cursorPositionRef.current = {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        // Store the parent element context for better restoration
        parentElement: range.startContainer.parentElement,
        isAtEndOfElement:
          range.startOffset === range.startContainer.textContent?.length,
      };
    }
  }, []);

  // Restore cursor position with improved list handling
  const restoreCursorPosition = useCallback(() => {
    if (!contentRef.current || !cursorPositionRef.current) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();
      const saved = cursorPositionRef.current;

      // Check if the saved nodes still exist in the DOM
      if (contentRef.current.contains(saved.startContainer)) {
        range.setStart(saved.startContainer, saved.startOffset);
        range.setEnd(saved.endContainer, saved.endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If the exact node doesn't exist, try to find a similar position
        // This is especially important for list items
        const walker = document.createTreeWalker(
          contentRef.current,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let textNode;
        let totalOffset = 0;
        const targetOffset = saved.startOffset;

        while ((textNode = walker.nextNode())) {
          if (totalOffset + textNode.textContent.length >= targetOffset) {
            range.setStart(textNode, Math.max(0, targetOffset - totalOffset));
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          }
          totalOffset += textNode.textContent.length;
        }

        // Fallback: place cursor at end
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.warn("Cursor restoration failed:", error);
      // Fallback: place cursor at end
      try {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (fallbackError) {
        console.warn("Fallback cursor placement failed:", fallbackError);
      }
    }
  }, []);

  // Debounced button state updates to prevent flickering
  const { debouncedCallback: debouncedUpdateButtonStates } = useDebounce(() => {
    if (!contentRef.current || (isTyping && !hasStartedTyping) || !isRichText)
      return;

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
    if (!contentRef.current || !isRichText) return;

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
  }, [isRichText]);

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
      if (isRichText) {
        debouncedUpdateButtonStates();
      }
    }, 200);
  };

  // Listen for selection changes (but debounced during initial typing)
  useEffect(() => {
    if (!isRichText) return;

    const handleSelectionChange = () => {
      if (!isTyping || hasStartedTyping) {
        debouncedUpdateButtonStates();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [debouncedUpdateButtonStates, isTyping, hasStartedTyping, isRichText]);

  // Handle note changes - ONLY when a new note is selected, no automatic fetching
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

        // Check if this is a newly created note that should get focus
        const isNewlyCreated =
          selectedNote.title === "New Note" &&
          (!selectedNote.content ||
            (typeof selectedNote.content === "string" &&
              selectedNote.content.trim() === "") ||
            (typeof selectedNote.content === "object" &&
              selectedNote.content.items &&
              selectedNote.content.items.length === 1 &&
              !selectedNote.content.items[0].text));

        if (isNewlyCreated) {
          setShouldFocusTitle(true);
        }

        // Handle content based on note type
        if (isPlainText) {
          // For plain text, set textarea value
          if (plainTextRef.current) {
            plainTextRef.current.value = selectedNote.content || "";
            updateCounts(selectedNote.content || "");
          }
        } else if (isRichText) {
          // For rich text, set innerHTML
          if (contentRef.current) {
            contentRef.current.innerHTML = selectedNote.content || "";
            updateCounts(selectedNote.content || "");
          }
        } else if (isChecklist) {
          // For checklist, content is handled by ChecklistEditor
          // Make sure we have a valid content structure
          const checklistContent = selectedNote.content || { items: [] };
          updateCounts(checklistContent);
        }

        setIsInitialLoad(false);

        // Initialize button states for rich text notes
        if (isRichText) {
          setTimeout(() => {
            if (contentRef.current) {
              updateButtonStatesImmediate();
            }
          }, 50);
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
    updateButtonStatesImmediate,
    isPlainText,
    isRichText,
    isChecklist,
  ]);

  const updateCounts = (content) => {
    let plainText = "";

    if (isPlainText) {
      plainText = content || "";
    } else if (isRichText) {
      // For rich text, extract plain text from HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content || "";
      plainText = tempDiv.textContent || tempDiv.innerText || "";
    } else if (isChecklist) {
      // For checklist, extract text from items
      if (content && content.items && Array.isArray(content.items)) {
        plainText = content.items.map((item) => item.text || "").join(" ");
      } else {
        plainText = "";
      }
    }

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
    1500
  ); // Increased to 1.5 seconds

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setIsUserEditing(true);
    debouncedUpdate("title", newTitle);
  };

  const handleContentChange = (newContent) => {
    if (isPlainText) {
      // Handle plain text content
      if (!plainTextRef.current) return;

      setIsUserEditing(true);
      handleTypingStart();
      const textContent = plainTextRef.current.value;
      updateCounts(textContent);
      debouncedUpdate("content", textContent);
    } else if (isRichText) {
      // Handle rich text content
      if (!contentRef.current) return;

      setIsUserEditing(true);
      handleTypingStart();
      const htmlContent = contentRef.current.innerHTML;
      updateCounts(htmlContent);
      debouncedUpdate("content", htmlContent);
    } else if (isChecklist) {
      // Handle checklist content - newContent is already the object we need
      setIsUserEditing(true);
      updateCounts(newContent);
      debouncedUpdate("content", newContent);
    }
  };

  const handleTypeChange = async (newType) => {
    if (!selectedNote || selectedNote.type === newType) return;

    // Always clear content before changing type to avoid type errors
    // First update to empty content, then change type
    await handleUpdate("content", "");

    // Set default content based on new type
    let newContent = "";
    if (newType === "CHECKLIST") {
      newContent = {
        items: [{ id: Date.now().toString(), text: "", checked: false }],
      };
    } else {
      newContent = "";
    }

    // Update the note type and content
    await handleUpdate("type", newType);
    await handleUpdate("content", newContent);

    // Trigger blink effect
    setShouldBlinkDropdown(true);
    setTimeout(() => setShouldBlinkDropdown(false), 1000);
  };

  const performTypeChange = async (newType) => {
    if (!selectedNote) return;

    // Always clear content first
    await handleUpdate("content", "");

    // Set default content based on new type
    let newContent = "";
    if (newType === "CHECKLIST") {
      newContent = {
        items: [{ id: Date.now().toString(), text: "", checked: false }],
      };
    } else {
      newContent = "";
    }

    // Update the note type and content
    await handleUpdate("type", newType);
    await handleUpdate("content", newContent);

    // Trigger blink effect
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

  // Smart heading toggle
  const toggleHeading = () => {
    if (!isRichText) return;

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
    if (!isRichText) return;

    document.execCommand(command, false, null);
    contentRef.current?.focus();
    handleContentChange();
    updateButtonStatesImmediate();
  };

  // Improved list formatting with cursor position preservation
  const toggleList = (command) => {
    if (!isRichText) return;

    // Execute the list command
    document.execCommand(command, false, null);

    // Focus back to content
    contentRef.current?.focus();

    // Place cursor at the end of the current list item
    setTimeout(() => {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Find the current list item
      let currentNode = range.startContainer;

      // Navigate up to find the LI element
      while (
        currentNode &&
        currentNode.nodeName !== "LI" &&
        currentNode !== contentRef.current
      ) {
        currentNode = currentNode.parentNode;
      }

      // If we found a list item, place cursor at the end of it
      if (currentNode && currentNode.nodeName === "LI") {
        // If the list item has a BR at the end, place cursor before it
        const lastChild = currentNode.lastChild;

        if (lastChild) {
          // Create a new range at the end of the list item content
          const newRange = document.createRange();

          if (lastChild.nodeType === Node.TEXT_NODE) {
            // If it's a text node, place cursor at the end of text
            newRange.setStart(lastChild, lastChild.textContent.length);
            newRange.setEnd(lastChild, lastChild.textContent.length);
          } else {
            // Otherwise place cursor at the end of the list item
            newRange.selectNodeContents(currentNode);
            newRange.collapse(false);
          }

          // Apply the new range
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }

      handleContentChange();
      updateButtonStatesImmediate();
    }, 10);
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
    if (!isRichText) return;

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
    if (!isRichText) return;

    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    handleContentChange();
  };

  // Handle mouse events for button state updates
  const handleMouseUp = () => {
    if (hasStartedTyping && isRichText) {
      updateButtonStatesImmediate();
    }
  };

  const handleKeyUp = (e) => {
    if (!isRichText) return;

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

  const renderEditor = () => {
    if (isChecklist) {
      return (
        <ChecklistEditor
          content={selectedNote?.content}
          onContentChange={handleContentChange}
        />
      );
    } else if (isPlainText) {
      return (
        <textarea
          ref={plainTextRef}
          onChange={handleContentChange}
          className="note-content-textarea"
          placeholder="Start writing your note..."
        />
      );
    } else {
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
          data-placeholder="Start writing your note..."
          suppressContentEditableWarning={true}
        />
      );
    }
  };

  const getEditorModeIndicator = () => {
    if (isPlainText) {
      return (
        <div className="editor-mode-indicator">
          <Type size={14} />
          <span>Plain Text Mode</span>
        </div>
      );
    } else if (isChecklist) {
      return (
        <div className="editor-mode-indicator">
          <span>Checklist Mode</span>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Formatting Toolbar - will be positioned by MainContent */}
      <div className="formatting-toolbar-container">
        <div className="formatting-toolbar">
          <NoteTypeDropdown
            selectedType={noteType}
            onTypeChange={handleTypeChange}
            disabled={!selectedNote}
            shouldBlink={shouldBlinkDropdown}
          />

          <div className="toolbar-separator"></div>

          {isRichText &&
            formatActions.map((action, index) => (
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

          {getEditorModeIndicator()}
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

        <div className="editor-container">
          <div className="content-wrapper">{renderEditor()}</div>
        </div>
      </div>

      {/* Word Count Bar - will be positioned by MainContent */}
      <div className="editor-status-container">
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      </div>

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

export default NoteEditor;
