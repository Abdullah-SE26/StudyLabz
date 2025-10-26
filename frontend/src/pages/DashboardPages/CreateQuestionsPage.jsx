// frontend/pages/CreateQuestionPage.jsx
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useStore } from "../../store/authStore";
import UploadDropzone from "../../components/UploadDropzone";

export default function CreateQuestionPage() {
  const token = useStore((state) => state.authToken);

  const [text, setText] = useState("");
  const [type, setType] = useState("MCQ");
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState(["", "", "", ""]);
  const [hasImage, setHasImage] = useState(false);
  const [image, setImage] = useState(null);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [examId, setExamId] = useState("");

  // Safe fetch wrapped in useCallback
  const safeFetchJSON = useCallback(async (url) => {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to fetch");
      } else if (!contentType?.includes("application/json")) {
        const text = await res.text();
        throw new Error("Invalid server response: " + text);
      }

      return await res.json();
    } catch (err) {
      toast.error(`❌ ${err.message}`, { duration: 4000 });
      return null;
    }
  }, [token]);

  // Fetch courses
  useEffect(() => {
    if (!token) return;
    const fetchCourses = async () => {
      const data = await safeFetchJSON(`${import.meta.env.VITE_API_URL}/api/courses`);
      if (data) setCourses(Array.isArray(data) ? data : data.courses || []);
    };
    fetchCourses();
  }, [token, safeFetchJSON]);

  // Fetch exams when course changes
  useEffect(() => {
    if (!courseId) {
      setExams([]);
      setExamId("");
      return;
    }

    const fetchExams = async () => {
      const data = await safeFetchJSON(
        `${import.meta.env.VITE_API_URL}/api/exams?courseId=${courseId}`
      );
      if (data) {
        setExams(data.exams || []);
        setExamId(""); // reset exam selection on course change
      }
    };
    fetchExams();
  }, [courseId, safeFetchJSON]);

  const handleOptionChange = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !examId) return toast.error("Please select a course and an exam");

    const payload = {
      text,
      type,
      marks,
      options: type === "MCQ" ? options : null,
      courseId,
      examId,
      image,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create question");
      }

      toast.success("✅ Question created successfully!", { duration: 3000 });

      // Reset form
      setText("");
      setType("MCQ");
      setMarks(1);
      setOptions(["", "", "", ""]);
      setHasImage(false);
      setImage(null);
      setCourseId("");
      setExamId("");
    } catch (err) {
      toast.error(`❌ ${err.message}`, { duration: 4000 });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-3xl mx-auto p-4 bg-white shadow rounded"
    >
      {/* Question Type */}
      <div>
        <label className="block mb-1 font-medium">Question Type</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="MCQ">MCQ</option>
          <option value="Essay">Essay</option>
        </select>
      </div>

      {/* Question Text */}
      <div>
        <label className="block mb-1 font-medium">Question Text</label>
        <textarea
          className="border rounded px-2 py-1 w-full"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* MCQ Options */}
      {type === "MCQ" &&
        options.map((opt, i) => (
          <div key={i}>
            <input
              type="text"
              className="border rounded px-2 py-1 w-full mb-1"
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
          </div>
        ))}

      {/* Marks */}
      <div>
        <label className="block mb-1 font-medium">Marks</label>
        <input
          type="number"
          min={1}
          className="border rounded px-2 py-1 w-24"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
        />
      </div>

      {/* Course */}
      <div>
        <label className="block mb-1 font-medium">Course</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Exam */}
      <div>
        <label className="block mb-1 font-medium">Exam</label>
        <p>Exams length: {exams.length}</p>
        <select className="border rounded px-2 py-1 w-full z-50 relative"

          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          disabled={!exams.length}

        >
          

          <option value="">Select Exam</option>
          {exams.map((ex) => (
            <option key={ex.id} value={String(ex.id)}>
              {ex.title}
            </option>
          ))}
        </select>
      </div>

      {/* Image Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasImage"
          checked={hasImage}
          onChange={(e) => setHasImage(e.target.checked)}
        />
        <label htmlFor="hasImage">Include Image/Diagram</label>
      </div>

      {/* UploadDropzone */}
      {hasImage && (
        <div className="mt-2">
          <label className="block mb-1 font-medium">Upload Image</label>
          <UploadDropzone
            endpoint="imageUploader"
            onUploadComplete={(urls) => {
              if (urls?.[0]) {
                setImage(urls[0].fileUrl);
                toast.success("✅ Image uploaded successfully!", { duration: 2000 });
              }
            }}
            onUploadError={(err) => toast.error(`❌ ${err.message}`)}
            maxFiles={1}
            accept={["image/*"]}
          />
          {image && <p className="text-sm mt-1">Uploaded: {image}</p>}
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create Question
      </button>
    </form>
  );
}
