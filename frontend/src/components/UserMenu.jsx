import React, { useState, useRef, useEffect } from "react";
import { IconUser, IconLayoutDashboard, IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ closeMenu }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const authToken = useStore((state) => state.authToken);
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);

  // Auto clear if token missing
  useEffect(() => {
    if (!authToken && user) logout();
  }, [authToken, user, logout]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Show Login button if no user
  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-1 px-3 py-1 border border-primary rounded-md text-neutral hover:bg-base-200 text-sm"
      >
        <IconUser className="w-4 h-4" />
        Login
      </button>
    );
  }

  const displayName = user.studentId || user.name || "User";

  return (
    <div className="relative w-max" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1 border border-primary rounded-md text-neutral hover:bg-base-200 text-sm"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-5 h-5 rounded-full" />
        ) : (
          <IconUser className="w-4 h-4" />
        )}
        <span className="truncate max-w-[100px]">{displayName}</span>
        <IconChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <ul className="absolute right-0 mt-1 shadow-md bg-base-100 py-1 z-50 w-44 rounded-md border border-primary text-sm">
          <li
            onClick={() => {
              setOpen(false);
              navigate("/dashboard");
              if (closeMenu) closeMenu();
            }}
            className="flex items-center px-3 py-2 gap-2 hover:bg-primary/20 cursor-pointer text-neutral"
          >
            <IconLayoutDashboard className="w-4 h-4" />
            Dashboard
          </li>
          <li
            onClick={() => {
              logout();
              setOpen(false);
              if (closeMenu) closeMenu();
              navigate("/login");
            }}
            className="flex items-center px-3 py-2 gap-2 hover:bg-primary/20 cursor-pointer text-neutral"
          >
            <IconLogout className="w-4 h-4" />
            Logout
          </li>
        </ul>
      )}
    </div>
  );
}
