"use client";
import React from "react";
import NoteTypeDropdown from "../widgets/NoteTypeDropdown";
import ConfirmationDialog from "../common/ConfirmationDialog";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  Minus,
} from "lucide-react";
import { useRichTextEditor } from "../../hooks/useRichTextEditor.js";

const RichTextEditor = ({ selectedNote, onUpdateNote }) => {
  const {
    refs: { titleInputRef, contentRef },
    title,
    isSaving,
    wordCount,
    charCount,
    buttonStates,
    shouldBlinkDropdown,
    typeChangeConfirmation,
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
  } = useRichTextEditor({ selectedNote, onUpdateNote });

  const noteType = selectedNote?.type || "RICH_TEXT";

  const formatActions = [
    {
      icon: Bold,
      action: () => smartFormat("bold"),
      title: "Bold (Ctrl+B)",
      isActive: () => buttonStates.bold,
      type: "smart",
    },
    {
      icon: Italic,
      action: () => smartFormat("italic"),
      title: "Italic (Ctrl+I)",
      isActive: () => buttonStates.italic,
      type: "smart",
    },
    {
      icon: Underline,
      action: () => smartFormat("underline"),
      title: "Underline (Ctrl+U)",
      isActive: () => buttonStates.underline,
      type: "smart",
    },
    {
      icon: Minus,
      action: () => smartFormat("strikeThrough"),
      title: "Strikethrough",
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
      title: "Heading",
      isActive: () => buttonStates.heading,
      type: "toggle",
    },
  ];

  return (
    <>
      <div className="formatting-toolbar-container">
        <div className="formatting-toolbar">
          <NoteTypeDropdown
            selectedType={noteType}
            onTypeChange={handleTypeChange}
            disabled={!selectedNote}
            shouldBlink={shouldBlinkDropdown}
          />

          <div className="toolbar-separator"></div>

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

      <div className="editor-status-container">
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      </div>

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

export default RichTextEditor;
