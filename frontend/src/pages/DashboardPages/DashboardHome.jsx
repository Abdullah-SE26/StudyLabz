import {
  Users,
  HelpCircle,
  Bookmark,
  BookOpen,
  ClipboardList,
  Activity,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardHome() {
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!authToken) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/dashboard/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard stats");

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [authToken]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <WelcomeBanner isAdmin={isAdmin} />
      <QuickStats stats={stats} isAdmin={isAdmin} />
      {isAdmin ? <AdminCharts stats={stats} /> : <UserCharts stats={stats} />}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner skeleton */}
      <div className="skeleton h-28 rounded-xl w-full" />

      {/* Quick stats skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl w-full" />
        ))}
      </div>

      {/* Charts skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
}

function ErrorMessage({ error }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 text-white shadow-xl" />
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600">Error loading dashboard data: {error}</p>
      </div>
    </div>
  );
}

function WelcomeBanner({ isAdmin }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
      <div className="flex items-center gap-4 justify-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <GraduationCap className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 ">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
        </h1>
      </div>
    </div>
  );
}

function QuickStats({ stats, isAdmin }) {
  const statCards = isAdmin
    ? [
        {
          label: "Total Users",
          value: stats?.totalUsers || 0,
          icon: <Users className="w-5 h-5 text-blue-600" />,
          color: "blue",
          subtitle: "Registered users",
        },
        {
          label: "Total Courses",
          value: stats?.totalCourses || 0,
          icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
          color: "emerald",
          subtitle: "Available courses",
        },
        {
          label: "Total Questions",
          value: stats?.totalQuestions || 0,
          icon: <HelpCircle className="w-5 h-5 text-purple-600" />,
          color: "purple",
          subtitle: "All questions",
        },
        {
          label: "Total Reports",
          value: stats?.totalReports || 0,
          icon: <ClipboardList className="w-5 h-5 text-orange-600" />,
          color: "orange",
          subtitle: "Reported content",
        },
      ]
    : [
        {
          label: "My Questions",
          value: stats?.userQuestions || 0,
          icon: <HelpCircle className="w-5 h-5 text-blue-600" />,
          color: "blue",
          subtitle: "Questions created",
        },
        {
          label: "My Bookmarks",
          value: stats?.userBookmarks || 0,
          icon: <Bookmark className="w-5 h-5 text-emerald-600" />,
          color: "emerald",
          subtitle: "Saved questions",
        },
        {
          label: "Total Courses",
          value: stats?.totalCourses || 0,
          icon: <BookOpen className="w-5 h-5 text-purple-600" />,
          color: "purple",
          subtitle: "Available courses",
        },
        {
          label: "Recent Activity",
          value: stats?.recentQuestions?.length || 0,
          icon: <Activity className="w-5 h-5 text-orange-600" />,
          color: "orange",
          subtitle: "Recent questions",
        },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-xl p-4 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{card.label}</p>
              <p className={`text-3xl font-bold text-${card.color}-600`}>
                {card.value}
              </p>
            </div>
            <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
              {card.icon}
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <Activity className="w-4 h-4 mr-1" />
            <span>{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- ADMIN CHARTS ---------- */
function AdminCharts({ stats }) {
  const usersData = stats?.dailyUsers || [];
  const questionsData = stats?.dailyQuestions || [];

  const chartCard = (title, icon, data, color) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color === "blue" ? "#3b82f6" : "#a855f7"}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {chartCard(
        "Daily Users",
        <Users className="w-5 h-5 text-blue-600" />,
        usersData,
        "blue"
      )}
      {chartCard(
        "Daily Questions",
        <HelpCircle className="w-5 h-5 text-purple-600" />,
        questionsData,
        "purple"
      )}
    </div>
  );
}

/* ---------- USER CHARTS ---------- */
function UserCharts({ stats }) {
  const userQuestionsData = stats?.dailyUserQuestions || [];
  const bookmarksData = stats?.dailyBookmarks || [];

  const chartCard = (title, icon, data, color) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke={color === "blue" ? "#3b82f6" : "#10b981"}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {chartCard(
        "My Questions Over Time",
        <HelpCircle className="w-5 h-5 text-blue-600" />,
        userQuestionsData,
        "blue"
      )}
      {chartCard(
        "My Bookmarks Over Time",
        <Bookmark className="w-5 h-5 text-green-600" />,
        bookmarksData,
        "green"
      )}
    </div>
  );
}
