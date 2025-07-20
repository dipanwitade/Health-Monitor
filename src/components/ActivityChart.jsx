import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500">
        <h3 className="text-lg font-semibold mb-2">Activity Duration (Last 7 Days)</h3>
        <p>No activity data found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2 text-gray-700">Activity Duration (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="activity_type" />
          <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Bar dataKey="duration_minutes" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
