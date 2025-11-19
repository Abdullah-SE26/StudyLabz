import { memo } from "react";
import { Users, HelpCircle } from "lucide-react";
import LineChartCard from "../components/LineChartCard";

const AdminCharts = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <LineChartCard
        title="Daily Users"
        icon={<Users className="w-5 h-5 text-blue-600" />}
        data={stats?.dailyUsers || []}
        color="blue"
      />
      <LineChartCard
        title="Daily Questions"
        icon={<HelpCircle className="w-5 h-5 text-purple-600" />}
        data={stats?.dailyQuestions || []}
        color="purple"
      />
    </div>
  );
});

export default AdminCharts;
