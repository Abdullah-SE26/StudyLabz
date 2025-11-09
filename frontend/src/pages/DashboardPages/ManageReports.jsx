import React, { useEffect, useState, useCallback } from "react";
import axios from "../../../lib/axios"; 
import { toast } from "react-hot-toast";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/reports/admin");
      setReports(response.data.data || []);
    } catch (err) {
      setError(err);
      toast.error("Failed to fetch reports.");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]); // Now correctly included as dependency

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axios.put(`/reports/${reportId}`, { status: newStatus });
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status: newStatus,
                resolvedAt:
                  ["RESOLVED", "REJECTED"].includes(newStatus) ? new Date().toISOString() : r.resolvedAt,
              }
            : r
        )
      );
      toast.success("Report status updated successfully!");
    } catch (err) {
      toast.error("Failed to update report status.");
      console.error("Error updating report status:", err);
    }
  };

  if (loading) return <div className="p-4">Loading reports...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Reports</h1>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Reported By</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Content</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Created At</th>
                <th className="py-2 px-4 border-b">Resolved At</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{report.id}</td>
                  <td className="py-2 px-4 border-b">{report.reportedBy?.name || report.reportedBy?.email || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{report.questionId ? "Question" : report.commentId ? "Comment" : "N/A"}</td>
                  <td className="py-2 px-4 border-b max-w-xs truncate">{report.question?.text || report.comment?.text || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{report.reason}</td>
                  <td className="py-2 px-4 border-b max-w-xs truncate">{report.description || "N/A"}</td>
                  <td className="py-2 px-4 border-b">{report.status}</td>
                  <td className="py-2 px-4 border-b">{new Date(report.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : "N/A"}</td>
                  <td className="py-2 px-4 border-b">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className="border rounded p-1"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
