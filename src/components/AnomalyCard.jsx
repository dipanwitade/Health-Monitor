// components/AnomalyCard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AnomalyCard = ({ email, selectedDate }) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetchAnomaly = async () => {
      try {
        let formattedDate = null;
        // 🔒 Handle both string and Date object for safety
        if (selectedDate) {
          if (typeof selectedDate === "string") {
            formattedDate = selectedDate;
          } else if (selectedDate instanceof Date && !isNaN(selectedDate)) {
            formattedDate = selectedDate.toISOString().split("T")[0];
          }
        }
        // const dateParam = selectedDate? `&date=${selectedDate.toISOString().split("T")[0]}`: "";
        const dateParam = formattedDate ? `&date=${formattedDate}` : "";
        const res = await axios.get(
          `http://localhost:8000/ai/anomaly?email=${email}${dateParam}`
        );
        setData(res.data);
        setStatus("success");
      } catch (err) {
        console.error("❌ Failed to fetch anomaly data", err);
        setStatus("error");
      }
    };

    if (email) fetchAnomaly();
  }, [email, selectedDate]);

  const renderContent = () => {
    if (status === "loading") return <p>Loading...</p>;
    if (status === "error") return <p className="text-red-600">Error loading data</p>;
    if (!data || data.status === "no_data")
      return <p className="text-gray-500">No resting health data found.</p>;

    if (data.status === "insufficient") {
      return (
        <p className="text-yellow-600">
          Not enough resting data to analyze anomalies.
        </p>
      );
    }

    const isAnomaly = data.status === "alert";

    return (
      <div>
        <p className={`text-xl font-semibold ${isAnomaly ? "text-red-600" : "text-green-600"}`}>
          {isAnomaly ? "⚠️ Anomalies Detected" : "✅ All Clear"}
        </p>
        <p className="text-sm mt-2">
          Anomaly %: <strong>{data.percent_anomalies}%</strong> <br />
          Records: {data.total_records} • Anomalies: {data.anomalies}
        </p>
        <p className="text-xs text-gray-500 mt-1 italic">{data.note}</p>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">🧠 AI Health Risk Summary</h3>
      {renderContent()}
    </div>
  );
};

export default AnomalyCard;
