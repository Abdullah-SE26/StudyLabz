import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Loader2, Edit3, Trash2, Check, X } from "lucide-react";
import { useStore } from "../../store/authStore";
import Pagination from "../../components/Pagination"; 
import PageFilters from "../../components/PageFilters"; 

// --- small inline EditModal component ---
const EditModal = ({ open, onClose, question, courses, onSaved }) => {
  const [form, setForm] = useState({
    text: "",
    marks: 1,
    courseId: null,
  });
  const [saving, setSaving] = useState(false);
  const authToken = useStore((s) => s.authToken);
  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!question) return;
    setForm({
      text: question.text || "",
      marks: question.marks || 1,
      courseId: question.courseId || (courses[0]?.id ?? null),
    });
  }, [question, courses]);

  if (!open) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/questions/${question.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          text: form.text,
          marks: Number(form.marks),
          courseId: Number(form.courseId),
        }),
      });
      if (!res.ok) throw new Error("Failed to update question");
      const data = await res.json();
      onSaved(data);
      toast.success("Question updated");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Unable to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !saving && onClose()}
      />
      <div className="relative bg-white rounded-theme w-full max-w-2xl p-6 shadow-lg z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-sf-primary">Edit Question</h3>
          <button onClick={() => !saving && onClose()} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Text</span>
          <textarea
            value={form.text}
            onChange={(e) => setForm((s) => ({ ...s, text: e.target.value }))}
            rows={4}
            className="w-full mt-2 border rounded p-3 focus:ring-2 focus:ring-sf-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label>
            <span className="text-sm text-gray-600">Marks</span>
            <input
              type="number"
              min={1}
              value={form.marks}
              onChange={(e) => setForm((s) => ({ ...s, marks: e.target.value }))}
              className="w-full mt-2 border rounded p-2 focus:ring-2 focus:ring-sf-primary"
            />
          </label>

          <label>
            <span className="text-sm text-gray-600">Course</span>
            <select
              value={form.courseId ?? ""}
              onChange={(e) => setForm((s) => ({ ...s, courseId: e.target.value }))}
              className="w-full mt-2 border rounded p-2 focus:ring-2 focus:ring-sf-primary"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onClose()}
            disabled={saving}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-sf-primary text-white"
          >
            {saving ? <Loader2 className="inline w-4 h-4 animate-spin mr-2" /> : <Check className="inline w-4 h-4 mr-2" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// --- main ManageQuestions component ---
const ManageQuestions = () => {
  const user = useStore((s) => s.user);
  const authToken = useStore((s) => s.authToken);
  const API_BASE = import.meta.env.VITE_API_URL;

  // data + UI state
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const [selectedTags, setSelectedTags] = useState([]); // wired to PageFilters but not used server-side yet
  const [loading, setLoading] = useState(false);

  // edit modal
  const [editing, setEditing] = useState(null);

  // fetch courses (admins get all; users get only their created courses — adjust backend if needed)
  useEffect(() => {
    if (!authToken) return;
    let mounted = true;
    (async () => {
      try {
        const url = user?.role === "admin" ? `${API_BASE}/api/courses` : `${API_BASE}/api/courses?userId=${user?.id}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${authToken}` } });
        if (!res.ok) throw new Error("Failed to load courses");
        const data = await res.json();
        if (!mounted) return;
        setCourses(data.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => { mounted = false; };
  }, [authToken, API_BASE, user?.id, user?.role]);

  // fetch questions (admin => all; user => only their questions)
  useEffect(() => {
    if (!authToken || !user?.id) return;
    const controller = new AbortController();

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page,
          limit,
          search,
          sort: sortOrder,
        });

        // Note: backend expects ?userId=... to filter non-admin
        const endpoint =
          user.role === "admin"
            ? `${API_BASE}/api/questions?${params}`
            : `${API_BASE}/api/questions?userId=${user.id}&${params}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${authToken}` },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data.data || []);
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
    return () => controller.abort();
    // include all used variables
  }, [page, search, sortOrder, limit, API_BASE, authToken, user?.id, user?.role]);

  // derived map: course id -> name (fast lookup)
  const courseMap = useMemo(() => {
    const m = new Map();
    courses.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [courses]);

  // UI helpers
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
        <p>Loading user info...</p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`${API_BASE}/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete question");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success("Question deleted");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting question");
    }
  };

  const handleOpenEdit = (q) => setEditing(q);
  const handleSaved = (updated) => {
    setQuestions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sf-primary">Manage Questions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user.role === "admin" ? "Viewing all questions" : "Viewing your questions"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add button or other actions could go here */}
        </div>
      </div>

      {/* Filters */}
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
        setSelectedTags={setSelectedTags}
        allTags={[]} // wire with course tags later if available
      />

      {/* Table */}
      <div className="bg-white rounded-theme p-4 shadow-sm border-theme border">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-sf-primary" />
            <p>Loading questions...</p>
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
                  <th className="px-3 py-2 hidden md:table-cell">Marks</th>
                  <th className="px-3 py-2 hidden lg:table-cell">Likes</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-sf-soft/50 transition">
                    <td className="px-3 py-3 align-top w-12 text-sm text-gray-700">{(page - 1) * limit + idx + 1}</td>

                    <td className="px-3 py-3 align-top max-w-xl">
                      <div className="text-sm font-medium text-sf-dark line-clamp-2">{q.text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        By <span className="font-medium">{q.createdBy?.name || "—"}</span>{" "}
                        • {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-3 py-3 hidden sm:table-cell align-top text-sm text-gray-700">
                      <span className="inline-block bg-sf-soft px-3 py-1 rounded-full text-xs border border-sf-primary">
                        {courseMap.get(q.courseId) || q.course?.name || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3 hidden md:table-cell align-top text-sm text-gray-700">{q.marks}</td>

                    <td className="px-3 py-3 hidden lg:table-cell align-top text-sm text-gray-700">
                      {q.likedBy?.length || 0}
                    </td>

                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        {/* Edit allowed for admin or owner */}
                        {(user.role === "admin" || user.id === q.createdById) && (
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="px-3 py-1 rounded bg-white border hover:bg-sf-primary hover:text-white transition flex items-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" /> <span className="text-sm">Edit</span>
                          </button>
                        )}

                        {/* Delete allowed for admin or owner */}
                        {(user.role === "admin" || user.id === q.createdById) ? (
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="px-3 py-1 rounded bg-red-50 text-red-600 border hover:bg-red-500 hover:text-white transition flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> <span className="text-sm">Delete</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination (you provided) */}
      <Pagination totalPages={totalPages} currentPage={page} handlePageChange={(p) => setPage(p)} />

      {/* Edit modal */}
      <EditModal
        open={!!editing}
        onClose={() => setEditing(null)}
        question={editing}
        courses={courses}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default ManageQuestions;
