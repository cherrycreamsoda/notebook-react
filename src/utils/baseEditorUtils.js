export const isContentEmpty = (content) => {
  if (!content) return true;
  if (typeof content === "string") return content.trim() === "";
  if (content.items)
    return content.items.length === 1 && !content.items[0].text;
  if (content.rows)
    return (
      content.rows.length === 1 &&
      content.rows[0].cells.every((cell) => !cell.value)
    );
  if (content.reminders)
    return content.reminders.length === 1 && !content.reminders[0].text;
  return false;
};

export const hasNoteContent = (content) => {
  if (!content) return false;
  if (typeof content === "string") return content.trim().length > 0;
  if (content.items) return content.items.some((item) => item.text?.trim());
  if (content.rows)
    return content.rows.some((row) =>
      row.cells.some((cell) => cell.value?.trim())
    );
  if (content.reminders)
    return content.reminders.some((rem) => rem.text?.trim());
  return false;
};

export const extractPlainText = (content) => {
  if (typeof content === "string") {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    return tempDiv.textContent || "";
  }

  if (content?.items) {
    return content.items.map((i) => i.text || "").join(" ");
  }

  if (content?.rows) {
    return content.rows
      .map((row) => row.cells.map((cell) => cell.value || "").join(" "))
      .join(" ");
  }

  if (content?.reminders) {
    return content.reminders.map((r) => r.text || "").join(" ");
  }

  return "";
};
