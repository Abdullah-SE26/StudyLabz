// src/pages/ExamQuestions.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";

const ExamQuestions = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exams/${examId}/questions`
        );
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [examId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  if (!questions.length) {
    return (
      <p className="text-center mt-10 text-gray-500">
        No questions available for this exam.
      </p>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Exam Questions</h2>
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q.id}
            className="card bg-base-100 shadow-md border hover:border-blue-400 transition-all p-4"
          >
            <div
              className="font-medium"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.text) }}
            />
            {q.options && Array.isArray(q.options) && (
              <ul className="list-disc list-inside mt-2 text-gray-600">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamQuestions;
