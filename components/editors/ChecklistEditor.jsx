"use client";
import React, { useState, useEffect, useRef } from "react";

import "../../styles/ChecklistEditor.css";
import { Plus, X, GripVertical } from "lucide-react";

const ChecklistEditor = ({ content, onContentChange }) => {
  const [items, setItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const inputRefs = useRef({});

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (
      content &&
      typeof content === "object" &&
      content.items &&
      Array.isArray(content.items)
    ) {
      setItems(content.items);
    } else {
      const initialItem = { id: generateId(), text: "", checked: false };
      setItems([initialItem]);
    }
  }, [content]);

  useEffect(() => {
    if (items.length > 0) {
      onContentChange({ items });
    }
  }, [items, onContentChange]);

  const addItem = (index = -1) => {
    const newItem = { id: generateId(), text: "", checked: false };
    const newItems = [...items];

    if (index === -1) {
      newItems.push(newItem);
    } else {
      newItems.splice(index + 1, 0, newItem);
    }

    setItems(newItems);

    setTimeout(() => {
      const input = inputRefs.current[newItem.id];
      if (input) {
        input.focus();
      }
    }, 50);
  };

  const removeItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id, updates) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const toggleCheck = (id) => {
    updateItem(id, { checked: !items.find((item) => item.id === id)?.checked });
  };

  const handleKeyDown = (e, id, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(index);
    } else if (
      e.key === "Backspace" &&
      e.target.value === "" &&
      items.length > 1
    ) {
      e.preventDefault();
      removeItem(id);
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        const prevItem = items[prevIndex];
        setTimeout(() => {
          const input = inputRefs.current[prevItem.id];
          if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }
        }, 50);
      }
    }
  };

  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem || draggedItem.index === dropIndex) {
      setDraggedItem(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedItem.index, 1);
    newItems.splice(dropIndex, 0, removed);

    setItems(newItems);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="checklist-editor">
      <div className="checklist-items">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`checklist-item ${item.checked ? "checked" : ""} ${
              dragOverIndex === index ? "drag-over" : ""
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, item, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="item-drag-handle">
              <GripVertical size={14} />
            </div>

            <button
              className={`item-checkbox ${item.checked ? "checked" : ""}`}
              onClick={() => toggleCheck(item.id)}
            >
              <div className="checkbox-tick"></div>
            </button>

            <input
              ref={(el) => (inputRefs.current[item.id] = el)}
              type="text"
              value={item.text || ""}
              onChange={(e) => updateItem(item.id, { text: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, item.id, index)}
              placeholder="Add an item..."
              className={`item-input ${item.checked ? "checked" : ""}`}
            />

            <button
              className="item-add-btn"
              onClick={() => addItem(index)}
              title="Add item below"
            >
              <Plus size={14} />
            </button>

            {items.length > 1 && (
              <button
                className="item-remove-btn"
                onClick={() => removeItem(item.id)}
                title="Remove item"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistEditor;
