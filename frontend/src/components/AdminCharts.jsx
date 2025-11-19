import { memo } from "react";
import { Users, HelpCircle } from "lucide-react";
import LineChartCardWrapper from "./LineChartCardWrapper";

const AdminCharts = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <LineChartCardWrapper
        title="Daily Users"
        icon={<Users className="w-5 h-5 text-blue-600" />}
        data={stats?.dailyUsers || []}
        color="blue"
      />

      <LineChartCardWrapper
        title="Daily Questions"
        icon={<HelpCircle className="w-5 h-5 text-purple-600" />}
        data={stats?.dailyQuestions || []}
        color="purple"
      />
    </div>
  );
});

export default AdminCharts;
