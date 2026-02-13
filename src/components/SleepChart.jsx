import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { format, parseISO, subDays } from "date-fns";



const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const session = payload[0].payload;



    return (
      <div className="bg-white p-2 shadow rounded text-sm">

        
        <p className="font-semibold">{format(parseISO(session.date), "EEE, d MMM")}</p>


        <p>🛏 {session.hours?.toFixed(1) || "0"} hrs</p>
      </div>
    );
  }

  return null;
};



const SleepChart = ({ sleepSessions }) => {
  
  const groupedByDate = {};
  sleepSessions.forEach((s) => {
    const dateStr = s.date;
    groupedByDate[dateStr] = (groupedByDate[dateStr] || 0) + s.duration_hours;
  });

  
  const today = new Date();
  const last7Days = [...Array(7)].map((_, i) => {
    const d = subDays(today, 6 - i); 
    const dateStr = format(d, "yyyy-MM-dd");
    const weekday = format(d, "EEE");       
  

    return {
      date: dateStr,
      hours: Math.round((groupedByDate[dateStr] || 0) * 10) / 10,
      label: weekday,
    };
  });







  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">🛌 Sleep (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={last7Days}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis unit="h" domain={[0, 12]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="hours" position="top" formatter={(val) => `${val}h`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


export default SleepChart;
