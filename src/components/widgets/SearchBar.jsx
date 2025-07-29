import React, { useRef } from "react";

import { Search, X } from "lucide-react";

const SearchBar = ({ searchTerm, onSearchChange, onClear }) => {
  const searchInputRef = useRef(null);

  const handleClear = () => {
    onClear();
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
