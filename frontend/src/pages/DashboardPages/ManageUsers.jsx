import React, { useEffect, useState } from "react";
import axios from "../../../lib/axios";
import { toast } from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [banUntil, setBanUntil] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/users");
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await axios.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: data.role } : u))
      );
      toast.success("User role updated!");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    try {
      const { data } = await axios.put(`/users/${selectedUser.id}/block`, {
        blockUntil: banUntil || null,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? data : u))
      );
      toast.success(banUntil ? "User banned!" : "User unbanned!");
      // Close the modal
      document.getElementById("ban_modal").close();
      setSelectedUser(null);
      setBanUntil("");
    } catch {
      toast.error("Failed to update ban status");
    }
  };

  const handleLogoutUser = async (userId) => {
    try {
      await axios.post(`/users/${userId}/logout`);
      toast.success("User logged out!");
    } catch {
      toast.error("Failed to log out user");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {loading && <progress className="progress w-full mb-4"></progress>}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Questions Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>

                <td>
                  <select
                    className="select select-sm select-bordered w-full max-w-xs"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>{user._count?.createdQuestions || 0}</td>

                <td>
                  {user.blockedUntil && new Date(user.blockedUntil) > new Date()
                    ? `Banned until ${new Date(user.blockedUntil).toLocaleDateString()}`
                    : "Active"}
                </td>

                <td className="flex flex-col sm:flex-row gap-2">
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleLogoutUser(user.id)}
                  >
                    Logout
                  </button>

                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => {
                      setSelectedUser(user);
                      setBanUntil(
                        user.blockedUntil
                          ? new Date(user.blockedUntil).toISOString().split("T")[0]
                          : ""
                      );
                      document.getElementById("ban_modal").showModal();
                    }}
                  >
                    {user.blockedUntil && new Date(user.blockedUntil) > new Date()
                      ? "Unban"
                      : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DaisyUI Ban Modal */}
      <dialog id="ban_modal" className="modal modal-bottom sm:modal-middle">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Ban User</h3>
          <p className="py-2">Select date until the user will be banned:</p>

          <input
            type="date"
            className="input input-bordered w-full mb-4"
            value={banUntil}
            onChange={(e) => setBanUntil(e.target.value)}
          />

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => document.getElementById("ban_modal").close()}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-warning" onClick={handleBan}>
              {banUntil ? "Update" : "Ban"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default ManageUsers;
