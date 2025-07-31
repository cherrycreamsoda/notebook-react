export const extractPlainText = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  return tempDiv.textContent || tempDiv.innerText || "";
};

export const getWordCharCount = (text) => {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  return { words, chars };
};

export const hasRichTextContent = (content) => {
  if (!content) return false;
  if (typeof content === "string") return content.trim().length > 0;
  return false;
};
