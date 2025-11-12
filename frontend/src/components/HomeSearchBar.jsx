import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import axios from "../../lib/axios.js"; 
import CourseCard from "../components/CourseCard.jsx";

// Debounce hook
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

export default function HomeSearchBar() {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setCourses([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append("search", searchTerm);
      params.append("limit", 6);

      const res = await axios.get(`/courses?${params.toString()}`);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useDebounce(fetchCourses, 300);

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  return (
    <div className="relative w-full z-10">
      {/* Search bar container with merged strip */}
      <div className="max-w-8xl mx-auto bg-sf-green rounded-b-3xl shadow-lg p-12 flex flex-col items-center">
        
        {/* Title with animated search icon */}
        <h2 className="flex items-center justify-center text-2xl md:text-3xl font-bold text-sf-cream mb-6">
          Search Courses
          <Search className="w-8 h-7 ml-1 text-sf-cream bounce-slow" />
        </h2>

        {/* Search input */}
        <div className="relative w-full max-w-3xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-5 text-gray-700 pointer-events-none">
            <Search className="w-6 h-6" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type course name..."
            className="w-full pl-14 pr-5 py-4 rounded-full border-none bg-sf-cream focus:ring-2 focus:ring-sf-green focus:outline-none font-semibold text-sf-text placeholder:text-gray-500 shadow-md hover:shadow-lg transition-shadow duration-200 text-lg"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center mt-4">
            <span className="loading loading-bars loading-md text-sf-text"></span>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {/* Course cards */}
        {query.trim() && courses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6 w-full">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* No results */}
        {query.trim() && !loading && courses.length === 0 && (
          <p className="text-gray-600 mt-4 text-center">No courses found.</p>
        )}
      </div>
    </div>
  );
}
