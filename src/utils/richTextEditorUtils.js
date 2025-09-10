/**
 * Rich Text Editor Utilities
 * Helper functions for rich text content processing
 */

export const extractPlainText = (html) => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

export const getWordCharCount = (text) => {
  const trimmedText = text.trim();
  const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
  const chars = text.length;
  return { words, chars };
};

export const hasRichTextContent = (content) => {
  if (!content) return false;
  if (typeof content === "string") {
    const plainText = extractPlainText(content);
    return plainText.trim().length > 0;
  }
  return false;
};

export const isEmptyRichText = (content) => {
  if (!content) return true;
  if (typeof content === "string") {
    const plainText = extractPlainText(content);
    return plainText.trim().length === 0;
  }
  return true;
};

export const sanitizeRichTextContent = (content) => {
  if (!content || typeof content !== "string") return "";

  // Remove any potentially harmful scripts or styles
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Remove script tags
  const scripts = tempDiv.querySelectorAll("script");
  scripts.forEach((script) => script.remove());

  // Remove style attributes that could break layout
  const allElements = tempDiv.querySelectorAll("*");
  allElements.forEach((el) => {
    el.removeAttribute("style");
    el.removeAttribute("onclick");
    el.removeAttribute("onload");
  });

  return tempDiv.innerHTML;
};
