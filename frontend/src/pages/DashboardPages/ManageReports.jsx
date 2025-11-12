import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import ActionTakenModal from "../../components/ActionTakenModal";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingReportId, setUpdatingReportId] = useState(null);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
  }, [fetchReports]);

  const handleStatusChange = (reportId, newStatus) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setSelectedReport({ ...report, status: newStatus });

    if (["RESOLVED", "REJECTED"].includes(newStatus)) {
      setIsModalOpen(true);
    } else {
      handleSubmitActionTaken(reportId, newStatus, "");
    }
  };

  const handleSubmitActionTaken = async (reportId, status, actionTaken) => {
    setUpdatingReportId(reportId);
    try {
      const response = await axios.put(`/reports/${reportId}`, {
        status,
        actionTaken,
      });
      const updatedReport = response.data.data;
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? updatedReport : r))
      );
      toast.success("Report status updated successfully!");
    } catch (err) {
      toast.error("Failed to update report status.");
      console.error("Error updating report status:", err);
    } finally {
      setIsModalOpen(false);
      setSelectedReport(null);
      setUpdatingReportId(null);
    }
  };

  // Filtering and Sorting
  const filteredAndSortedReports = useMemo(() => {
    let result = reports;

    if (filterStatus !== "ALL") {
      result = result.filter((report) => report.status === filterStatus);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [reports, filterStatus, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedReports.length / pageSize);
  const paginatedReports = filteredAndSortedReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-bars loading-xl text-info bg-sf-green"></span>
      </div>
    );
  }

  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Reports</h1>

      {/* Filters and Sorters */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <label htmlFor="status-filter" className="mr-2 font-semibold">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded p-1"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div>
          <label htmlFor="date-sort" className="mr-2 font-semibold">
            Sort by Date:
          </label>
          <select
            id="date-sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border rounded p-1"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <>
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
                  <th className="py-2 px-4 border-b">Action Taken</th>
                  <th className="py-2 px-4 border-b">Resolved By</th>
                  <th className="py-2 px-4 border-b">Created At</th>
                  <th className="py-2 px-4 border-b">Resolved At</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`hover:bg-gray-50 ${
                      updatingReportId === report.id ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-2 px-4 border-b">{report.id}</td>
                    <td className="py-2 px-4 border-b">
                      {report.reportedBy?.name || report.reportedBy?.email || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {report.questionId ? "Question" : report.commentId ? "Comment" : "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b max-w-xs truncate">
                      {report.questionId && report.question ? (
                        <Link
                          to={`/questions/${report.question.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          <span dangerouslySetInnerHTML={{ __html: report.question.text }} />
                        </Link>
                      ) : report.commentId && report.comment ? (
                        <Link
                          to={`/questions/${report.comment.questionId}#comment-${report.comment.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {report.comment.text}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-2 px-4 border-b">{report.reason}</td>
                    <td className="py-2 px-4 border-b max-w-xs truncate">{report.description || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{report.status}</td>
                    <td className="py-2 px-4 border-b max-w-xs truncate">{report.actionTaken || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{report.resolvedBy?.name || "N/A"}</td>
                    <td className="py-2 px-4 border-b">{new Date(report.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">{report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : "N/A"}</td>
                    <td className="py-2 px-4 border-b">
                      {updatingReportId === report.id ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <select
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value)
                          }
                          className="border rounded p-1"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={(page) => setCurrentPage(page)}
          />

          <ActionTakenModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedReport(null);
            }}
            onSubmit={(reportId, actionTaken) =>
              handleSubmitActionTaken(
                reportId,
                selectedReport.status,
                actionTaken
              )
            }
            reportId={selectedReport?.id}
          />
        </>
      )}
    </div>
  );
};
export default ManageReports;
