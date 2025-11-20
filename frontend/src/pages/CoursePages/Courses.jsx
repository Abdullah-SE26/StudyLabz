import React, { useEffect, useState, useCallback, useRef } from "react";
import CourseCard from "../../components/CourseCard.jsx";
import PageFilters from "../../components/PageFilters";
import EditCourseModal from "../../components/UpdateCourseModal";
import DeleteCourseModal from "../../components/DeleteCourseModal";
import Pagination from "../../components/Pagination.jsx";
import axios from "../../../lib/axios.js";

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

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalType, setModalType] = useState(null); // "edit" or "delete"
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all tags
  useEffect(() => {
    const controller = new AbortController();
    const fetchTags = async () => {
      try {
        const res = await axios.get("/courses/tags", { signal: controller.signal });
        setAllTags(res.data.tags || []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Error fetching tags:", err);
          setAllTags([]);
        }
      }
    };
    fetchTags();
    return () => controller.abort();
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));
      if (sortOrder) params.append("sort", sortOrder);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const res = await axios.get(`/courses?${params.toString()}`, { signal: controller.signal });
      const data = res.data;

      setCourses(data.courses || []);
      setTotalPages(Math.ceil((data.totalCount || 0) / itemsPerPage));
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error(err);
        setError(err?.response?.data?.error || err.message || "Failed to load courses.");
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
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
    setCurrentPage(1);
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
          <span className="loading loading-bars loading-xl text-info bg-sf-green"></span>
        </div>
      )}

      {error && <p className="text-center text-red-500 mt-10">{error}</p>}

      {!loading && !error && (
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
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
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

      {modalType === "edit" && selectedCourse && (
        <EditCourseModal
          course={selectedCourse}
          onClose={closeModal}
          onUpdated={handleCourseSaved}
        />
      )}

      {modalType === "delete" && selectedCourse && (
        <DeleteCourseModal
          show={modalType === "delete"}
          onClose={closeModal}
          onConfirm={async () => {
            setDeleteLoading(true);
            try {
              await axios.delete(`/courses/${selectedCourse.id}`);
              handleCourseDeleted(selectedCourse.id);
            } catch (err) {
              console.error(err);
              // Assuming toast is available globally or imported
              // toast.error(err?.response?.data?.message || "Failed to delete course");
            } finally {
              setDeleteLoading(false);
            }
          }}
          title="Delete Course"
          message={`Are you sure you want to delete "${selectedCourse.title || selectedCourse.name}"? This action cannot be undone.`}
          loading={deleteLoading}
          courseName={selectedCourse.title || selectedCourse.name}
        />
      )}
    </div>
  );
};

export default Courses;
