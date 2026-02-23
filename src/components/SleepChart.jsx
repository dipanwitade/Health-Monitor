import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import { format, parseISO, subDays } from "date-fns";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const session = payload[0].payload;

    return (
      <div className="bg-white p-2 shadow rounded text-sm">
        <p className="font-semibold">{format(parseISO(session.date), "EEE, d MMM")}</p>
        <p> {session.hours?.toFixed(1) || "0"} hrs</p>
      </div>
    );
  }
  return null;
};

const isMobile = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;

const SleepChart = ({ sleepSessions, isDemo = false }) => {
  const groupedByDate = {};
  (sleepSessions || []).forEach((s) => {
    const dateStr = s.date;
    if (!dateStr) return;
    groupedByDate[dateStr] =
      (groupedByDate[dateStr] || 0) + (s.duration_hours || 0);
  });

  const buildFromToday = () => {
    const today = new Date();
    return [...Array(7)].map((_, i) => {
      const d = subDays(today, 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      return {
        date: dateStr,
        hours: Math.round((groupedByDate[dateStr] || 0) * 10) / 10,
        label: format(d, isMobile() ? "EEEEE" : "EEE"), 
      };
    });
  };

  const buildFromDataset = () => {
    const dates = Object.keys(groupedByDate).sort();
    const last = dates.slice(-7);

    const padded =
      last.length < 7
        ? [...Array(7 - last.length)]
            .map((_, i) => {
              const d = subDays(new Date(), (7 - last.length) - i);
              return format(d, "yyyy-MM-dd");
            })
            .concat(last)
        : last;

    return padded.map((dateStr) => {
      const d = parseISO(dateStr);
      return {
        date: dateStr,
        hours: Math.round((groupedByDate[dateStr] || 0) * 10) / 10,
        label: format(d, isMobile() ? "EEEEE" : "EEE"),
      };
    });
  };

  const chartData = isDemo ? buildFromDataset() : buildFromToday();
  const mobile = isMobile();

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Sleep (Last 7 Days)</h2>

      <ResponsiveContainer width="100%" height={mobile ? 220 : 300}>
        <BarChart data={chartData} barCategoryGap={mobile ? 18 : 10}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="label"
            tick={{ fontSize: mobile ? 11 : 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            unit="h"
            domain={[0, 12]}
            tick={{ fontSize: mobile ? 11 : 12 }}
            width={mobile ? 28 : 36}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]}>
            {/* show labels only on desktop */}
            {!mobile && (
              <LabelList
                dataKey="hours"
                position="top"
                formatter={(val) => `${val}h`}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepChart;