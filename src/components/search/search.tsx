'use client';

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", query);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center mx-5 my-5">
      <div className="relative w-full max-w-xs">
        {/* 输入框 */}
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-l-lg 
          focus:outline-none focus:ring-1 focus:ring-slate-600 focus:border-slate-600 transition-all hover:border-gray-400 hover:border-2"
        />
        {/* 清除按钮 */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 
            hover:text-gray-700 focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* 搜索按钮 */}
      <button
        type="submit"
        className="px-4 py-2 text-sm text-white bg-blue-500 border border-blue-500 rounded-r-lg 
        focus:outline-none focus:ring-1 focus:ring-slate-600 focus:border-slate-600 transition-all hover:border-gray-400 hover:border-2"
      >
        <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
      </button>
    </form>
  );
}