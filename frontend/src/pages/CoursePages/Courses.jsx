import React, { useEffect, useState, useCallback, useRef } from "react";
import CourseCard from "../../components/CourseCard";
import PageFilters from "../../components/page-filters";
import Pagination from "../../components/pagination";

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

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedTags.length > 0)
        params.append("tags", selectedTags.join(","));
      if (sortOrder) params.append("sort", sortOrder);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/courses?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to fetch courses");

      const data = await res.json();

      // ✅ Expect backend response: { courses, totalCount }
      const fetchedCourses = data.courses || [];
      const totalCount = data.totalCount || 0;

      setCourses(fetchedCourses);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));

      // ✅ Collect all unique tags
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

  useEffect(() => {
    debouncedFetch();
  }, [debouncedFetch, search, sortOrder, selectedTags, currentPage]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTagClickFromCard = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setSearch("");
  };
// 🟡 Loading state
if (loading && !hasFetched) {
  return (
    <div className="flex flex-col items-center justify-center mt-10 gap-4">
      <span className="loading loading-bars loading-xl text-info"></span>
    </div>
  );
}


  // 🔴 Error state
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Available Courses
      </h1>

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
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Courses;
