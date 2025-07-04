import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";

const formatDuration = (minutes) => (minutes / 60).toFixed(1); // hours

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const session = payload[0].payload;
    const start = format(parseISO(session.start_time), "hh:mm a");
    const end = format(parseISO(session.end_time), "hh:mm a");

    return (
      <div className="bg-white p-2 shadow rounded text-sm">
        <p className="font-semibold">{label}</p>
        <p>🛏 {formatDuration(session.duration_minutes)} hrs</p>
        <p>🕒 {start} → {end}</p>
      </div>
    );
  }

  return null;
};

const WeeklySleepChart = ({ sleepSessions }) => {
  const data = sleepSessions.map((session) => ({
    day: format(parseISO(session.date), "EEE"),
    duration: parseFloat(formatDuration(session.duration_minutes)),
    ...session
  }));

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">🛌 Weekly Sleep Duration</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis unit="h" />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="duration" fill="#6D28D9" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySleepChart;
