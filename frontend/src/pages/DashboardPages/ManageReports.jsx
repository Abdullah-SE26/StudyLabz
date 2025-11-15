import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "../../../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import ActionTakenModal from "../../components/ActionTakenModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      handleSubmitActionTaken(reportId, newStatus, report.actionTaken || "");
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
      toast.success("Report updated successfully!");
    } catch (err) {
      console.error("Error updating report:", err);
      toast.error("Failed to update report.");
    } finally {
      setIsModalOpen(false);
      setSelectedReport(null);
      setUpdatingReportId(null);
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`/reports/${reportToDelete.id}`);
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
      toast.success("Report deleted successfully!");
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report.");
    } finally {
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      setIsDeleting(false);
    }
  };

  const filteredAndSortedReports = useMemo(() => {
    let result = [...reports];
    if (filterStatus !== "ALL")
      result = result.filter((r) => r.status === filterStatus);

    result.sort((a, b) => {
      if (a.status === "RESOLVED" && b.status !== "RESOLVED") return 1;
      if (b.status === "RESOLVED" && a.status !== "RESOLVED") return -1;
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [reports, filterStatus, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedReports.length / pageSize);
  const paginatedReports = filteredAndSortedReports.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const rowColor = (report) => {
    if (report.questionId) return "bg-blue-100"; // lighter blue
    if (report.commentId) return "bg-orange-100"; // lighter orange
    return "";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-200 text-yellow-800";
      case "REVIEWED":
        return "bg-blue-200 text-blue-800";
      case "RESOLVED":
        return "bg-green-200 text-green-800";
      case "REJECTED":
        return "bg-red-200 text-red-800";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-2">
        <span className="loading loading-bars loading-xl text-sf-green"></span>
        <span className="text-gray-600 font-semibold">Loading reports...</span>
      </div>
    );
  }

  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (reports.length === 0)
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-semibold mb-2">No reports available.</p>
        <p>Reports will appear here once users submit them.</p>
      </div>
    );

  const counts = {
    TOTAL: reports.length,
    PENDING: reports.filter((r) => r.status === "PENDING").length,
    REVIEWED: reports.filter((r) => r.status === "REVIEWED").length,
    RESOLVED: reports.filter((r) => r.status === "RESOLVED").length,
    REJECTED: reports.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Reports</h1>

      {/* Counts */}
      <div className="flex flex-wrap gap-4 mb-4">
        {Object.entries(counts).map(([key, value]) => {
          const colors = {
            TOTAL: "bg-gray-200",
            PENDING: "bg-yellow-200",
            REVIEWED: "bg-blue-200",
            RESOLVED: "bg-green-200",
            REJECTED: "bg-red-200",
          };
          return (
            <div
              key={key}
              className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[key]}`}
            >
              {key}: {value}
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
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

      {/* Legend */}
      <div className="flex gap-4 mb-2 text-sm items-center">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-400 rounded-full"></span> Question
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-orange-400 rounded-full"></span> Comment
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-2 border-b">#</th>
              <th className="py-2 px-4 border-b">Reported By</th>
              <th className="py-2 px-4 border-b">Content</th>
              <th className="py-2 px-4 border-b">Reason</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Resolved At</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Action Taken</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReports.map((report) => (
              <tr
                key={report.id}
                className={`${rowColor(report)} hover:bg-gray-50 ${
                  updatingReportId === report.id ? "opacity-50" : ""
                }`}
              >
                <td className="py-2 px-2 border-b">{report.id}</td>
                <td className="py-2 px-4 border-b">
                  {report.reportedBy?.name || report.reportedBy?.email || "N/A"}
                </td>
                <td
                  className="py-2 px-4 border-b max-w-xs truncate"
                  title={report.question?.text || report.comment?.text || "N/A"}
                >
                  {report.questionId && report.question ? (
                    <Link
                      to={`/questions/${report.question.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: report.question.text,
                        }}
                      />
                    </Link>
                  ) : report.commentId && report.comment ? (
                    <Link
                      to={`/questions/${report.comment.questionId}#comment-${report.comment.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {report.comment.text}
                    </Link>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="py-2 px-4 border-b">{report.reason}</td>
                <td
                  className="py-2 px-4 border-b max-w-xs truncate"
                  title={report.description || "N/A"}
                >
                  {report.description || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {new Date(report.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">
                  {report.resolvedAt
                    ? new Date(report.resolvedAt).toLocaleString()
                    : "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  {updatingReportId === report.id ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    <select
                      value={report.status}
                      onChange={(e) =>
                        handleStatusChange(report.id, e.target.value)
                      }
                      className={`border rounded p-1 ${getStatusColor(
                        report.status
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="REVIEWED">REVIEWED</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  )}
                </td>
                <td className="py-2 px-4 border-b max-w-xs truncate">
                  {report.actionTaken || "N/A"}
                </td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDeleteClick(report)}
                    className="btn btn-error btn-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting && reportToDelete?.id === report.id ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Delete"
                    )}
                  </button>
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
          handleSubmitActionTaken(reportId, selectedReport.status, actionTaken)
        }
        reportId={selectedReport?.id}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="report"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageReports;
