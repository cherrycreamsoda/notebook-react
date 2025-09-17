"use client";
import { useCallback } from "react";

export const useEscapeToNotesList = (editorRef) => {
  return useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        editorRef.current?.blur();

        const noteList = document.querySelector(".notes-list");
        if (noteList && typeof noteList.focus === "function") {
          noteList.focus();
        }
      }
    },
    [editorRef]
  );
};
