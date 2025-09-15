import React from "react";

export default function SignOutButton() {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-5 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
    >
      Sign Out
    </button>
  );
}
