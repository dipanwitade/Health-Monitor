import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { format, parseISO } from "date-fns";


const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const session = payload[0].payload;
    const start = format(parseISO(session.start_time), "hh:mm a");
    const end = format(parseISO(session.end_time), "hh:mm a");

    return (
      <div className="bg-white p-2 shadow rounded text-sm">
        <p className="font-semibold">{label}</p>
        <p>🛏 {session.duration.toFixed(1)} hrs</p>
        <p>🕒 {start} → {end}</p>
      </div>
    );
  }

  return null;
};

const SleepChart = ({ sleepSessions }) => {
  const data = sleepSessions.map((session) => ({
    day: format(parseISO(session.date), "EEE"),
    duration: parseFloat((session.duration_minutes / 60).toFixed(1)), // convert to hours
    ...session
  }));

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">🛌 Weekly Sleep Duration</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis unit="h" domain={[0, 12]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="duration" fill="#4f46e5" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="duration" position="top" formatter={(val) => `${val}h`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


export default SleepChart;
