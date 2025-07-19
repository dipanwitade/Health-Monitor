// components/InsightsPanel.jsx
import React from "react";

const InsightsPanel = ({ insights }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">🧠 Smart Insights</h3>
      {insights.length === 0 ? (
        <p className="text-gray-500">No insights available right now.</p>
      ) : (
        <ul className="list-disc ml-5 space-y-1 text-gray-700">
          {insights.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InsightsPanel;
