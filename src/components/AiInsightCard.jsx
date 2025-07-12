// import React from "react";
// import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

// const AiInsightCard = ({ result, score }) => {
//   const isAnomaly = result === "anomaly";

//   return (
//     <div className={`p-4 rounded-xl shadow-md flex items-center gap-4
//       ${isAnomaly ? "bg-red-100 border border-red-400 text-red-700" : "bg-green-100 border border-green-400 text-green-700"}
//     `}>
//       {isAnomaly ? (
//         <FaExclamationTriangle size={28} className="text-red-500" />
//       ) : (
//         <FaCheckCircle size={28} className="text-green-500" />
//       )}
//       <div>
//         <h4 className="text-lg font-bold">
//           {isAnomaly ? "⚠️ Anomaly Detected" : "✅ Normal Health"}
//         </h4>
//         <p className="text-sm">
//           Isolation Forest Score: <span className="font-mono">{score?.toFixed(4)}</span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default AiInsightCard;



// src/components/AiInsightCard.jsx

import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const AiInsightCard = ({ result, score }) => {
  let bgColor = "bg-gray-100";
  let icon = <FaInfoCircle className="text-gray-600 text-2xl" />;
  let title = "No Insight";
  let message = "Not enough data to generate health insights.";

  if (result === "normal") {
    bgColor = "bg-green-100";
    icon = <FaCheckCircle className="text-green-600 text-2xl" />;
    title = "✅ Normal Health";
    message = "All health metrics are within the normal range.";
  } else if (result === "anomaly") {
    bgColor = "bg-red-100";
    icon = <FaExclamationTriangle className="text-red-600 text-2xl" />;
    title = "⚠️ Anomaly Detected";
    message = "Some health parameters appear abnormal. Please consult a doctor if needed.";
  }

  return (
    <div className={`p-4 rounded-xl shadow ${bgColor} flex items-start gap-4`}>
      <div>{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-700">{message}</p>
        {score !== undefined && (
          <p className="text-xs text-gray-500 mt-1">
            Isolation Forest Score: <span className="font-mono">{score.toFixed(4)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default AiInsightCard;
