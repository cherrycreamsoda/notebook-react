"use client";
import React from "react";

import EditorToolbar from "../widgets/EditorToolbar";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useBaseEditor } from "../../hooks/useBaseEditor.js";

/**
 * BaseEditor - Updated to use the new global EditorToolbar
 * Simplified toolbar management with centralized control
 */
const BaseEditor = ({
  selectedNote,
  onUpdateNote,
  children,
  showTitle = true,
  showToolbar = true,
  showStatusBar = true,
  editorClassName = "",
}) => {
  const {
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
  } = useBaseEditor({ selectedNote, onUpdateNote });

  return (
    <>
      {showToolbar && (
        <EditorToolbar
          noteType={noteType}
          selectedNote={selectedNote}
          onTypeChange={handleTypeChange}
          shouldBlinkDropdown={shouldBlinkDropdown}
        />
      )}

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
                  <div className="saving-dot" />
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

      {showStatusBar && (
        <div className="editor-status">
          <span className="word-count">{wordCount} words</span>
          <span className="char-count">{charCount} characters</span>
        </div>
      )}

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
