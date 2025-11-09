import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Reusable Line Chart Card Component
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

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-${color}-100 rounded-lg`}>{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickMargin={6}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              domain={["auto", "auto"]}
              tick={{ fontSize: 12 }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: "0.875rem",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={getStrokeColor(color)}
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
