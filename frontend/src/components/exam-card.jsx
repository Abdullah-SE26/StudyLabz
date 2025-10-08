// src/components/ExamCard.jsx
import React from "react";
import { Clock, FileText, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const ExamCard = ({ exam }) => {
  const formattedDate = new Date(exam.createdAt).toLocaleDateString();

  const typeColor = {
    quiz: "badge-success",
    midterm: "badge-warning",
    final: "badge-error",
  }[exam.type?.toLowerCase()] || "badge-info";

  return (
    <Link
      to={`/exam/${exam.id}/questions`}
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      <div className="card-body flex flex-col justify-between">
        <div>
          <h3 className="card-title text-lg font-bold text-gray-900 mb-2 text-center">
            {exam.title || "Untitled Exam"}
          </h3>

          <div className="flex justify-center mb-2">
            <span className={`badge ${typeColor} capitalize`}>
              {exam.type || "Exam"}
            </span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex justify-around text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <CalendarDays size={16} />
            {formattedDate}
          </div>
          {exam.duration && (
            <div className="flex items-center gap-1">
              <Clock size={16} />
              {exam.duration} mins
            </div>
          )}
          {exam.totalQuestions && (
            <div className="flex items-center gap-1">
              <FileText size={16} />
              {exam.totalQuestions} Qs
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ExamCard;
