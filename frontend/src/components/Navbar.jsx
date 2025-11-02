import React from "react";
import { NavLink, Link } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";
import UserMenu from "../components/UserMenu.jsx";
import { useStore } from "../store/authStore.js";


export default function Navbar() {
  const menuOpen = useStore((state) => state.menuOpen);
  const toggleMenu = useStore((state) => state.toggleMenu);
  const user = useStore((state) => state.user);

  const navLinkClasses = ({ isActive }) =>
    [
      "block px-4 py-2 rounded-md font-medium transition-all duration-200",
      isActive
        ? "bg-[#FFFDF9] text-black shadow-md"
        : "text-gray-700 hover:text-black hover:bg-[#FFFDF9]",
    ].join(" ");

  const loginClasses = ({ isActive }) =>
    [
      "block px-4 py-2 rounded-md font-semibold border border-gray-300 text-center transition-all duration-200",
      isActive
        ? "bg-blue-500 text-white shadow-md"
        : "bg-white text-gray-700 hover:bg-blue-500 hover:text-white",
    ].join(" ");

  return (
    <nav className="sticky top-0 z-50 rounded-lg border border-black mt-5">
      <div className="px-3 sm:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/studylabz-logo.png"
            alt="logo"
            className="hidden sm:block w-50"
          />
          <img
            src="/logo_placeholder.jpg"
            alt="logo"
            className="sm:hidden w-5"
          />
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex flex-1 justify-center gap-6 items-center">
          <li>
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" className={navLinkClasses}>
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={navLinkClasses}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/Contact" className={navLinkClasses}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Right side: Login or UserMenu */}
        <div className="hidden lg:block">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <NavLink to="/login" className={loginClasses}>
              Login
            </NavLink>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={toggleMenu}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? <IconX size={28} /> : <IconMenu2 size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="lg:hidden flex flex-col gap-2 font-medium text-gray-700 bg-white border-t border-gray-200 shadow-md p-4 mx-6 rounded-b-md">
          <li>
            <NavLink to="/" onClick={toggleMenu} className={navLinkClasses}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/courses"
              onClick={toggleMenu}
              className={navLinkClasses}
            >
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              onClick={toggleMenu}
              className={navLinkClasses}
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/Contact"
              onClick={toggleMenu}
              className={navLinkClasses}
            >
              Contact
            </NavLink>
          </li>

          {user ? (
            <li className="mt-2">
              <UserMenu closeMenu={toggleMenu} />
            </li>
          ) : (
            <li>
              <Link
                to="/login"
                onClick={toggleMenu}
                className={loginClasses(false)}
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
