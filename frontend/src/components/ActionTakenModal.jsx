import React, { useState } from "react";

const ActionTakenModal = ({ isOpen, onClose, onSubmit, reportId }) => {
  const prefilledActions = [
    "Deleted the reported content",
    "Issued a warning to the user",
    "Suspended the user temporarily",
    "No action required",
    "Other",
  ];

  const [selectedAction, setSelectedAction] = useState("");
  const [customAction, setCustomAction] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    const action = selectedAction === "Other" ? customAction : selectedAction;
    if (!action.trim()) return; // prevent submitting empty action
    onSubmit(reportId, action);
    setSelectedAction("");
    setCustomAction("");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      {/* Only backdrop blur, no black overlay */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="relative w-full max-w-md bg-base-100 rounded-lg shadow-xl p-6 z-10">
        <h2 className="text-xl font-bold mb-4">Action Taken</h2>
        <p className="mb-4">
          Select the action you have taken to resolve this report:
        </p>

        <div className="flex flex-col gap-2 mb-4">
          {prefilledActions.map((action) => (
            <button
              key={action}
              className={`btn btn-outline text-left ${
                selectedAction === action ? "btn-primary" : ""
              }`}
              onClick={() => setSelectedAction(action)}
            >
              {action}
            </button>
          ))}
        </div>

        {/* Show custom textarea if "Other" is selected */}
        {selectedAction === "Other" && (
          <textarea
            className="textarea textarea-bordered w-full mb-4"
            rows="4"
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            placeholder="Describe your custom action here..."
          ></textarea>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={
              !selectedAction || (selectedAction === "Other" && !customAction.trim())
            }
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionTakenModal;
