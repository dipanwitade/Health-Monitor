import React from "react";

const HealthCard = ({ title, value, unit, icon, color }) => {
  // const displayValue = value !== null && value !== undefined ? value : "--";
  const displayValue = value === "--" ? "No data" : `${value} ${unit} (average)`;
  return (
    <div className={`p-4 rounded-2xl shadow-md text-white ${color} w-full`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm uppercase tracking-wider">{title} </h4>
          <h2 className="text-2xl font-bold mt-1">
            {displayValue}  
            {/* <span className="text-sm font-medium">{unit} (average)</span> */}
          </h2>
          
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default HealthCard;
