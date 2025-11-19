import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

/**
 * Reusable Line Chart Card Component using Chart.js
 * @param {string} title - Chart title
 * @param {ReactNode} icon - Icon component
 * @param {Array} data - Array of { date, count }
 * @param {string} color - Tailwind color name (blue, purple, green, orange, etc.)
 */
export default function LineChartCard({ title, icon, data, color }) {
  const getStrokeColor = (color) => {
    switch (color) {
      case "blue":
        return "#3b82f6";
      case "purple":
        return "#a855f7";
      case "green":
        return "#10b981";
      case "orange":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  const chartData = useMemo(() => ({
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: title,
        data: data.map((d) => d.count),
        borderColor: getStrokeColor(color),
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }), [data, color, title]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#374151" },
      },
      y: {
        grid: { color: "#e5e7eb" },
        ticks: { color: "#374151", stepSize: 1 },
        beginAtZero: true,
      },
    },
  }), []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 250 }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
