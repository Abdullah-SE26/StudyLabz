import React from "react";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      {/* Only backdrop blur, no black overlay */}
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Modal content */}
      <div className="relative w-full max-w-md bg-base-100 rounded-lg shadow-xl p-6 z-10">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete this {itemName}?</p>
        <p className="text-sm text-gray-500 mt-2">
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-error">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
