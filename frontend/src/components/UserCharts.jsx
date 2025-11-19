import { memo } from "react";
import { HelpCircle, Bookmark } from "lucide-react";
import LineChartCard from "../components/LineChartCard";

const UserCharts = memo(({ stats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <LineChartCard
        title="My Questions Over Time"
        icon={<HelpCircle className="w-5 h-5 text-blue-600" />}
        data={stats?.dailyUserQuestions || []}
        color="blue"
      />
      <LineChartCard
        title="My Bookmarks Over Time"
        icon={<Bookmark className="w-5 h-5 text-green-600" />}
        data={stats?.dailyBookmarks || []}
        color="green"
      />
    </div>
  );
});

export default UserCharts;
