import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import QuestionCardSkeleton from "../components/QuestionCardSkeleton";
import axios from "../../lib/axios"; // your axios instance

const QuestionPage = () => {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/questions/${questionId}`);
        setQuestion(data);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch question");
      } finally {
        setLoading(false);
      }
    };

    if (questionId) fetchQuestion();
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
