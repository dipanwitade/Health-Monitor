import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";



// const HealthChart = ({ title, data, dataKey, color }) => {
//   return (
//     <div className="bg-white p-4 rounded-2xl shadow-md w-full">
//       <h3 className="text-lg font-semibold mb-2">{title}</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" />
//           <YAxis />
//           <Tooltip />
//           <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

const HealthChart = ({ data = [], color = "#ef4444", metric = "Heart Rate" }) => {
  // Check if we have valid data
  const hasData = Array.isArray(data) && data.length > 0;

  // Add dummy point to force axes/grid even if no real data
  const chartData = hasData ? data : [{ timestamp: "", value: 0 }];

  return (
    <div className="w-full min-h-[250px] bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Daily {metric} Chart
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          {hasData && (
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {!hasData && (
        <div className="text-center text-sm text-gray-400 mt-2">
          No data available
        </div>
      )}
    </div>
  );
};

export default HealthChart;