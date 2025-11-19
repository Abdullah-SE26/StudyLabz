import { useState, useEffect, Suspense, memo } from "react";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";
import axios from "../../../lib/axios";
import { GraduationCap } from "lucide-react";

const LoadingSkeleton = memo(() => (
  <div className="space-y-6">
    <div className="skeleton h-28 rounded-xl w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-xl w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="skeleton h-64 rounded-xl w-full" />
      ))}
    </div>
  </div>
));

const ErrorMessage = memo(({ error }) => (
  <div className="space-y-6">
    <div className="bg-linear-to-r from-blue-600 to-cyan-600 rounded-xl p-4 text-white shadow-xl" />
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <p className="text-red-600">Error loading dashboard data: {error}</p>
    </div>
  </div>
));

const WelcomeBanner = memo(({ isAdmin }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-4">
    <div className="flex items-center gap-4 justify-center">
      <div className="p-2 bg-blue-100 rounded-lg">
        <GraduationCap className="w-6 h-6 text-blue-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-800">
        {isAdmin ? "Admin Dashboard" : "User Dashboard"}
      </h1>
    </div>
  </div>
));

// Lazy-load heavy parts
const QuickStats = Suspense
  ? memo(() => import("../../components/QuickStats"))
  : null;
const AdminCharts = Suspense
  ? memo(() => import("../../components/AdminCharts"))
  : null;
const UserCharts = Suspense
  ? memo(() => import("../../components/UserCharts"))
  : null;

export default function DashboardHome() {
  const user = useStore((state) => state.user);
  const authToken = useStore((state) => state.authToken);
  const shouldRefetchDashboard = useStore((state) => state.shouldRefetchDashboard);
  const setShouldRefetchDashboard = useStore((state) => state.setShouldRefetchDashboard);

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
        const { data } = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        setStats(data.data);
        if (shouldRefetchDashboard) {
          setShouldRefetchDashboard(false);
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        const msg =
          err.response?.data?.error || err.message || "Failed to load dashboard data";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [authToken, shouldRefetchDashboard, setShouldRefetchDashboard]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <WelcomeBanner isAdmin={isAdmin} />
      <Suspense fallback={<LoadingSkeleton />}>
        <QuickStats stats={stats} isAdmin={isAdmin} />
        {isAdmin ? <AdminCharts stats={stats} /> : <UserCharts stats={stats} />}
      </Suspense>
    </div>
  );
}
