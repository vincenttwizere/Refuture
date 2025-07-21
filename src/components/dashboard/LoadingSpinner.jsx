import React from "react";
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-2 text-gray-600 dark:text-gray-300">Loading...</p>
  </div>
);

export default LoadingSpinner;