import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";
import Pagination from "../../components/Pagination";
import axios from "../../../lib/axios.js";

// Skeleton for loading
const SkeletonCard = () => (
  <div className="card bg-[#FFF8E0] shadow-md border border-[#E0CFA6] p-4 space-y-3 max-w-full sm:max-w-lg mx-auto animate-pulse">
    <div className="h-4 bg-[#E0CFA6] rounded w-3/4"></div>
    <div className="h-4 bg-[#E0CFA6] rounded w-full"></div>
    <div className="h-4 bg-[#E0CFA6] rounded w-5/6"></div>
    <div className="flex gap-4 mt-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 w-5 bg-[#E0CFA6] rounded-full"></div>
      ))}
    </div>
  </div>
);

const LoadingBar = () => (
  <span className="loading loading-bars loading-sm text-[#D2B48C]" />
);

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const ASSESSMENT_TYPES = [
  "Midterm",
  "Final",
  "Quiz 1",
  "Quiz 2",
  "Additional Quizzes",
];

const CourseQuestions = () => {
  const { courseId } = useParams();
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);
  const [error, setError] = useState("");

  // Fetch course info
  const fetchCourse = useCallback(async () => {
    if (!authToken || !courseId) return;
    try {
      const { data } = await axios.get(`/courses/${courseId}`);
      setCourseName(data?.name || "Course");
    } catch (err) {
      console.error(err);
      setCourseName("Course");
    }
  }, [authToken, courseId]);

  // Fetch questions with abort handling
  const fetchQuestions = useCallback(() => {
    if (!authToken || !courseId) {
      setError("You must be logged in to view questions.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");

    const query = new URLSearchParams({
      page,
      limit: 10,
      sort: sortOrder,
    }).toString();

    axios
      .get(`/questions/courses/${courseId}/questions?${query}`, {
        signal: controller.signal,
      })
      .then(({ data }) => {
        setQuestions(data?.data || []);
        setTotalPages(data?.totalPages || 1);
        setFirstLoad(false);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") {
          console.error(err);
          setError(err?.response?.data?.error || "Failed to load questions.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [authToken, courseId, page, sortOrder]);

  useEffect(() => {
    fetchCourse();
    const abortFetch = fetchQuestions();
    return () => abortFetch && abortFetch();
  }, [fetchCourse, fetchQuestions]);

  const toggleLike = async (qId) => {
    if (!user?.id)
      return toast.error("You must be logged in to like questions.");

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

    const prev = [...questions];
    const updatedQs = questions.map((q) =>
      q.id === qId
        ? {
            ...q,
            bookmarkedBy: q.bookmarkedBy.some((u) => u.id === user.id)
              ? q.bookmarkedBy.filter((u) => u.id !== user.id)
              : [...q.bookmarkedBy, { id: user.id }],
          }
        : q
    );
    setQuestions(updatedQs);

    try {
      const { data } = await axios.post(`/questions/${qId}/bookmark`);
      setQuestions((qs) => qs.map((q) => (q.id === qId ? data.data : q)));
      toast.success(
        data.data.bookmarkedBy.some((u) => u.id === user.id)
          ? "Question added to bookmarks."
          : "Question removed from bookmarks."
      );
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

  const filteredQuestions =
    selectedTypes.length > 0
      ? questions.filter((q) => selectedTypes.includes(q.examType))
      : questions;
  if (firstLoad && loading) {
    return (
      <div className="p-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-center text-theme">
        {courseName} Questions
      </h2>

      <div className="flex flex-col sm:flex-row justify-between flex-wrap gap-3 items-center mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
          {ASSESSMENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeToggle(type)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-all duration-200 ${
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E0CFA6] bg-white text-[#5C4A3D] hover:bg-[#F8EFD4] transition text-sm"
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

      {loading && !firstLoad && (
        <div className="flex justify-center py-10">
          <LoadingBar />
        </div>
      )}

      {filteredQuestions.length > 0 ? (
        <div className="space-y-6">
          {filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id || q._id}
              question={q}
              onToggleLike={() => toggleLike(q.id)}
              onToggleBookmark={() => toggleBookmark(q.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-gray-500">No questions found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            handlePageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default CourseQuestions;
