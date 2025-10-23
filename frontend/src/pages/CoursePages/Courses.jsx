import React, { useEffect, useState, useCallback, useRef } from "react";
import CourseCard from "../../components/course-card";
import PageFilters from "../../components/page-filters";
import Pagination from "../../components/pagination";
import EditCourseModal from "../../components/UpdateCourseModal";
import DeleteCourseModal from "../../components/DeleteCourseModal";

// Debounce hook
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

const Courses = ({ isAdminMode = false }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);

  // Admin modals
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalType, setModalType] = useState(null); // "edit" or "delete"

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

      setCourses(data.courses || []);
      setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));

      const tagsSet = new Set();
      (data.courses || []).forEach((course) =>
        course.tags?.forEach((tag) => tagsSet.add(tag))
      );
      setAllTags([...tagsSet]);

      setError(null);
    } catch (err) {
      console.error(err);
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
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTagClickFromCard = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setSearch("");
  };

  const handleCourseSaved = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
    );
    setSelectedCourse(null);
    setModalType(null);
  };

  const handleCourseDeleted = (deletedId) => {
    setCourses((prev) => prev.filter((c) => c.id !== deletedId));
    setSelectedCourse(null);
    setModalType(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setModalType("edit");
  };

  const openDeleteModal = (course) => {
    setSelectedCourse(course);
    setModalType("delete");
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setModalType(null);
  };

  return (
    <div className="p-6 relative z-0">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Available Courses
      </h1>

      <PageFilters
        search={search}
        setSearch={setSearch}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        allTags={allTags}
      />

      {loading && (
        <div className="flex flex-col items-center justify-center mt-10 gap-4">
          <span className="loading loading-bars loading-xl text-info"></span>
        </div>
      )}

      {error && <p className="text-center text-red-500 mt-10">{error}</p>}

      {!loading && (
        <>
          {courses.length === 0 ? (
            <p className="text-gray-600 mt-6">No courses match your filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onTagClick={handleTagClickFromCard}
                  selectedTags={selectedTags}
                  isAdminMode={isAdminMode}
                  onEdit={() => openEditModal(course)}
                  onDelete={() => openDeleteModal(course)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />

      {/* Modals */}
      {modalType === "edit" && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={closeModal}
          onUpdated={handleCourseSaved}
        />
      )}

      {modalType === "delete" && selectedCourse && (
        <DeleteCourseModal
          course={selectedCourse}
          onClose={closeModal}
          onDeleted={() => handleCourseDeleted(selectedCourse.id)}
        />
      )}
    </div>
  );
};

export default Courses;
