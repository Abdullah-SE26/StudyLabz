import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useStore } from "../../store/authStore";
import { Upload, Loader2 } from "lucide-react";
import UploadDropzone from "../../components/UploadDropzone";
import { genUploader } from "uploadthing/client";
import RichTextEditor from "../../components/RichTextEditor";
import axios from "axios";

const uploader = genUploader({
  url: `${import.meta.env.VITE_API_URL}/uploadthing`,
});
const uploadFiles = uploader.uploadFiles;

export default function CreateQuestionPage() {
  const token = useStore((state) => state.authToken);
  const setShouldRefetchDashboard = useStore(
    (state) => state.setShouldRefetchDashboard
  );

  const [text, setText] = useState("");
  const [marks, setMarks] = useState("");
  const [type, setType] = useState("MCQ");
  const [mcqOptions, setMcqOptions] = useState(""); // single string
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [examId, setExamId] = useState("");

  const safeFetchJSON = useCallback(
    async (url) => {
      try {
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return data;
      } catch (err) {
        toast.error(err.response?.data?.error || err.message || "Fetch failed", {
          duration: 4000,
        });
        return null;
      }
    },
    [token]
  );

  useEffect(() => {
    if (!token) return;
    (async () => {
      const data = await safeFetchJSON(
        `${import.meta.env.VITE_API_URL}/courses?limit=all`
      );
      if (!data) return;
      const normalized = Array.isArray(data) ? data : data.courses || [];
      setCourses(normalized.map((c) => ({ id: String(c.id), name: c.name })));
    })();
  }, [token, safeFetchJSON]);

  useEffect(() => {
    if (!courseId) {
      setExamTypes([]);
      setExamId("");
      return;
    }
    (async () => {
      const data = await safeFetchJSON(
        `${import.meta.env.VITE_API_URL}/courses/${courseId}`
      );
      if (!data) return;
      const types = data.examTypes || [];
      setExamTypes(types);
      setExamId(types[0] || "");
    })();
  }, [courseId, safeFetchJSON]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const strippedText = text.replace(/<[^>]*>/g, "").trim();
    if (!courseId || !examId) return toast.error("Select course and exam");
    if (!strippedText) return toast.error("Question text cannot be empty");
    if (!marks || isNaN(Number(marks)) || Number(marks) <= 0)
      return toast.error("Marks must be a positive number");

    if (type === "MCQ") {
      const optionsText = mcqOptions.replace(/<[^>]*>/g, "").trim();
      if (!optionsText) {
        return toast.error("MCQ options cannot be empty.");
      }
    }

    setLoading(true);
    let uploadedFileUrl = null;

    try {
      if (attachmentFile) {
        const uploaded = await uploadFiles("imageUploader", {
          files: [attachmentFile],
        });
        uploadedFileUrl = uploaded[0]?.ufsUrl || null;
      }

      const payload = {
        text,
        type,
        marks: Number(marks),
        courseId: Number(courseId),
        examType: examId,
        image: uploadedFileUrl,
        ...(type === "MCQ" && { options: mcqOptions }),
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Question created successfully!");
      setShouldRefetchDashboard(true);

      // Reset form
      setText("");
      setMarks("");
      setAttachmentFile(null);
      setCourseId("");
      setExamId("");
      setType("MCQ");
      setMcqOptions("");
    } catch (err) {
      toast.error(
        err.response?.data?.error || err.message || "Failed to create question"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center pt-6 pb-10 bg-base-100">
      <div className="w-full max-w-3xl p-6 rounded-2xl shadow-xl bg-white">
        <div className="alert alert-warning mb-6 shadow-md text-sm">
          ⚠️ Do NOT provide answers in the question text.
        </div>

        <h1 className="text-2xl font-semibold mb-5 flex items-center gap-2">
          <Upload className="w-6 h-6 text-primary" /> Create New Question
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Course & Exam */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <span className="label-text">Course</span>
              <select
                className="select select-bordered"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control w-full">
              <span className="label-text">Exam</span>
              <select
                className="select select-bordered"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={examTypes.length === 0}
              >
                <option value="">Select Exam</option>
                {examTypes.map((ex, idx) => (
                  <option key={idx} value={ex}>
                    {ex}
                  </option>
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
              className="select select-bordered"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="MCQ">MCQ</option>
              <option value="Essay">Essay</option>
            </select>
          </div>

          {/* Question Text */}
          <RichTextEditor value={text} onChange={setText} />

          {/* MCQ Options — Single Editor */}
          {type === "MCQ" && (
            <div>
              <span className="label-text mb-1 block">
                MCQ Options (Enter 4 options, one per line)
              </span>
              <RichTextEditor
                value={mcqOptions}
                onChange={setMcqOptions}
                placeholder={`Option 1
Option 2
Option 3
Option 4`}
              />
            </div>
          )}

          {/* Attachment */}
          <UploadDropzone
            file={attachmentFile}
            onFileSelect={setAttachmentFile}
            maxFiles={1}
          />

          {/* Submit */}
          <button
            type="submit"
            className="btn bg-sf-green text-sf-border w-full mt-4 flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Question"}
          </button>
        </form>
      </div>
    </div>
  );
}
