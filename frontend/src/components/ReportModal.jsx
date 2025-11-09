import React, { useState } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const ReportModal = ({ isOpen, onClose, onReportSuccess, questionId, commentId }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        reason,
        description,
      };
      if (questionId) {
        payload.questionId = questionId;
      } else if (commentId) {
        payload.commentId = commentId;
      }

      await axios.post('/api/reports', payload);
      toast.success('Report submitted successfully!');
      onReportSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to submit report.');
      console.error('Error submitting report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Report {questionId ? 'Question' : 'Comment'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">
              Reason for reporting:
            </label>
            <select
              id="reason"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select a reason</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="SPAM">Spam</option>
              <option value="OFFENSIVE">Offensive</option>
              <option value="MISINFORMATION">Misinformation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description (optional):
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
              placeholder="Provide more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;