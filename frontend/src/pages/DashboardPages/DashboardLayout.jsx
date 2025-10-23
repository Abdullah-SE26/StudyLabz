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
  GraduationCap,
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
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Links with educational-themed icons
  const baseLinks = [
    {
      to: "/dashboard",
      label: "Home",
      icon: <Home className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/dashboard/my-questions",
      label: "My Questions",
      icon: <HelpCircle className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/dashboard/bookmarks",
      label: "My Bookmarks",
      icon: <Bookmark className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/dashboard/create-question",
      label: "Create Question",
      icon: <FilePlus className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  const adminLinks = [
    {
      to: "/dashboard/create-course",
      label: "Create Course",
      icon: <BookOpen className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/courses",
      label: "Manage Courses",
      icon: <BookOpen className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/dashboard/users",
      label: "Manage Users",
      icon: <Users className="w-5 h-5 flex-shrink-0" />,
    },
    {
      to: "/dashboard/reports",
      label: "Manage Reports",
      icon: <ClipboardList className="w-5 h-5 flex-shrink-0" />,
    },
  ];

  const currentPage = [...baseLinks, ...adminLinks].find((link) =>
    location.pathname.startsWith(link.to)
  );
  const pageTitle = currentPage ? currentPage.label : "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } flex-shrink-0 box-border z-20 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "fixed md:relative inset-y-0 left-0" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 bg-white">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-800">StudyLabz</h2>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="btn btn-ghost btn-sm hover:bg-slate-100 p-1 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto min-w-0 p-2">
          <ul className="space-y-1">
            {/* Base Links */}
            {baseLinks.map((link) => {
              const active = location.pathname.startsWith(link.to);
              const linkClass = `
                flex items-center gap-3 w-full box-border rounded-lg transition-all duration-200
                ${sidebarOpen ? "px-3 py-2" : "px-0 py-2"}
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                }
              `;
              return (
                <li key={link.to} className="w-full">
                  {sidebarOpen ? (
                    <Link to={link.to} className={linkClass}>
                      {link.icon}
                      <span className="truncate font-medium">{link.label}</span>
                    </Link>
                  ) : (
                    <Tippy
                      content={link.label}
                      placement="right"
                      animation="fade"
                      theme="light-border"
                    >
                      <Link
                        to={link.to}
                        className={`${linkClass} justify-center`}
                        aria-label={link.label}
                      >
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
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-slate-600" />
                        <span className="font-medium text-slate-800">
                          Admin Panel
                        </span>
                      </div>
                      {adminOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        adminOpen ? "max-h-80 mt-1" : "max-h-0"
                      }`}
                    >
                      <ul className="ml-6 space-y-1">
                        {adminLinks.map((link) => {
                          const active = location.pathname.startsWith(link.to);
                          return (
                            <li key={link.to}>
                              <Link
                                to={link.to}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                  ${
                                    active
                                      ? "bg-blue-600 text-white"
                                      : "hover:bg-slate-100 text-slate-600 hover:text-slate-800"
                                  }
                                `}
                              >
                                {link.icon}
                                <span className="font-medium">
                                  {link.label}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </>
                ) : (
                  // When collapsed → clicking expands sidebar & opens menu
                  <Tippy
                    content="Admin Panel"
                    placement="right"
                    animation="fade"
                    theme="light-border"
                  >
                    <button
                      className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                      onClick={() => {
                        setSidebarOpen(true);
                        setAdminOpen(true);
                      }}
                      aria-label="Admin Panel"
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
        <div className="border-t border-slate-200 p-2">
          {sidebarOpen ? (
            <button
              onClick={clearAuth}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Tippy
              content="Logout"
              placement="right"
              animation="fade"
              theme="light-border"
            >
              <button
                onClick={clearAuth}
                className="flex items-center justify-center w-full p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
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
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
