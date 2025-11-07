import React, { useEffect, useState } from "react";
import { useStore } from "../../store/authStore";
import toast from "react-hot-toast";
import QuestionCard from "../../components/QuestionCard";
import Pagination from "../../components/Pagination";
import axios from "../../../lib/axios.js";
import QuestionCardSkeleton from "../../components/QuestionCardSkeleton";

const UserBookmarks = () => {
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);

  const [questions, setQuestions] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        if (!authToken) {
          throw new Error("You must be logged in to view bookmarks.");
        }
        setError("");

        const res = await axios.get(
          `/questions/users/bookmarks?page=${page}&limit=10`,
          { signal }
        );

        setQuestions(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        if (err.name !== "CanceledError") {
          setError(err.message || "Failed to fetch bookmarks.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
    return () => controller.abort();
  }, [authToken, page, user.id]);

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
      setQuestions((qs) =>
        qs.map((q) => (q.id === qId ? data.data : q))
      );
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
    const updatedQs = questions.filter((q) => q.id !== qId); // remove immediately
    setQuestions(updatedQs);

    try {
      await axios.post(`/questions/${qId}/bookmark`);
      toast.success("Bookmark removed.");
    } catch {
      setQuestions(prev);
      toast.error("Failed to update bookmark.");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-theme">My Bookmarks</h2>
      </div>

      <div className="space-y-6">
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : loading || questions === null ? (
          [...Array(1)].map((_, i) => <QuestionCardSkeleton key={i} />)
        ) : questions.length > 0 ? (
          questions.map((q) => (
            <QuestionCard
              key={q.id || q._id}
              question={q}
              onToggleLike={() => toggleLike(q.id)}
              onToggleBookmark={() => toggleBookmark(q.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-500">No bookmarks found.</p>
          </div>
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
    </div>
  );
};

export default UserBookmarks;
