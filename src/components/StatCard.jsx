import React from "react";

const StatCard = ({ title, value, unit, color }) => {
  return (
    <div className={`rounded-2xl p-4 shadow-lg bg-white border-l-4 ${color}`}>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <div className="text-2xl font-bold text-gray-800">
        {value} <span className="text-base font-medium text-gray-600">{unit}</span>
      </div>
    </div>
  );
};

export default StatCard;
