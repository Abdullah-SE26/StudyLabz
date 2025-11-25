import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";
import Pagination from "../../components/Pagination";
import AIDrawer from "../../components/AIDrawer";
import axios from "../../../lib/axios.js";

import QuestionCardSkeleton from "../../components/QuestionCardSkeleton";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const ASSESSMENT_TYPES = [
  "Midterm",
  "Final",
  "Quiz 1",
  "Quiz 2",
  "Additional Quiz",
];

const CourseQuestions = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const setShouldRefetchDashboard = useStore(
    (state) => state.setShouldRefetchDashboard
  );

  const [courseName, setCourseName] = useState(
    location.state?.courseName || "Loading..."
  );
  const [questions, setQuestions] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const activeRequestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCourse = async () => {
      try {
        if (!authToken) return;
        const { data } = await axios.get(`/courses/${courseId}`, {
          signal: controller.signal,
        });
        setCourseName(data?.course?.name || "Course");
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(
            err.message ||
              err?.response?.data?.error ||
              "Failed to load course information."
          );
        }
      }
    };

    fetchCourse();
    return () => controller.abort();
  }, [authToken, courseId]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const requestId = ++activeRequestIdRef.current;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        if (!authToken) {
          throw new Error("You must be logged in to view questions.");
        }

        setError("");
        const queryParams = {
          page,
          limit: 10,
          sort: sortOrder,
        };
        if (selectedTypes.length) {
          queryParams.examType = selectedTypes.join(",");
        }
        const query = new URLSearchParams(queryParams).toString();
        const { data } = await axios.get(
          `/questions/courses/${courseId}/questions?${query}`,
          { signal }
        );

        if (requestId === activeRequestIdRef.current) {
          setQuestions(data?.data || []);
          setTotalPages(data?.totalPages || 1);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && requestId === activeRequestIdRef.current) {
          setError(
            err.message ||
              err?.response?.data?.error ||
              "Failed to load course questions."
          );
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
    return () => controller.abort();
  }, [authToken, courseId, page, sortOrder, selectedTypes]);

  // Like / Bookmark Handlers
  const toggleLike = async (qId) => {
    if (!user?.id)
      return toast.error("You must be logged in to like questions.");
    if (!questions) return;
    const prev = [...questions];
    const updatedQs = questions.map((q) =>
      q.id === qId
        ? {
            ...q,
            likedBy: q.likedBy.some((u) => u.id === user.id)
              ? q.likedBy.filter((u) => u.id !== user.id)
              : [...q.likedBy, { id: user.id }],
          }
        : q
    );
    setQuestions(updatedQs);
    try {
      const { data } = await axios.post(`/questions/${qId}/like`);
      setQuestions((qs) => qs.map((q) => (q.id === qId ? data.data : q)));
    } catch {
      setQuestions(prev);
      toast.error("Failed to sync like with server.");
    }
  };

  const toggleBookmark = async (qId) => {
    if (!user?.id)
      return toast.error("You must be logged in to bookmark questions.");
    if (!questions) return;

    const prev = [...questions];
    const questionToBookmark = questions.find((q) => q.id === qId);
    if (!questionToBookmark) return;

    const isBookmarked = questionToBookmark.bookmarkedBy.some(
      (u) => u.id === user.id
    );

    // Optimistic UI
    const updatedQs = questions.map((q) =>
      q.id === qId
        ? {
            ...q,
            bookmarkedBy: isBookmarked
              ? q.bookmarkedBy.filter((u) => u.id !== user.id)
              : [...q.bookmarkedBy, { id: user.id }],
          }
        : q
    );
    setQuestions(updatedQs);

    toast.success(
      !isBookmarked
        ? "Question added to bookmarks."
        : "Question removed from bookmarks."
    );
    setShouldRefetchDashboard(true);

    try {
      await axios.post(`/questions/${qId}/bookmark`);
    } catch {
      setQuestions(prev);
      toast.error("Failed to sync bookmark with server.");
    }
  };

  const handleTypeToggle = (type) => {
    setPage(1);
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setPage(1);
  };

  // Handle AI drawer opening - replaces current question if drawer is already open
  const handleSolveWithAI = (formattedQuestion) => {
    setCurrentQuestion(formattedQuestion);
    setAiDrawerOpen(true);
  };

  const filteredQuestions =
    questions && selectedTypes.length > 0
      ? questions.filter((q) => selectedTypes.includes(q.examType))
      : questions;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Course Title */}
      <div className="text-center">
        {courseName === "Loading..." ? (
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
        ) : (
          <h2 className="text-2xl font-semibold mb-4 text-theme">
            {courseName} Questions
          </h2>
        )}
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-3 items-center mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
          {ASSESSMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 cursor-pointer ${
                selectedTypes.includes(type)
                  ? "bg-[#D2B48C] text-white border-[#D2B48C]"
                  : "bg-[#FFF8E0] text-[#5C4A3D] border border-[#E0CFA6]"
              }`}
            >
              {type}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0CFA6] bg-white text-[#5C4A3D] hover:bg-[#F8EFD4] transition text-sm cursor-pointer"
            >
              ✕ Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <label className="text-sm font-medium text-theme">Sort:</label>
          <select
            className="select select-sm border border-[#E0CFA6] bg-white text-theme"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              setPage(1);
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Section */}
      <div className="space-y-6">
        {error && <p className="text-center text-red-500 mt-4">{error}</p>}

        {(loading || questions === null) && !error && (
          <>
            {[...Array(3)].map((_, i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </>
        )}

        {!loading && !error && questions !== null && (
          <>
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <QuestionCard
                  key={q.id || q._id}
                  question={q}
                  onToggleLike={() => toggleLike(q.id)}
                  onToggleBookmark={() => toggleBookmark(q.id)}
                  onSolveWithAI={handleSolveWithAI}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-gray-500">No questions found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {totalPages > 1 && !loading && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            handlePageChange={setPage}
          />
        </div>
      )}

      {/* Single Shared AI Drawer */}
      <AIDrawer
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        question={currentQuestion}
        key={currentQuestion} // Force reset when question changes
      />
    </div>
  );
};

export default CourseQuestions;
