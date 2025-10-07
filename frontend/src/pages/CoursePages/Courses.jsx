import React, { useEffect, useState, useCallback, useRef } from "react";
import CourseCard from "../../components/CourseCard";
import PageFilters from "../../components/page-filters";

// Simple debounce hook
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch courses (fixed version)
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
      if (sortOrder) params.append("sort", sortOrder);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch courses");

      const data = await res.json();

      // ✅ Expect backend response shape: { courses, totalCount }
      const fetchedCourses = data.courses || [];
      const totalCount = data.totalCount || 0;

      setCourses(fetchedCourses);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));

      // ✅ Collect all unique tags for filter dropdown
      const tagsSet = new Set();
      fetchedCourses.forEach((course) => {
        if (Array.isArray(course.tags)) {
          course.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setAllTags([...tagsSet]);

      setHasFetched(true);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, sortOrder, selectedTags, currentPage]);

  const debouncedFetch = useDebounce(fetchCourses, 400);

  // Run fetch on filter/sort/pagination change
  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch, search, sortOrder, selectedTags, currentPage]);

  const handlePageChange = (page) => {
    if (page !== currentPage) setCurrentPage(page);
  };

  const handleTagClickFromCard = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setSearch(""); // optional: clear search when clicking tag
  };

  // 🟡 Loading state
  if (loading && !hasFetched) {
    return <p className="text-center text-gray-500 mt-10">Loading courses...</p>;
  }

  // 🔴 Error state
  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Available Courses</h1>

      {/* Filters */}
      <PageFilters
        search={search}
        setSearch={setSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        allTags={allTags}
      />

      {/* Courses Grid */}
      {!loading && hasFetched && courses.length === 0 ? (
        <p className="text-gray-600 mt-6">No courses match your filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onTagClick={handleTagClickFromCard}
                selectedTags={selectedTags}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="btn-group">
                <button
                  className="btn"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn ${currentPage === i + 1 ? "btn-active" : ""}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn"
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Courses;
