import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { format, parseISO, subDays} from "date-fns";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const session = payload[0].payload;
    // const dateLabel = session.date ? format(parseISO(session.date), "d MMM") : "";
    const formattedDate = session.date ? format(parseISO(session.date), "d MMM") : "";
    // const start = format(parseISO(session.start_time), "hh:mm a");
    // const end = format(parseISO(session.end_time), "hh:mm a");

    return (
      <div className="bg-white p-2 shadow rounded text-sm">
        {/* <p className="font-semibold">{label} ({dateLabel})</p> */}
        {/* <p className="font-semibold">{label} ({formattedDate})</p> */}
        <p className="font-semibold">{label} ({format(parseISO(session.date), "d MMM")})</p>



        {/* <p>🛏 {session.hours.toFixed(1)} hrs</p> */}
        <p>🛏 {session.hours?.toFixed(1) || "0"} hrs</p>

        {/* <p>🛏 {session.duration.toFixed(1)} hrs</p> */}
        {/* <p>🕒 {start} → {end}</p> */}
      </div>
    );
  }

  return null;
};

// const SleepChart = ({ sleepSessions }) => {
//   const data = sleepSessions.map((session) => ({
//     day: format(parseISO(session.date), "EEE"),
//     duration: parseFloat((session.duration_minutes / 60).toFixed(1)), // convert to hours
//     ...session
//   }));

const SleepChart = ({ sleepSessions }) => {
  // Group total sleep per day
  const grouped = {};

  sleepSessions.forEach((s) => {
    const date = new Date(s.date);
    const day = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Map Sun=0 → 6, Mon=1 → 0
    grouped[day] = (grouped[day] || 0) + s.duration_hours;
  });


  // const chartData = daysOfWeek.map((day) => ({
  //   day,
  //   hours: Math.round((grouped[day] || 0) * 100) / 100,
  // }));

  //   const chartData = daysOfWeek.map((day) => {
  //   const sessionsForDay = sleepSessions.filter((s) => {
  //     const date = new Date(s.date);
  //     const d = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1];
  //     return d === day;
  //   });

  //   const totalHours = sessionsForDay.reduce((acc, s) => acc + s.duration_hours, 0);
  //   const dateLabel = sessionsForDay.length ? sessionsForDay[0].date : null;

  //   return {
  //     day,
  //     hours: Math.round(totalHours * 100) / 100,
  //     date: dateLabel,
  //   };
  // });

  const today = new Date();

// Build the last 7 days, Mon → Sun
const last7Dates = [...Array(7)].map((_, i) => {
  const d = subDays(today, 6 - i); // oldest to newest
  const day = daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1]; // Map Sun=0 to 6
  const dateStr = format(d, "yyyy-MM-dd");

  return { day, date: dateStr };
});

// Map with grouped durations
const chartData = last7Dates.map(({ day, date }) => ({
  day,
  date,
  hours: Math.round((grouped[day] || 0) * 100) / 100,
}));

  // const chartData = daysOfWeek.map((day, index) => {
  //   const date = new Date();
  //   date.setDate(date.getDate() - ((6 - index + date.getDay()) % 7));
  //   const dateStr = format(date, "yyyy-MM-dd");

  //   return {
  //     day,
  //     date: dateStr,
  //     hours: Math.round((grouped[day] || 0) * 100) / 100,
  //   };
  // });


  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-4">🛌 Sleep (Last 7 Days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
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

#this is new