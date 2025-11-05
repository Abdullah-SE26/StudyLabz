import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useStore } from "../../store/authStore";
import { Upload, Loader2 } from "lucide-react";
import UploadDropzone from "../../components/UploadDropzone";
import { genUploader } from "uploadthing/client";
import RichTextEditor from "../../components/RichTextEditor";
import axios from "axios";

const uploader = genUploader({
  url: `${import.meta.env.VITE_API_URL}/api/uploadthing`,
});
const uploadFiles = uploader.uploadFiles;

export default function CreateQuestionPage() {
  const token = useStore((state) => state.authToken);

  const [text, setText] = useState("");
  const [marks, setMarks] = useState("");
  const [type, setType] = useState("MCQ");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [examId, setExamId] = useState("");
  const [activeOption, setActiveOption] = useState(-1);

  const safeFetchJSON = useCallback(
    async (url) => {
      try {
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (err) {
        toast.error(err.response?.data?.error || err.message || "Fetch failed", { duration: 4000 });
        return null;
      }
    },
    [token]
  );

  // Fetch courses
  useEffect(() => {
    if (!token) return;
    (async () => {
      const data = await safeFetchJSON(`${import.meta.env.VITE_API_URL}/api/courses`);
      if (!data) return;
      const normalized = Array.isArray(data) ? data : data.courses || [];
      setCourses(normalized.map((c) => ({ id: String(c.id), name: c.name })));
    })();
  }, [token, safeFetchJSON]);

  // Fetch exams
  useEffect(() => {
    if (!courseId) {
      setExams([]);
      setExamId("");
      return;
    }
    (async () => {
      const data = await safeFetchJSON(`${import.meta.env.VITE_API_URL}/api/exams?courseId=${courseId}`);
      if (!data) return;
      const examsArray = Array.isArray(data) ? data : data.exams || [];
      setExams(examsArray.map((ex) => ({ id: String(ex.id), title: ex.title })));
      setExamId("");
    })();
  }, [courseId, safeFetchJSON]);

  const handleOptionChange = (idx, val) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseId || !examId) return toast.error("Select course and exam");
    if (!text.trim()) return toast.error("Question text cannot be empty");
    if (!marks || isNaN(Number(marks)) || Number(marks) <= 0)
      return toast.error("Marks must be a positive number");
    if (type === "MCQ" && options.some((o) => !o.trim()))
      return toast.error("All 4 options are required");

    setLoading(true);
    let uploadedFileUrl = null;

    try {
      if (attachmentFile) {
        const uploaded = await uploadFiles("imageUploader", { files: [attachmentFile] });
        uploadedFileUrl = uploaded[0]?.ufsUrl || null;
      }

      const payload = {
        text,
        type,
        marks: Number(marks),
        courseId,
        examId,
        image: uploadedFileUrl,
        options: type === "MCQ" ? options : undefined,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/questions`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Question created successfully!");
      setText("");
      setMarks("");
      setOptions(["", "", "", ""]);
      setAttachmentFile(null);
      setCourseId("");
      setExamId("");
      setType("MCQ");
      setActiveOption(-1);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6 text-primary" /> Create New Question
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Course & Exam */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="form-control w-full">
            <span className="label-text">Course</span>
            <select
              className="select select-bordered dropdown-bottom"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text">Exam</span>
            <select
              className="select select-bordered dropdown-bottom"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              disabled={!exams.length}
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>{ex.title}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Marks & Type */}
        <div className="grid grid-cols-2 gap-4 items-end">
          <input
            type="number"
            className="input input-bordered w-full"
            placeholder="Marks"
            value={marks}
            onChange={(e) => setMarks(e.target.value)}
            min={1}
          />
          <select
            className="select select-bordered dropdown-bottom"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="MCQ">MCQ</option>
            <option value="Essay">Essay</option>
          </select>
        </div>

        {/* Question Text */}
        <RichTextEditor value={text} onChange={setText} />

        {/* MCQ Options */}
        {type === "MCQ" &&
          options.map((opt, idx) => (
            <div
              key={idx}
              className={`collapse collapse-arrow border border-base-300 bg-base-100 rounded-box ${
                activeOption === idx ? "collapse-open" : ""
              }`}
              onClick={() => setActiveOption(activeOption === idx ? -1 : idx)}
            >
              <div className="collapse-title text-xl font-medium">Option {idx + 1}</div>
              {activeOption === idx && (
                <div className="collapse-content">
                  <RichTextEditor
                    value={opt}
                    onChange={(val) => handleOptionChange(idx, val)}
                    height={100}
                  />
                </div>
              )}
            </div>
          ))}

        {/* Attachment */}
        <UploadDropzone file={attachmentFile} onFileSelect={setAttachmentFile} maxFiles={1} />

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2" disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Question"}
        </button>
      </form>
    </div>
  );
}
