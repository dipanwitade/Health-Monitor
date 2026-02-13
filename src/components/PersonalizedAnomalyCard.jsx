// /src/components/PersonalizedAnomalyCard.jsx

import React from "react";

const PersonalizedAnomalyCard = ({ data }) => {
  const isAlert = data?.status === "alert";

  const shell = isAlert
    ? "bg-red-50/60 border-red-200"
    : "bg-green-50/60 border-green-200";

  const badge = isAlert
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className={`rounded-3xl border p-5 sm:p-6 ${shell}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-gray-600">Anomaly Summary</div>
          <div className="mt-1 text-lg sm:text-xl font-extrabold text-gray-900">
            {isAlert ? "Needs attention" : "Looks normal"}
          </div>

          {/* Date chip */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white/70 text-xs font-semibold text-gray-700">
            <span className="opacity-70">Date</span>
            <span className="text-gray-900">{data?.date}</span>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-semibold ${badge}`}
        >
          <span>{isAlert ? "⚠️" : "✅"}</span>
          <span>{isAlert ? "Alert" : "Normal"}</span>
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-white/70 p-4">
          <div className="text-xs text-gray-500">Total records</div>
          <div className="mt-1 text-xl font-extrabold text-gray-900">
            {data?.total_records ?? "--"}
          </div>
        </div>

        <div className="rounded-2xl border bg-white/70 p-4">
          <div className="text-xs text-gray-500">Anomalies</div>
          <div className="mt-1 text-xl font-extrabold text-gray-900">
            {data?.anomalies ?? "--"}
          </div>
        </div>

        <div className="rounded-2xl border bg-white/70 p-4">
          <div className="text-xs text-gray-500">Percent anomalies</div>
          <div className="mt-1 text-xl font-extrabold text-gray-900">
            {data?.percent_anomalies ?? "--"}%
          </div>
        </div>

        <div className="rounded-2xl border bg-white/70 p-4">
          <div className="text-xs text-gray-500">Status</div>
          <div className="mt-1 text-lg font-bold text-gray-900">
            {isAlert ? "⚠️ Alert" : "✅ Normal"}
          </div>
        </div>
      </div>

      
      <div className="mt-5 pt-4 border-t border-black/5 text-sm text-gray-700 leading-relaxed">
        {data?.note}
      </div>
    </div>
  );
};

export default PersonalizedAnomalyCard;
