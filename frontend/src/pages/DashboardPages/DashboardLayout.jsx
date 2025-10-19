import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  BookOpen,
  Users,
  ClipboardList,
  Bookmark,
  HelpCircle,
  FilePlus,
  LogOut,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useStore } from "../../store/authStore";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();
  const user = useStore((state) => state.user);
  const clearAuth = useStore((state) => state.clearAuth);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleAdminMenu = () => setAdminOpen((prev) => !prev);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  // Links
  const baseLinks = [
    { to: "/dashboard", label: "Home", icon: <Home className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/my-questions", label: "My Questions", icon: <HelpCircle className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/bookmarks", label: "My Bookmarks", icon: <Bookmark className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/create-question", label: "Create Question", icon: <FilePlus className="w-5 h-5 flex-shrink-0" /> },
  ];

  const adminLinks = [
    { to: "/dashboard/create-course", label: "Create Course", icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/manage-courses", label: "Manage Courses", icon: <BookOpen className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/users", label: "Manage Users", icon: <Users className="w-5 h-5 flex-shrink-0" /> },
    { to: "/dashboard/reports", label: "Manage Reports", icon: <ClipboardList className="w-5 h-5 flex-shrink-0" /> },
  ];

  const currentPage = [...baseLinks, ...adminLinks].find((link) =>
    location.pathname.startsWith(link.to)
  );
  const pageTitle = currentPage ? currentPage.label : "Dashboard";

  return (
    <div className="flex h-screen bg-base-200 text-base-content overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } flex-shrink-0 box-border z-20 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
          {sidebarOpen && (
            <h2 className="font-semibold text-lg text-gray-700 truncate">StudyLabz</h2>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="btn btn-ghost btn-sm hover:bg-gray-100 p-1"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto min-w-0">
          <ul className="p-2 space-y-1">
            {/* Base Links */}
            {baseLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              const linkClass = `
                flex items-center gap-3 w-full box-border rounded-md transition-all duration-150
                ${sidebarOpen ? "px-3 py-2" : "px-0 py-2"}
                ${active ? "bg-gray-100 text-gray-900 font-medium" : "hover:bg-gray-50 text-gray-600"}
              `;
              return (
                <li key={link.to} className="w-full">
                  {sidebarOpen ? (
                    <Link to={link.to} className={linkClass}>
                      {link.icon}
                      <span className="truncate">{link.label}</span>
                    </Link>
                  ) : (
                    <Tippy content={link.label} placement="right" animation="fade" theme="light-border">
                      <Link to={link.to} className={`${linkClass} justify-center`} aria-label={link.label}>
                        {link.icon}
                      </Link>
                    </Tippy>
                  )}
                </li>
              );
            })}

            {/* Admin Section */}
            {user?.role === "admin" && (
              <li className="mt-2 w-full">
                {sidebarOpen ? (
                  <>
                    <button
                      onClick={toggleAdminMenu}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Admin Dashboard</span>
                      </div>
                      {adminOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        adminOpen ? "max-h-80 mt-1" : "max-h-0"
                      }`}
                    >
                      <ul className="ml-2 border-l border-gray-100 pl-3 space-y-1">
                        {adminLinks.map((link) => {
                          const active = location.pathname.startsWith(link.to);
                          return (
                            <li key={link.to}>
                              <Link
                                to={link.to}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all
                                  ${
                                    active
                                      ? "bg-gray-100 text-gray-900 font-medium"
                                      : "hover:bg-gray-50 text-gray-600"
                                  }
                                `}
                              >
                                {link.icon}
                                <span>{link.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : (
                  // When collapsed → clicking expands sidebar & opens menu
                  <Tippy content="Admin Dashboard" placement="right" animation="fade" theme="light-border">
                    <button
                      className="flex items-center justify-center w-full p-2 rounded-md hover:bg-gray-50 text-gray-700 transition-all"
                      onClick={() => {
                        setSidebarOpen(true);
                        setAdminOpen(true);
                      }}
                      aria-label="Admin Dashboard"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </button>
                  </Tippy>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          {sidebarOpen ? (
            <button
              onClick={clearAuth}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Tippy content="Logout" placement="right" animation="fade" theme="light-border">
              <button
                onClick={clearAuth}
                className="flex items-center justify-center w-full p-2 rounded-md text-red-600 hover:bg-red-50"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </Tippy>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between h-16 px-6 border-b bg-white text-gray-800">
          <h1 className="text-lg font-semibold truncate">{pageTitle}</h1>
          <div className="text-sm text-gray-500 truncate">{user?.email}</div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
