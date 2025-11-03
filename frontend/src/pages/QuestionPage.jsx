import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import QuestionCardSkeleton from "../components/QuestionCardSkeleton";

const QuestionPage = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/questions/${questionId}`
        );
        if (!res.ok) throw new Error("Failed to fetch question");
        const data = await res.json();
        setQuestion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  if (loading) return <QuestionCardSkeleton />;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!question) return <div className="text-center p-10">Question not found.</div>;

  return (
    <div className="p-4 sm:p-6">
      <QuestionCard question={question} />
    </div>
  );
};

export default QuestionPage;
