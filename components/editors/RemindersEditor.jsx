"use client";
import React, { useState, useEffect, useRef } from "react";

import "../../styles/RemindersEditor.css";
import {
  Plus,
  X,
  Bell,
  Clock,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";

const RemindersEditor = ({ content, onContentChange }) => {
  const [reminders, setReminders] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(null);
  const datePickerRef = useRef(null);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (
      content &&
      typeof content === "object" &&
      content.reminders &&
      Array.isArray(content.reminders)
    ) {
      setReminders(content.reminders);
    } else {
      const initialReminder = {
        id: generateId(),
        text: "",
        datetime: "",
        completed: false,
        priority: "medium",
      };
      setReminders([initialReminder]);
    }
  }, [content]);

  useEffect(() => {
    if (reminders.length > 0) {
      onContentChange({ reminders });
    }
  }, [reminders, onContentChange]);

  const addReminder = () => {
    const newReminder = {
      id: generateId(),
      text: "",
      datetime: "",
      completed: false,
      priority: "medium",
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const removeReminder = (id) => {
    if (reminders.length <= 1) return;
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
  };

  const updateReminder = (id, updates) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    );
  };

  const toggleComplete = (id) => {
    updateReminder(id, {
      completed: !reminders.find((r) => r.id === id)?.completed,
    });
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reminderDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (reminderDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`;
    } else if (
      reminderDate.getTime() ===
      today.getTime() + 24 * 60 * 60 * 1000
    ) {
      return `Tomorrow at ${timeStr}`;
    } else if (
      reminderDate.getTime() ===
      today.getTime() - 24 * 60 * 60 * 1000
    ) {
      return `Yesterday at ${timeStr}`;
    } else {
      return `${date.toLocaleDateString()} at ${timeStr}`;
    }
  };

  const getReminderStatus = (reminder) => {
    if (reminder.completed) return "completed";
    if (!reminder.datetime) return "no-time";

    const now = new Date();
    const reminderTime = new Date(reminder.datetime);

    if (reminderTime < now) return "overdue";
    if (reminderTime - now < 60 * 60 * 1000) return "soon";
    return "pending";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <Check size={14} />;
      case "overdue":
        return <AlertCircle size={14} />;
      case "soon":
        return <Clock size={14} />;
      default:
        return <Bell size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981";
      case "overdue":
        return "#ef4444";
      case "soon":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const handleDateTimeChange = (id, value) => {
    updateReminder(id, { datetime: value });
    setShowDatePicker(null);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(null);
      }
    };

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    if (a.datetime && b.datetime) {
      return new Date(a.datetime) - new Date(b.datetime);
    }

    if (a.datetime && !b.datetime) return -1;
    if (!a.datetime && b.datetime) return 1;

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="reminders-editor">
      <div className="reminders-list">
        {sortedReminders.map((reminder) => {
          const status = getReminderStatus(reminder);
          const statusColor = getStatusColor(status);

          return (
            <div
              key={reminder.id}
              className={`reminder-item ${status} ${
                reminder.completed ? "completed" : ""
              }`}
            >
              <button
                className="reminder-checkbox"
                onClick={() => toggleComplete(reminder.id)}
                style={{ color: statusColor }}
                title={
                  reminder.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                {getStatusIcon(status)}
              </button>

              <div className="reminder-content">
                <input
                  type="text"
                  value={reminder.text}
                  onChange={(e) =>
                    updateReminder(reminder.id, { text: e.target.value })
                  }
                  placeholder="Enter reminder..."
                  className={`reminder-input ${
                    reminder.completed ? "completed" : ""
                  }`}
                />

                <div className="reminder-meta">
                  <div className="reminder-datetime">
                    {reminder.datetime ? (
                      <span
                        className="datetime-display"
                        style={{ color: statusColor }}
                      >
                        {formatDateTime(reminder.datetime)}
                      </span>
                    ) : (
                      <span className="no-datetime">No time set</span>
                    )}
                    <button
                      className="datetime-btn"
                      onClick={() =>
                        setShowDatePicker(
                          showDatePicker === reminder.id ? null : reminder.id
                        )
                      }
                      title="Set date and time"
                    >
                      <Calendar size={12} />
                    </button>
                  </div>

                  <select
                    value={reminder.priority}
                    onChange={(e) =>
                      updateReminder(reminder.id, { priority: e.target.value })
                    }
                    className="priority-select"
                    title="Set priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {showDatePicker === reminder.id && (
                  <div className="datetime-picker" ref={datePickerRef}>
                    <input
                      type="datetime-local"
                      value={reminder.datetime}
                      onChange={(e) =>
                        handleDateTimeChange(reminder.id, e.target.value)
                      }
                      min={getCurrentDateTime()}
                      className="datetime-input"
                    />
                    <div className="datetime-actions">
                      <button
                        className="datetime-action-btn clear"
                        onClick={() => handleDateTimeChange(reminder.id, "")}
                      >
                        Clear
                      </button>
                      <button
                        className="datetime-action-btn close"
                        onClick={() => setShowDatePicker(null)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {reminders.length > 1 && (
                <button
                  className="remove-reminder-btn"
                  onClick={() => removeReminder(reminder.id)}
                  title="Remove reminder"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="reminders-actions">
        <button
          className="add-reminder-btn"
          onClick={addReminder}
          title="Add reminder"
        >
          <Plus size={14} />
          <span>Add Reminder</span>
        </button>
      </div>
    </div>
  );
};

export default RemindersEditor;
