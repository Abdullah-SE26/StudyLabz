import React, { useState, useRef, useEffect } from "react";
import {
  IconUser,
  IconLayoutDashboard,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import { useStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ closeMenu }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useStore((state) => state.user);
  const clearAuth = useStore((state) => state.clearAuth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!user) return null; // hide menu if not logged in

  const displayName = user.studentId || user.name || "User";

  return (
    <div className="relative w-max" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2 flex items-center rounded-lg border border-slate-300 text-slate-900 hover:bg-slate-100"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-7 h-7 mr-3 rounded-full" />
        ) : (
          <IconUser className="w-5 h-6 mr-3 text-slate-500" />
        )}
        {displayName}
        <IconChevronDown size={16} className="ml-2 text-slate-400" />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 shadow-lg bg-white py-2 z-50 min-w-full w-max rounded-lg border border-gray-100">
          <li
            onClick={() => {
              setOpen(false);
              navigate("/Dashboard");
              if (closeMenu) closeMenu();
            }}
            className="flex items-center py-2.5 px-5 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <IconLayoutDashboard size={18} className="mr-3 text-slate-500" />
            Dashboard
          </li>
          <li
            onClick={() => {
              clearAuth();
              setOpen(false);
              if (closeMenu) closeMenu();
              navigate("/login");
            }}
            className="flex items-center py-2.5 px-5 hover:bg-slate-100 text-slate-600 cursor-pointer"
          >
            <IconLogout size={18} className="mr-3 text-slate-500" />
            Logout
          </li>
        </ul>
      )}
    </div>
  );
}
