// ManageQuestions.jsx
import React, { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "react-hot-toast";
import { Loader2, Trash2 } from "lucide-react";
import { useStore } from "../../store/authStore";
import Pagination from "../../components/Pagination";
import PageFilters from "../../components/PageFilters";
import { useNavigate } from "react-router-dom";
import axios from "../../../lib/axios.js";

const SkeletonRow = ({ columns = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-3 py-3">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
      </td>
    ))}
  </tr>
);

const ManageQuestions = () => {
  const user = useStore((s) => s.user);
  const authToken = useStore((s) => s.authToken);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  // AbortController references
  const coursesControllerRef = React.useRef(null);
  const questionsControllerRef = React.useRef(null);

  // Fetch courses
  useEffect(() => {
    if (!authToken) return;
    coursesControllerRef.current = new AbortController();
    const signal = coursesControllerRef.current.signal;

    (async () => {
      try {
        const res = await axios.get(`/courses`, { signal });
        const data = res.data;
        const courseList = Array.isArray(data) ? data : data.data || data.courses || [];
        setCourses(courseList);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Failed to load courses");
        }
      }
    })();

    return () => {
      coursesControllerRef.current.abort();
    };
  }, [authToken]);

  // Fetch questions
  useEffect(() => {
    if (!authToken) return;
    questionsControllerRef.current = new AbortController();
    const signal = questionsControllerRef.current.signal;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          limit,
          search,
          sort: sortOrder,
        });
        if (selectedTags.length > 0) params.append("tags", selectedTags.join(","));

        const res = await axios.get(`/questions?${params.toString()}`, { signal });
        const data = res.data;
        setQuestions(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          toast.error("Error fetching questions.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    return () => questionsControllerRef.current.abort();
  }, [page, search, sortOrder, limit, authToken, selectedTags]);

  // Map for course lookup
  const courseMap = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => map.set(c.id, c));
    return map;
  }, [courses]);

  // All tags
  const allTags = useMemo(() => {
    const s = new Set();
    courses.forEach((c) => Array.isArray(c.tags) && c.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [courses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting question");
    }
  };

  const handleQuestionClick = (id) => navigate(`/questions/${id}`);

  const handleTagClickFromQuestion = (tag) => {
    setPage(1);
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  const getCreatorName = (q) =>
    q.creatorName || q.createdBy?.name || q.createdBy?.studentId || "Unknown";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p>Loading user info...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sf-primary">Manage Questions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user.role === "admin" ? "Viewing all questions" : "Viewing your questions"}
          </p>
        </div>
      </div>

      <PageFilters
        search={search}
        setSearch={(s) => {
          setPage(1);
          setSearch(s);
        }}
        sortOrder={sortOrder}
        setSortOrder={(o) => {
          setPage(1);
          setSortOrder(o);
        }}
        selectedTags={selectedTags}
        setSelectedTags={(t) => {
          setPage(1);
          setSelectedTags(t);
        }}
        allTags={allTags}
      />

      <div className="bg-white rounded-theme p-4 shadow-sm border-theme border">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  {["#", "Question", "Course", "Creator", "Interactions", "Actions"].map(
                    (h) => (
                      <th key={h} className="px-3 py-2">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p>No questions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Question</th>
                  <th className="px-3 py-2 hidden sm:table-cell">Course</th>
                  <th className="px-3 py-2 hidden md:table-cell">Creator</th>
                  <th className="px-3 py-2">Interactions</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {questions.map((q, idx) => {
                  const excerpt =
                    q.text?.length > 200 ? q.text.slice(0, 200) + "..." : q.text || "";
                  const sanitized = DOMPurify.sanitize(excerpt);
                  const course = courseMap.get(q.course?.id) || q.course || {};
                  const tags = Array.isArray(course.tags) ? course.tags : [];

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-sf-soft/50 transition cursor-pointer"
                      onClick={() => handleQuestionClick(q.id)}
                    >
                      <td className="px-3 py-3 align-top w-12 text-sm text-gray-700">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-3 py-3 align-top max-w-xl">
                        <div
                          className="text-sm font-medium text-sf-dark line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: sanitized }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Created on {new Date(q.createdAt).toLocaleDateString()}
                        </div>
                        {tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {tags.map((t) => (
                              <span
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTagClickFromQuestion(t);
                                }}
                                className="cursor-pointer text-xs px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell align-top text-sm text-gray-700">
                        {course.name || "—"}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell align-top text-sm text-gray-700">
                        {getCreatorName(q)}
                      </td>
                      <td className="px-3 py-3 align-top text-sm text-gray-700">
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-red-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span>{q.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                            </svg>
                            <span>{q.bookmarksCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2C6.48 2 2 5.58 2 10c0 4.42 4.48 8 10 8s10-3.58 10-8c0-4.42-4.48-8-10-8zm0 14c-3.31 0-6-2.69-6-6 0-3.31 2.69-6 6-6s6 2.69 6 6c0 3.31-2.69 6-6 6z" />
                            </svg>
                            <span>{q.commentsCount || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {(user.role === "admin" || user.id === q.createdBy?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q.id);
                            }}
                            className="px-3 py-1 rounded bg-red-50 text-red-600 border hover:bg-red-500 hover:text-white transition flex items-center gap-2 md:gap-1"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline text-sm">Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} currentPage={page} handlePageChange={(p) => setPage(p)} />
    </div>
  );
};

export default ManageQuestions;
