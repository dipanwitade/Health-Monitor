// src/components/SleepBarChart.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import moment from "moment";

const SleepBarChart = ({ email }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/sleep/week", {
          params: { user_email: email }
        });

        const formatted = res.data.map(entry => ({
          day: moment(entry.start_time).format("ddd"),
          duration: parseFloat((entry.duration_minutes / 60).toFixed(2)),
          start: moment(entry.start_time).format("h:mm A"),
          end: moment(entry.end_time).format("h:mm A"),
        }));

        setData(formatted);
      } catch (err) {
        console.error("Error fetching sleep data:", err);
      }
    };

    fetchSleepData();
  }, [email]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow text-sm">
          <strong>{label}</strong><br />
          Start: {d.start}<br />
          End: {d.end}<br />
          Duration: {d.duration} hrs
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">Sleep Duration (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis unit="h" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="duration" fill="#4f46e5">
            <LabelList dataKey="duration" position="top" formatter={(val) => `${val}h`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepBarChart;
