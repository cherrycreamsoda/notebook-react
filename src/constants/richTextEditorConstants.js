/**
 * Rich Text Editor Constants
 * Centralized constants for rich text editor functionality
 */

export const DEFAULT_BUTTON_STATES = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false,
  heading: false,
};

export const NAVIGATION_KEYS = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
];

export const KEYBOARD_SHORTCUTS = {
  b: "bold",
  i: "italic",
  u: "underline",
};

export const FORMATTING_COMMANDS = {
  BOLD: "bold",
  ITALIC: "italic",
  UNDERLINE: "underline",
  STRIKE_THROUGH: "strikeThrough",
  UNORDERED_LIST: "insertUnorderedList",
  ORDERED_LIST: "insertOrderedList",
  HEADING: "formatBlock",
};

export const RICH_TEXT_PLACEHOLDER = "Start writing your note...";

export const TYPING_DEBOUNCE_DELAY = 200;
export const BUTTON_STATE_DEBOUNCE_DELAY = 150;
