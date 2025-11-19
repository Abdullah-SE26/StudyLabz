import { Users, BookOpen, HelpCircle, ClipboardList, Bookmark, Activity } from "lucide-react";

export default function QuickStats({ stats, isAdmin }) {
  const statCards = isAdmin
    ? [
        { label: "Total Users", value: stats?.totalUsers || 0, icon: <Users />, color: "blue", subtitle: "Registered users" },
        { label: "Total Courses", value: stats?.totalCourses || 0, icon: <BookOpen />, color: "emerald", subtitle: "Available courses" },
        { label: "Total Questions", value: stats?.totalQuestions || 0, icon: <HelpCircle />, color: "purple", subtitle: "All questions" },
        { label: "Total Reports", value: stats?.totalReports || 0, icon: <ClipboardList />, color: "orange", subtitle: "Reported content" },
      ]
    : [
        { label: "My Questions", value: stats?.userQuestions || 0, icon: <HelpCircle />, color: "blue", subtitle: "Questions created" },
        { label: "My Bookmarks", value: stats?.userBookmarks || 0, icon: <Bookmark />, color: "emerald", subtitle: "Saved questions" },
        { label: "Total Courses", value: stats?.totalCourses || 0, icon: <BookOpen />, color: "purple", subtitle: "Available courses" },
        { label: "Recent Activity", value: stats?.recentQuestions?.length || 0, icon: <Activity />, color: "orange", subtitle: "Recent questions" },
      ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {statCards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-xl p-4 shadow-lg border border-slate-200/50 hover:shadow-xl transition-all duration-200 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{card.label}</p>
              <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
            </div>
            <div className={`p-2 bg-${card.color}-100 rounded-lg`}>{card.icon}</div>
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
