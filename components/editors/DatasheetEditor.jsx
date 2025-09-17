"use client";
import React, { useState, useEffect, useRef } from "react";

import "../../styles/DatasheetEditor.css";
import { Plus, X, Calendar, Clock } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DatasheetEditor = ({ content, onContentChange }) => {
  const [data, setData] = useState({
    columns: [
      { id: "title", name: "Title", type: "text", width: "flex" },
      { id: "amount", name: "Amount", type: "number", width: "120px" },
      { id: "datetime", name: "Date & Time", type: "datetime", width: "200px" },
    ],
    rows: [],
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null);
  const [tempDateValue, setTempDateValue] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const cellRefs = useRef({});
  const inputRef = useRef(null);
  const datePickerRef = useRef(null);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (content && typeof content === "object" && content.rows) {
      setData((prev) => ({
        ...prev,
        rows: content.rows || [],
      }));
      setIsInitialLoad(false);
    } else {
      const initialRow = {
        id: generateId(),
        cells: [
          { columnId: "title", value: "" },
          { columnId: "amount", value: "" },
          { columnId: "datetime", value: "" },
        ],
      };
      setData((prev) => ({
        ...prev,
        rows: [initialRow],
      }));

      setTimeout(() => {
        setSelectedCell({ rowId: initialRow.id, columnId: "title" });
        setEditingCell({ rowId: initialRow.id, columnId: "title" });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [content]);

  useEffect(() => {
    if (!isInitialLoad && data.rows.length > 0) {
      onContentChange({
        columns: data.columns,
        rows: data.rows,
      });
    }
  }, [data, onContentChange, isInitialLoad]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      if (editingCell.columnId !== "datetime") {
        inputRef.current.select();
      }
    }
  }, [editingCell]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showDatePicker &&
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target)
      ) {
        setShowDatePicker(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDatePicker]);

  const addRow = (afterRowIndex = -1) => {
    const newRow = {
      id: generateId(),
      cells: [
        { columnId: "title", value: "" },
        { columnId: "amount", value: "" },
        { columnId: "datetime", value: "" },
      ],
    };

    setData((prev) => {
      const newRows = [...prev.rows];
      if (afterRowIndex === -1) {
        newRows.push(newRow);
      } else {
        newRows.splice(afterRowIndex + 1, 0, newRow);
      }
      return { ...prev, rows: newRows };
    });

    return newRow.id;
  };

  const removeRow = (rowId) => {
    if (data.rows.length <= 1) return;

    setData((prev) => ({
      ...prev,
      rows: prev.rows.filter((row) => row.id !== rowId),
    }));

    if (selectedCell?.rowId === rowId) {
      setSelectedCell(null);
      setEditingCell(null);
    }
  };

  const updateCell = (rowId, columnId, value) => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              cells: row.cells.map((cell) =>
                cell.columnId === columnId ? { ...cell, value } : cell
              ),
            }
          : row
      ),
    }));
  };

  const getCellValue = (rowId, columnId) => {
    const row = data.rows.find((r) => r.id === rowId);
    if (!row) return "";
    const cell = row.cells.find((c) => c.columnId === columnId);
    return cell ? cell.value : "";
  };

  const handleCellClick = (rowId, columnId) => {
    setSelectedCell({ rowId, columnId });
    setEditingCell({ rowId, columnId });
    setShowDatePicker(null);

    if (columnId === "datetime") {
      const currentValue = getCellValue(rowId, columnId);
      setTempDateValue(currentValue);
    }
  };

  const handleCellKeyDown = (e, rowId, columnId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell(null);
      setShowDatePicker(null);

      const currentRowIndex = data.rows.findIndex((r) => r.id === rowId);
      const currentColumnIndex = data.columns.findIndex(
        (c) => c.id === columnId
      );

      if (currentColumnIndex < data.columns.length - 1) {
        const nextColumn = data.columns[currentColumnIndex + 1];
        setSelectedCell({ rowId, columnId: nextColumn.id });
        setTimeout(() => {
          setEditingCell({ rowId, columnId: nextColumn.id });
        }, 50);
      } else {
        if (currentRowIndex < data.rows.length - 1) {
          const nextRow = data.rows[currentRowIndex + 1];
          const firstColumn = data.columns[0];
          setSelectedCell({ rowId: nextRow.id, columnId: firstColumn.id });
          setTimeout(() => {
            setEditingCell({ rowId: nextRow.id, columnId: firstColumn.id });
          }, 50);
        } else {
          const newRowId = addRow();
          const firstColumn = data.columns[0];
          setTimeout(() => {
            setSelectedCell({ rowId: newRowId, columnId: firstColumn.id });
            setEditingCell({ rowId: newRowId, columnId: firstColumn.id });
          }, 100);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentRowIndex = data.rows.findIndex((r) => r.id === rowId);
      const currentColumnIndex = data.columns.findIndex(
        (c) => c.id === columnId
      );

      if (e.shiftKey) {
        if (currentColumnIndex > 0) {
          const prevColumn = data.columns[currentColumnIndex - 1];
          setSelectedCell({ rowId, columnId: prevColumn.id });
          setEditingCell({ rowId, columnId: prevColumn.id });
        } else if (currentRowIndex > 0) {
          const prevRow = data.rows[currentRowIndex - 1];
          const lastColumn = data.columns[data.columns.length - 1];
          setSelectedCell({ rowId: prevRow.id, columnId: lastColumn.id });
          setEditingCell({ rowId: prevRow.id, columnId: lastColumn.id });
        }
      } else {
        if (currentColumnIndex < data.columns.length - 1) {
          const nextColumn = data.columns[currentColumnIndex + 1];
          setSelectedCell({ rowId, columnId: nextColumn.id });
          setEditingCell({ rowId, columnId: nextColumn.id });
        } else if (currentRowIndex < data.rows.length - 1) {
          const nextRow = data.rows[currentRowIndex + 1];
          const firstColumn = data.columns[0];
          setSelectedCell({ rowId: nextRow.id, columnId: firstColumn.id });
          setEditingCell({ rowId: nextRow.id, columnId: firstColumn.id });
        }
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setSelectedCell(null);
      setShowDatePicker(null);
    }
  };

  const handleInputChange = (e, rowId, columnId) => {
    const value = e.target.value;
    updateCell(rowId, columnId, value);

    if (columnId === "datetime") {
      setTempDateValue(value);
    }
  };

  const handleInputBlur = () => {
    setEditingCell(null);
    setShowDatePicker(null);
  };

  const formatCellValue = (value, columnType) => {
    if (!value) return "";

    switch (columnType) {
      case "number":
        const num = Number.parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString();
      case "datetime":
        if (value.includes("/") || value.includes("-")) {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              const day = String(date.getDate()).padStart(2, "0");
              const month = MONTHS[date.getMonth()];
              const year = date.getFullYear();
              let hours = date.getHours();
              const minutes = String(date.getMinutes()).padStart(2, "0");
              const seconds = String(date.getSeconds()).padStart(2, "0");
              const ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12;
              hours = hours ? hours : 12;
              const formattedHours = String(hours).padStart(2, "0");
              return `${day}/${month}/${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
            }
          } catch {
            return value;
          }
        }
        return value;
      default:
        return value;
    }
  };

  const handleDatePickerClick = (rowId, columnId) => {
    setShowDatePicker({ rowId, columnId });
  };

  const handleDateSelect = (date) => {
    if (showDatePicker) {
      const { rowId, columnId } = showDatePicker;
      const formattedDate = date.toISOString();
      updateCell(rowId, columnId, formattedDate);
      setTempDateValue(formattedDate);
      setShowDatePicker(null);
    }
  };

  const generateDatePickerDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    const days = generateDatePickerDays();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return (
      <div className="date-picker-overlay">
        <div className="date-picker" ref={datePickerRef}>
          <div className="date-picker-header">
            <span>
              {MONTHS[currentMonth]} {currentYear}
            </span>
          </div>
          <div className="date-picker-weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>
          <div className="date-picker-days">
            {days.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = date.toDateString() === today.toDateString();

              return (
                <button
                  key={index}
                  className={`day ${
                    isCurrentMonth ? "current-month" : "other-month"
                  } ${isToday ? "today" : ""}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="date-picker-time">
            <button
              className="time-now-btn"
              onClick={() => handleDateSelect(new Date())}
            >
              <Clock size={14} />
              Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="datasheet-editor">
      <div className="datasheet-table">
        <div className="datasheet-header">
          {data.columns.map((column) => (
            <div
              key={column.id}
              className="datasheet-header-cell"
              style={{
                width: column.width === "flex" ? undefined : column.width,
                flex: column.width === "flex" ? "1 1 0" : `0 0 ${column.width}`,
                minWidth: column.width === "flex" ? "200px" : column.width,
              }}
            >
              <span className="header-title">{column.name}</span>
            </div>
          ))}
          <div className="datasheet-header-cell actions-header">
            <span className="header-title">Actions</span>
          </div>
        </div>

        <div className="datasheet-body">
          {data.rows.map((row, rowIndex) => (
            <div key={row.id} className="datasheet-row-container">
              <div className="datasheet-row">
                {data.columns.map((column) => {
                  const isSelected =
                    selectedCell?.rowId === row.id &&
                    selectedCell?.columnId === column.id;
                  const isEditing =
                    editingCell?.rowId === row.id &&
                    editingCell?.columnId === column.id;
                  const cellValue = getCellValue(row.id, column.id);

                  return (
                    <div
                      key={`${row.id}-${column.id}`}
                      className={`datasheet-cell ${
                        isSelected ? "selected" : ""
                      }`}
                      style={{
                        width:
                          column.width === "flex" ? undefined : column.width,
                        flex:
                          column.width === "flex"
                            ? "1 1 0"
                            : `0 0 ${column.width}`,
                        minWidth:
                          column.width === "flex" ? "200px" : column.width,
                      }}
                      onClick={() => handleCellClick(row.id, column.id)}
                      ref={(el) =>
                        (cellRefs.current[`${row.id}-${column.id}`] = el)
                      }
                    >
                      {isEditing ? (
                        <div className="cell-input-container">
                          <input
                            ref={inputRef}
                            type={column.type === "number" ? "number" : "text"}
                            value={
                              column.id === "datetime"
                                ? tempDateValue
                                : cellValue
                            }
                            onChange={(e) =>
                              handleInputChange(e, row.id, column.id)
                            }
                            onKeyDown={(e) =>
                              handleCellKeyDown(e, row.id, column.id)
                            }
                            onBlur={handleInputBlur}
                            className="cell-input"
                            placeholder={
                              column.id === "datetime"
                                ? "dd/mm/yyyy or click calendar"
                                : ""
                            }
                          />
                          {column.id === "datetime" && (
                            <button
                              className="date-picker-btn"
                              onClick={() =>
                                handleDatePickerClick(row.id, column.id)
                              }
                              type="button"
                            >
                              <Calendar size={14} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="cell-value">
                          {formatCellValue(cellValue, column.type) || ""}
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="datasheet-cell actions-cell">
                  {data.rows.length > 1 && (
                    <button
                      className="remove-row-btn"
                      onClick={() => removeRow(row.id)}
                      title="Remove row"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <button
                className="add-row-inline-btn"
                onClick={() => addRow(rowIndex)}
                title="Add row below"
              >
                <Plus size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {renderDatePicker()}
    </div>
  );
};

export default DatasheetEditor;
