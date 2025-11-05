import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Search,
  Check,
} from "lucide-react";

const PageFilters = ({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
  selectedTags,
  setSelectedTags,
  allTags = [],
}) => {
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const sortRef = useRef(null);
  const tagRef = useRef(null);

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sortRef.current &&
        !sortRef.current.contains(e.target) &&
        tagRef.current &&
        !tagRef.current.contains(e.target)
      ) {
        setSortDropdownOpen(false);
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Close dropdowns on scroll
  useEffect(() => {
    const closeOnScroll = () => {
      setSortDropdownOpen(false);
      setTagDropdownOpen(false);
    };
    window.addEventListener("scroll", closeOnScroll);
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, []);

  // ✅ Filter tags for search
  const filteredTags = useMemo(() => {
    if (!Array.isArray(allTags)) return [];
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [allTags, tagSearch]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSortOrder("latest");
    setSelectedTags([]);
  };

  const sortOptions = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "Name A-Z", value: "name_asc" },
    { label: "Name Z-A", value: "name_desc" },
  ];

  const selectedSortLabel =
    sortOptions.find((opt) => opt.value === sortOrder)?.label || "Sort";

  const showClearButton =
    (sortOrder && sortOrder !== "latest") || selectedTags.length > 0 || search;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative">
      {/* LEFT — Search Bar */}
      <div className="flex items-center gap-2 flex-1 min-w-[220px]">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white pl-10 pr-10 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          {search && (
            <X
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer transition"
            />
          )}
        </div>
      </div>

      {/* RIGHT — Filters */}
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition font-medium ${
              sortOrder && sortOrder !== "latest"
                ? "border-blue-500 text-blue-600"
                : "border-gray-300 text-gray-700"
            } hover:bg-blue-500 hover:text-white`}
            onClick={() => {
              setSortDropdownOpen(!sortDropdownOpen);
              setTagDropdownOpen(false);
            }}
          >
            {sortOrder?.includes("desc") ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
            {selectedSortLabel}
            <ChevronDown className="w-4 h-4" />
          </button>

          {sortDropdownOpen && (
            <ul className="absolute right-0 mt-2 z-50 backdrop-blur-md bg-white/90 border border-gray-200 shadow-lg rounded-xl w-48 p-2 animate-fadeIn">
              {sortOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={`flex justify-between w-full items-center rounded-md px-3 py-2 text-sm transition ${
                      sortOrder === option.value
                        ? "bg-blue-500 text-white"
                        : "hover:bg-blue-100"
                    }`}
                    onClick={() => {
                      setSortOrder(option.value);
                      setSortDropdownOpen(false);
                    }}
                  >
                    {option.label}
                    {sortOrder === option.value && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tags Dropdown */}
        <div className="relative" ref={tagRef}>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border cursor-pointer transition font-medium ${
              selectedTags.length > 0
                ? "border-blue-500 text-blue-600"
                : "border-gray-300 text-gray-700"
            } hover:bg-blue-500 hover:text-white`}
            onClick={() => {
              setTagDropdownOpen(!tagDropdownOpen);
              setSortDropdownOpen(false);
            }}
          >
            <Filter className="w-4 h-4" />
            Tags ({selectedTags.length})
            <ChevronDown className="w-4 h-4" />
          </button>

          {tagDropdownOpen && (
            <div className="absolute right-0 mt-2 z-50 backdrop-blur-md bg-white/90 border border-gray-200 shadow-lg rounded-xl w-64 p-3 animate-fadeIn">
              {/* Search inside Tags */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-9 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Scrollable list */}
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {filteredTags.length ? (
                  filteredTags.map((tag, idx) => (
                    <li key={idx}>
                      <div
                        onClick={() => toggleTag(tag)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-sm cursor-pointer transition ${
                          selectedTags.includes(tag)
                            ? "bg-blue-500 text-white"
                            : "hover:bg-blue-100"
                        }`}
                      >
                        <span>{tag}</span>
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="checkbox checkbox-sm pointer-events-none"
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500 px-2 py-1">
                    No tags found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* ✅ Show Clear only when filters/search active */}
        {showClearButton && (
          <button
            onClick={clearFilters}
            className="text-sm flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-blue-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="w-full mt-2 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <div
              key={tag}
              className="badge badge-outline flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <X className="w-3 h-3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageFilters;
