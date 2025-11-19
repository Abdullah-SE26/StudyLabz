import React, { Suspense } from "react";

const LazyChart = React.lazy(() => import("./LineChartCard"));

export default function LineChartCardWrapper(props) {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl p-4 shadow-sm h-[300px] border border-slate-200 flex items-center justify-center">
          <p className="text-slate-500 text-sm">Loading chart…</p>
        </div>
      }
    >
      <LazyChart {...props} />
    </Suspense>
  );
}
