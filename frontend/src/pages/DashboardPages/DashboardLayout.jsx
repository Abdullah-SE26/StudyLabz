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
import { shallow } from "zustand/shallow";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const location = useLocation();
  const user = useStore((state) => state.user, shallow);
  const clearAuth = useStore((state) => state.clearAuth);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleAdminMenu = () => setAdminOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const baseLinks = [
    { to: "/dashboard", label: "Home", icon: <Home className="w-5 h-5" /> },
    {
      to: "/dashboard/manage-questions",
      label: "Manage Questions",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      to: "/dashboard/user-bookmarks",
      label: "My Bookmarks",
      icon: <Bookmark className="w-5 h-5" />,
    },
    {
      to: "/dashboard/create-question",
      label: "Create Question",
      icon: <FilePlus className="w-5 h-5" />,
    },
  ];

  const adminLinks = [
    {
      to: "/dashboard/create-course",
      label: "Create Course",
      icon: <FilePlus className="w-5 h-5" />, // distinct icon
    },
    {
      to: "/courses",
      label: "Manage Courses",
      icon: <BookOpen className="w-5 h-5" />, // distinct icon
    },
    {
      to: "/dashboard/users",
      label: "Manage Users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: "/dashboard/reports",
      label: "Manage Reports",
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  const allLinks = [...baseLinks, ...adminLinks];
  const currentPage = allLinks
    .filter((link) => location.pathname.startsWith(link.to))
    .sort((a, b) => b.to.length - a.to.length)[0];

  useEffect(() => {
    if (user?.role === "admin") {
      const isAdminPage = adminLinks.some((link) =>
        location.pathname.startsWith(link.to)
      );
      setAdminOpen(isAdminPage);
    }
  }, [location.pathname, user]);

  return (
    <div className="flex min-h-[650px] max-h-[92vh] mb-16 text-sf-text bg-gradient-to-br from-sf-light via-white to-sf-border">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } shrink-0 z-20 bg-sf-cream border-r border-sf-border flex flex-col shadow-md transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sf-border bg-sf-light">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-sf-green" />
              <h2 className="font-bold text-lg text-sf-green">StudyLabz</h2>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="btn btn-ghost btn-sm hover:bg-sf-light p-1 text-sf-green"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col justify-between">
          <ul className="space-y-1">
            {baseLinks.map((link) => {
              const active = currentPage?.to === link.to;
              const linkClass = `flex items-center gap-2 w-full rounded-lg font-medium transition-all duration-200 ${
                sidebarOpen ? "px-4 py-2 text-sm" : "px-0 py-2 justify-center"
              } ${
                active
                  ? "bg-sf-green text-white shadow-sm"
                  : "hover:bg-sf-border text-sf-text hover:text-sf-green"
              }`;
              return (
                <li key={link.to}>
                  {sidebarOpen ? (
                    <Link to={link.to} className={linkClass}>
                      {link.icon}
                      <span className="truncate">{link.label}</span>
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
                        className={linkClass}
                        aria-label={link.label}
                      >
                        {link.icon}
                      </Link>
                    </Tippy>
                  )}
                </li>
              );
            })}

            {user?.role === "admin" && (
              <li className="mt-3">
                {sidebarOpen ? (
                  <>
                    <button
                      onClick={toggleAdminMenu}
                      className="flex items-center justify-between cursor-pointer w-full px-4 py-2 rounded-lg font-medium text-sf-green hover:bg-sf-border transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Admin Panel</span>
                      </div>
                      {adminOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        adminOpen ? "max-h-80 mt-1" : "max-h-0"
                      }`}
                    >
                      <ul className="ml-4 space-y-1">
                        {adminLinks.map((link) => {
                          const active = currentPage?.to === link.to;
                          return (
                            <li key={link.to}>
                              <Link
                                to={link.to}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                                  active
                                    ? "bg-sf-green text-white shadow-sm"
                                    : "hover:bg-sf-border text-sf-text hover:text-sf-green"
                                }`}
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
                  <Tippy
                    content="Admin Panel"
                    placement="right"
                    animation="fade"
                    theme="light-border"
                  >
                    <button
                      className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-sf-border text-sf-green transition-all"
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

          {/* Logout pinned bottom */}
          <div className="p-2 border-t border-sf-border mt-auto mb-2">
            {sidebarOpen ? (
              <button
                onClick={clearAuth}
                className="flex items-center gap-3 w-full cursor-pointer px-4 py-2 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
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
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto max-h-[92vh] px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
