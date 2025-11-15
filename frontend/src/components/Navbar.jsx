"use client";
import React, { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { IconMenu2, IconX } from "@tabler/icons-react";
import UserMenu from "../components/UserMenu.jsx";
import { useStore } from "../store/authStore.js";

export default function Navbar() {
  const menuOpen = useStore((state) => state.menuOpen);
  const toggleMenu = useStore((state) => state.toggleMenu);
  const user = useStore((state) => state.user);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClasses = ({ isActive }) =>
    [
      "block px-4 py-2 rounded-md font-medium transition-all duration-200",
      isActive
        ? "bg-sf-border text-black shadow-md"
        : "text-gray-700 hover:text-black hover:bg-sf-cream",
    ].join(" ");

  const loginClasses = ({ isActive }) =>
    [
      "block px-4 py-2 rounded-md font-semibold border border-gray-300 text-center transition-all duration-200",
      isActive
        ? "bg-sf-border text-sf-text shadow-md"
        : "bg-white text-gray-700 hover:bg-sf-light text-sf-text",
    ].join(" ");

  return (
    <nav
      className={`sticky top-4 z-50 transition-all duration-300 mb-10 ${
        isScrolled
          ? "py-2 bg-sf-border/90 shadow-lg rounded-3xl mx-6"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="px-3 sm:px-8 flex items-center justify-between ">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="w-40 h-16 rounded-md flex items-center justify-center overflow-hidden">
            <img
              src="https://res.cloudinary.com/dhqyjs4tk/image/upload/v1763239291/StudyLabzLogo-nobg_taqs85.png"
              alt="logo"
              className="object-contain max-h-full max-w-full"
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex flex-1 justify-center gap-6 items-center font-medium text-sf-text">
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

        {/* Right side: Login/UserMenu */}
        <div className="hidden lg:block">
          {user ? <UserMenu user={user} /> : <NavLink to="/login" className={loginClasses}>Login</NavLink>}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button onClick={toggleMenu} className="text-sf-text focus:outline-none">
            {menuOpen ? <IconX size={28} /> : <IconMenu2 size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="lg:hidden flex flex-col gap-2 font-medium text-sf-text bg-black/20 backdrop-blur-sm shadow-md p-4 mx-4 rounded-b-2xl mt-2 transition-all duration-300">
          <li>
            <NavLink to="/" onClick={toggleMenu} className={navLinkClasses}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/courses" onClick={toggleMenu} className={navLinkClasses}>
              Courses
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={toggleMenu} className={navLinkClasses}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/Contact" onClick={toggleMenu} className={navLinkClasses}>
              Contact
            </NavLink>
          </li>
          {user ? (
            <li className="mt-2">
              <UserMenu closeMenu={toggleMenu} />
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={toggleMenu} className={loginClasses(false)}>
                Login
              </Link>
            </li>
          )}
        </ul>
      )}
    </nav>
  );
}
