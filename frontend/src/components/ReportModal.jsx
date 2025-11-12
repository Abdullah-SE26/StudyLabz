import React, { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";

const ReportModal = ({ isOpen, onClose, onReportSuccess, questionId, commentId }) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableReasons, setAvailableReasons] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const reasons = [
      "Inappropriate content",
      "Spam",
      "Offensive",
      "Misinformation",
      "Providing answers",
      "Other",
    ];
    if (commentId) {
      setAvailableReasons(reasons.filter((r) => r !== "Providing answers"));
    } else {
      setAvailableReasons(reasons);
    }
    setSelectedReason("");
    setCustomReason("");
    setDescription("");
  }, [isOpen, commentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        reason: selectedReason === "Other" ? customReason : selectedReason,
        description,
      };
      if (questionId) payload.questionId = questionId;
      if (commentId) payload.commentId = commentId;

      await axios.post("/reports", payload);
      toast.success("Report submitted successfully!");
      onReportSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to submit report.");
      console.error("Error submitting report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm">
      {/* Removed the semi-black shade, only using blur now */}
      <div className="modal modal-open w-full max-w-md">
        <div className="modal-box p-6 bg-base-100 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">
            Report {questionId ? "Question" : "Comment"}
          </h2>
          <p className="mb-4 text-gray-600">
            Select the reason and optionally provide more details:
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {availableReasons.map((reason) => (
                <button
                  type="button"
                  key={reason}
                  className={`btn btn-outline text-left ${
                    selectedReason === reason ? "btn-primary" : ""
                  }`}
                  onClick={() => setSelectedReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === "Other" && (
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Write your custom reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            )}

            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Additional description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="modal-action justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  !selectedReason || (selectedReason === "Other" && !customReason.trim())
                }
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
