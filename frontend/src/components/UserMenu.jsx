import React, { useState, useRef, useEffect } from "react";
import { IconUser, IconLayoutDashboard, IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ closeMenu }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Reactive store slices
  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  // Auto clear store if token is missing (expired or removed)
  useEffect(() => {
    if (!authToken && user) {
      logout();
      navigate("/login");
    }
  }, [authToken, user, logout, navigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Hide menu if no user
  if (!user) return null;

  const displayName = user.studentId || user.name || "User";

  return (
    <div className="relative w-max" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-outline btn-sm flex items-center gap-2"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full" />
        ) : (
          <IconUser className="w-5 h-5" />
        )}
        {displayName}
        <IconChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <ul className="menu dropdown-content absolute right-0 mt-2 shadow-lg bg-base-100 rounded-lg border w-48 p-2 z-50">
          <li
            onClick={() => {
              setOpen(false);
              navigate("/dashboard");
              if (closeMenu) closeMenu();
            }}
          >
            <IconLayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </li>
          <li
            onClick={() => {
              logout();
              setOpen(false);
              if (closeMenu) closeMenu();
              navigate("/login");
            }}
          >
            <IconLogout className="w-5 h-5 mr-2" /> Logout
          </li>
        </ul>
      )}
    </div>
  );
}
