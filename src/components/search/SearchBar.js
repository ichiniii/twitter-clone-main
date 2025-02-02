import React from "react";
import "./SearchBar.css";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="searchBar">
      <input
        type="text"
        placeholder="タグで検索 (例: #React)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
