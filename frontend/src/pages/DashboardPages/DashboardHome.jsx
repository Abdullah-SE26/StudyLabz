// src/pages/DashboardPages/DashboardHome.jsx
export default function DashboardHome() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Courses</div>
          <div className="stat-value">12</div>
        </div>

        <div className="stat">
          <div className="stat-title">Users</div>
          <div className="stat-value">84</div>
        </div>

        <div className="stat">
          <div className="stat-title">Reports</div>
          <div className="stat-value">5</div>
        </div>
      </div>
    </div>
  );
}
