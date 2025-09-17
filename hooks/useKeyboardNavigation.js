"use client";

import { useEffect } from "react";

export const useKeyboardNavigation = ({
  items,
  selectedIndex,
  onIndexChange,
  onSelect,
  searchTerm,
  onSearchClear,
  searchInputRef,
  confirmDialog,
  onConfirmDialogClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (confirmDialog) {
          onConfirmDialogClose();
          return;
        }
        if (searchTerm) {
          onSearchClear();
          if (searchInputRef?.current) {
            searchInputRef.current.blur();
          }
          return;
        }
      }

      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA");

      if (isInputFocused && activeElement !== searchInputRef?.current) {
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();

        if (items.length === 0) return;

        let newIndex = selectedIndex;

        if (e.key === "ArrowUp") {
          newIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
        } else if (e.key === "ArrowDown") {
          newIndex = selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1;
        }

        onIndexChange(newIndex);
        onSelect(items[newIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedIndex,
    items,
    searchTerm,
    onIndexChange,
    onSelect,
    confirmDialog,
    onConfirmDialogClose,
    onSearchClear,
    searchInputRef,
  ]);
};
