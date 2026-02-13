import React from "react";

const HealthCard = ({ title, value, unit, icon: Icon, color, subtitle }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md w-full min-h-[140px] flex flex-col justify-between">
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500">{title}</p>

        {Icon && (
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: color || "#E5E7EB" }}
          >
            <Icon className="text-white" size={18} />
          </div>
        )}
      </div>

      {/* Middle: primary value */}
      <div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold text-gray-900 leading-none">
            {value ?? "--"}
          </p>
          {unit && (
            <p className="text-sm text-gray-500">{unit}</p>
          )}
        </div>

        {/* Bottom: context */}
        {subtitle ? (
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        ) : (
          <div className="h-[16px]" />
        )}
      </div>
    </div>
  );
};

export default HealthCard;


