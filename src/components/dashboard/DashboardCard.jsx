import React from "react";
const DashboardCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-5 flex flex-col items-start justify-between w-full sm:w-1/3">
    <h3 className="text-sm text-gray-500 dark:text-gray-300">{title}</h3>
    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{value}</p>
  </div>
);

export default DashboardCard;