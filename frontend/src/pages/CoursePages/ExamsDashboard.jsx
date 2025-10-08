// src/pages/ExamsDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExamsDashboard = () => {
  const { courseId } = useParams(); // get course ID from route
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/exams?courseId=${courseId}`
        );
        if (!res.ok) throw new Error("Failed to fetch exams");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [courseId]);

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

  if (!exams.length) {
    return <p className="text-center mt-10 text-gray-500">No exams available for this course.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Exams Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="card bg-base-100 shadow-md hover:shadow-lg cursor-pointer border hover:border-blue-400 transition-all"
            onClick={() => navigate(`/courses/${courseId}/exams/${exam.id}`)}
          >
            <div className="card-body text-center">
              <h3 className="card-title justify-center">{exam.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{exam.type}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsDashboard;
