// src/components/PeriodSelector.jsx
import React from "react";

const periods = ["Today", "Yesterday", "Custom"];

const PeriodSelector = ({ period, setPeriod }) => {
  return (
    <div className="w-full">
      <div className="bg-gray-50 border rounded-2xl p-2">
        <div className="grid grid-cols-3 gap-2">
          {periods.map((p) => {
            const active = p === period;

            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  "h-11 rounded-2xl text-sm font-semibold transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                  active
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/60",
                ].join(" ")}
                aria-pressed={active}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-center text-xs text-gray-500">
        {period === "Today"
          ? "Latest snapshots"
          : period === "Yesterday"
          ? "Previous day"
          : "Pick a date below"}
      </div>
    </div>
  );
};

export default PeriodSelector;
