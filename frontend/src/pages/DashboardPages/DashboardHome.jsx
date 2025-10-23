import {
  Home,
  HelpCircle,
  Bookmark,
  FilePlus,
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Activity,
  Zap,
  GraduationCap,
  BookOpenCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useStore } from "../../store/authStore";
import { toast } from "react-hot-toast";

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
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome to StudyLabz
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                Your educational platform for university students
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/50 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="p-3 bg-slate-200 rounded-lg w-12 h-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome to StudyLabz
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                Your educational platform for university students
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome to StudyLabz
            </h1>
            <p className="text-slate-600">
              Your educational platform for university students
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isAdmin ? (
          <>
            {/* Admin Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>Registered users</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats?.totalCourses || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Available courses</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Questions
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.totalQuestions || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Zap className="w-4 h-4 mr-1" />
                <span>All questions</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Reports
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats?.totalReports || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>Reported content</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* User Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    My Questions
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.userQuestions || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Questions created</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    My Bookmarks
                  </p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats?.userBookmarks || 0}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Bookmark className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>Saved questions</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats?.totalCourses || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Zap className="w-4 h-4 mr-1" />
                <span>Available courses</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">
                    Recent Activity
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats?.recentQuestions?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Activity className="w-4 h-4 mr-1" />
                <span>Recent questions</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {isAdmin ? "Recent Questions" : "My Recent Questions"}
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.recentQuestions?.length > 0 ? (
              stats.recentQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      index === 0
                        ? "bg-blue-500"
                        : index === 1
                        ? "bg-emerald-500"
                        : "bg-purple-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">
                      {question.course} - {question.text}
                    </p>
                    <p className="text-sm text-slate-600">
                      {isAdmin && question.createdBy
                        ? `By ${question.createdBy}`
                        : ""}
                      {new Date(question.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No recent questions found</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BookOpenCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Course Overview
            </h3>
          </div>
          <div className="space-y-3">
            {stats?.courseStats?.length > 0 ? (
              stats.courseStats.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen
                      className={`w-5 h-5 ${
                        index === 0
                          ? "text-blue-600"
                          : index === 1
                          ? "text-emerald-600"
                          : "text-purple-600"
                      }`}
                    />
                    <span className="font-medium text-slate-800">
                      {course.name}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      course.questionCount > 10
                        ? "text-green-600"
                        : course.questionCount > 5
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {course.questionCount} Questions
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No courses available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
