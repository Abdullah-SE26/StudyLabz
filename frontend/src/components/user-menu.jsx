import React, { useState, useRef, useEffect } from "react";
import {
  IconUser,
  IconLayoutDashboard,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import { useStore } from "../store/authStore";

export default function UserMenu({ closeMenu }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useStore((state) => state.user);
  const clearAuth = useStore((state) => state.clearAuth);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    clearAuth();
    setOpen(false);
    if (closeMenu) closeMenu();
  };

  const displayName = user.studentId || user.name || "User";

  return (
    <div className="relative w-max" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="px-4 py-2 flex items-center rounded-lg text-slate-900 text-sm font-medium border border-slate-300 outline-none hover:bg-slate-100"
      >
        {/* Default avatar: use Tabler Icon if user.avatar is not set */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-7 h-7 mr-3 rounded-full shrink-0"
          />
        ) : (
          <IconUser className="w-5 h-6 mr-3 text-slate-500" />
        )}
        {displayName}
        <IconChevronDown size={16} className="ml-2 text-slate-400" />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 shadow-lg bg-white py-2 z-50 min-w-full w-max rounded-lg border border-gray-100">
          <li className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer">
            <IconLayoutDashboard size={18} className="mr-3 text-slate-500" />
            Dashboard
          </li>
          <li
            onClick={handleLogout}
            className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer"
          >
            <IconLogout size={18} className="mr-3 text-slate-500" />
            Logout
          </li>
        </ul>
      )}
    </div>
  );
}
