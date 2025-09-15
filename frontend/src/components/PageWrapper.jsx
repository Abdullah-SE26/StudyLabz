import React from "react";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 px-4 py-6">
      <div className="w-full max-w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
