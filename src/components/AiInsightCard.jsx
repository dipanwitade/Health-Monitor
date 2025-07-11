import React from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const AiInsightCard = ({ result, score }) => {
  const isAnomaly = result === "anomaly";

  return (
    <div className={`p-4 rounded-xl shadow-md flex items-center gap-4
      ${isAnomaly ? "bg-red-100 border border-red-400 text-red-700" : "bg-green-100 border border-green-400 text-green-700"}
    `}>
      {isAnomaly ? (
        <FaExclamationTriangle size={28} className="text-red-500" />
      ) : (
        <FaCheckCircle size={28} className="text-green-500" />
      )}
      <div>
        <h4 className="text-lg font-bold">
          {isAnomaly ? "⚠️ Anomaly Detected" : "✅ Normal Health"}
        </h4>
        <p className="text-sm">
          Isolation Forest Score: <span className="font-mono">{score?.toFixed(4)}</span>
        </p>
      </div>
    </div>
  );
};

export default AiInsightCard;
