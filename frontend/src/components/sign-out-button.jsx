import React from "react";
import { useStore } from "../store/authStore";

export default function SignOutButton({ onClick }) {
  const clearAuth = useStore((state) => state.clearAuth);

  const handleLogout = () => {
    clearAuth(); // clears token and user
    if (onClick) onClick(); // close mobile menu if provided
  };

  return (
    <button
      onClick={handleLogout}
      className="mt-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
    >
      Sign Out
    </button>
  );
}
