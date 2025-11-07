// ManageQuestions.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "react-hot-toast";
import {
  Eye,
  Trash2,
  Bookmark,
  MessageCircle,
  Heart,
  Search as LucideSearch,
} from "lucide-react";
import { useStore } from "../../store/authStore";
import Pagination from "../../components/Pagination";
import PageFilters from "../../components/PageFilters";
import { useNavigate } from "react-router-dom";
import axios from "../../../lib/axios.js";
import DeleteCourseModal from "../../components/DeleteCourseModal";

const SkeletonRow = ({ columns = 6 }) => (
  <tr className="animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-3 py-3">
        <div className="h-4 bg-gray-300 rounded w-full" />
      </td>
    ))}
  </tr>
);

const ManageQuestions = () => {
  const user = useStore((s) => s.user);
  const authToken = useStore((s) => s.authToken);
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [courses, setCourses] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]);

  const [loading, setLoading] = useState(true);
  const firstLoadRef = useRef(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const coursesControllerRef = useRef(null);
  const questionsControllerRef = useRef(null);
  const tagsControllerRef = useRef(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch courses
  useEffect(() => {
    if (!authToken) return;
    coursesControllerRef.current = new AbortController();
    const signal = coursesControllerRef.current.signal;

    (async () => {
      try {
        const res = await axios.get("/courses", { signal });
        setCourses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!(err?.name === "CanceledError" || (axios.isCancel && axios.isCancel(err)))) {
          console.error("Courses fetch failed", err);
          toast.error("Failed to load courses");
        }
      }
    })();

    return () => coursesControllerRef.current?.abort();
  }, [authToken]);

  // Fetch tags
  useEffect(() => {
    if (!authToken) return;
    tagsControllerRef.current = new AbortController();
    const signal = tagsControllerRef.current.signal;

    (async () => {
      try {
        const res = await axios.get("/courses/tags", { signal });
        const tags = Array.isArray(res.data.tags) ? res.data.tags : [];
        setAllTags(tags);
      } catch (err) {
        if (!(err?.name === "CanceledError" || (axios.isCancel && axios.isCancel(err)))) {
          console.error("Tags fetch failed", err);
        }
      }
    })();

    return () => tagsControllerRef.current?.abort();
  }, [authToken]);

  // Fetch questions
  useEffect(() => {
    if (!authToken) return;
    setLoading(true);
    questionsControllerRef.current = new AbortController();
    const signal = questionsControllerRef.current.signal;

    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams({
          page,
          limit,
          search,
          sort: sortOrder,
        });
        if (selectedTags.length) params.append("tags", selectedTags.join(","));

        const res = await axios.get(`/questions?${params.toString()}`, { signal });

        let items = [];
        if (res.data?.data && Array.isArray(res.data.data)) items = res.data.data;
        else if (Array.isArray(res.data)) items = res.data;

        setQuestions(items);
        setTotalPages(
          typeof res.data.totalPages === "number" ? res.data.totalPages : 1
        );
      } catch (err) {
        if (!(err?.name === "CanceledError" || (axios.isCancel && axios.isCancel(err)))) {
          console.error("Error fetching questions", err);
          toast.error("Error fetching questions.");
        }
      } finally {
        setLoading(false);
        firstLoadRef.current = false;
      }
    };

    fetchQuestions();

    return () => questionsControllerRef.current?.abort();
  }, [page, search, sortOrder, limit, authToken, selectedTags]);

  const courseMap = useMemo(() => {
    const m = new Map();
    (courses || []).forEach((c) => m.set(c.id, c));
    return m;
  }, [courses]);

  const sanitizedQuestions = useMemo(() => {
    return (questions || []).map((q) => {
      const excerpt =
        q.text?.length > 200 ? q.text.slice(0, 200) + "..." : q.text || "";
      return {
        ...q,
        excerpt,
        sanitized: DOMPurify.sanitize(excerpt),
        tags: Array.isArray(q.tags) ? q.tags : q.course?.tags || [],
      };
    });
  }, [questions]);

  const handleDelete = (id) => {
    setQuestionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/questions/${questionToDelete}`);
      setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete));
      toast.success("Question deleted");
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Error deleting question");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuestionClick = (id) => navigate(`/questions/${id}`);

  const handleTagClickFromQuestion = (tag) => {
    setPage(1);
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  const getAuthorName = (q) =>
    q.creatorName || q.createdBy?.name || q.createdBy?.studentId || "Unknown";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <LoaderPlaceholder />
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
          setSearchInput(s);
          setLoading(true);
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
        {loading || questions === null ? (
          <div className="flex justify-center py-20">
            <span
              className="loading loading-bars loading-lg"
              style={{ "--color-sf-green": "#034F46", color: "var(--color-sf-green)" }}
            />
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p>No questions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-[900px] w-full divide-y text-sm">
              <thead>
                <tr className="text-left text-sm text-gray-600">
                  <th className="px-2 py-1 w-12">#</th>
                  <th className="px-2 py-1">Question</th>
                  <th className="px-2 py-1 hidden sm:table-cell">Course</th>
                  <th className="px-2 py-1 hidden md:table-cell">Author</th>
                  <th className="px-2 py-1 w-[170px]">Interactions</th>
                  <th className="px-2 py-1 w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sanitizedQuestions.map((q, idx) => {
                  const course = courseMap.get(q.course?.id) || q.course || {};
                  const tags = q.tags || [];

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-sf-soft/50 transition cursor-pointer"
                      onClick={() => handleQuestionClick(q.id)}
                    >
                      <td className="px-2 py-2 align-top w-12 text-gray-700">
                        {(page - 1) * limit + idx + 1}
                      </td>

                      <td className="px-2 py-2 align-top max-w-xl">
                        <div
                          className="font-medium text-sf-dark line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: q.sanitized }}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Created on {new Date(q.createdAt).toLocaleDateString()}
                        </div>

                        {tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {tags.map((t) => (
                              <button
                                key={t}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTagClickFromQuestion(t);
                                }}
                                className="cursor-pointer text-xs px-2 py-0.5 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-2 py-2 hidden sm:table-cell align-top text-gray-700">
                        {course.name || "—"}
                      </td>

                      <td className="px-2 py-2 hidden md:table-cell align-top text-gray-700">
                        {getAuthorName(q)}
                      </td>

                      <td className="px-2 py-2 align-top text-gray-700">
                        <div className="flex gap-4 items-center">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>{q.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bookmark className="w-4 h-4 text-blue-500" />
                            <span>{q.bookmarksCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span>{q.commentsCount || 0}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-2 align-top">
                        <div className="flex items-center">
                          {(user.role === "admin" || user.id === q.createdBy?.id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(q.id);
                              }}
                              title="Delete"
                              className="p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          handlePageChange={(p) => setPage(p)}
        />
      </div>

      <DeleteCourseModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuestionToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        loading={deleteLoading}
      />
    </div>
  );
};

function LoaderPlaceholder() {
  return (
    <div className="flex items-center gap-3">
      <span
        className="loading loading-bars loading-md"
        style={{ "--color-sf-green": "#034F46", color: "var(--color-sf-green)" }}
      />
    </div>
  );
}

export default ManageQuestions;
