// /src/components/PersonalizedHealthChart.jsx

import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ReferenceArea,
} from "recharts";


const toEpoch = (ts) => {
  const ms = Date.parse(ts);
  return Number.isFinite(ms) ? ms : NaN;
};

const shortTime = (epochOrIso) => {
  try {
    const d = typeof epochOrIso === "number" ? new Date(epochOrIso) : new Date(epochOrIso);
    
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
};

const shortTick = (epoch) => {
  const raw = shortTime(epoch);
  
  const m = String(raw).match(/(\d{1,2}):(\d{2})\s*([APap][Mm])/);
  if (m && m[2] === "00") return `${Number(m[1])} ${m[3].toUpperCase()}`;
  return raw;
};

const buildTicksCapped = (minE, maxE) => {
  const range = maxE - minE;
  const H = 60 * 60 * 1000;

 
  const step =
    range <= 3 * H ? 1 * H :
    range <= 12 * H ? 2 * H :
    range <= 24 * H ? 4 * H :
    12 * H;

  const start = Math.floor(minE / step) * step;
  const end = Math.ceil(maxE / step) * step;

  let ticks = [];
  for (let t = start; t <= end; t += step) ticks.push(t);

 
  const MAX = 5;
  if (ticks.length > MAX) {
    const skip = Math.ceil(ticks.length / MAX);
    ticks = ticks.filter((_, i) => i % skip === 0);
  }
  return ticks;
};


const TooltipShell = ({ title, subtitle, rows }) => (
  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md">
    {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
    {title ? <div className="text-sm font-bold text-gray-900">{title}</div> : null}
    <div className="mt-2 space-y-1">
      {rows.map((r, i) => (
        <div key={i} className="text-sm text-gray-700 flex items-center justify-between gap-4">
          <span className="font-semibold">{r.label}</span>
          <span>{r.value}</span>
        </div>
      ))}
    </div>
  </div>
);


const MetricTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload;
  if (!p) return null;

  const hr = Number.isFinite(p.heart_rate) ? Math.round(p.heart_rate) : null;
  const sp = Number.isFinite(p.spo2) ? Math.round(p.spo2) : null;
  const sys = Number.isFinite(p.systolic_bp) ? Math.round(p.systolic_bp) : null;
  const dia = Number.isFinite(p.diastolic_bp) ? Math.round(p.diastolic_bp) : null;

  return (
    <TooltipShell
      subtitle={shortTime(p.t)}
      title={p.is_anomaly === 1 ? "Anomaly window" : "Normal window"}
      rows={[
        { label: "Heart Rate", value: hr == null ? "--" : `${hr} bpm` },
        { label: "SpO₂", value: sp == null ? "--" : `${sp}%` },
        { label: "BP", value: sys == null || dia == null ? "--" : `${sys}/${dia}` },
      ]}
    />
  );
};

const METRICS = [
  { key: "heart_rate", label: "Heart Rate" },
  { key: "spo2", label: "SpO₂" },
  { key: "systolic_bp", label: "Systolic BP" },
  { key: "diastolic_bp", label: "Diastolic BP" },
];

const SegmentedMetric = ({ selected, onChange }) => {
  return (
    <div className="bg-gray-50 border rounded-2xl p-2">
      <div className="grid grid-cols-2 gap-2">
        {METRICS.map((m) => {
          const active = selected === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onChange(m.key)}
              className={[
                "h-11 rounded-2xl text-sm font-semibold transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                active
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/60",
              ].join(" ")}
              aria-pressed={active}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PersonalizedHealthChart = ({ series = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState("heart_rate");

  const cleaned = useMemo(() => {
    const arr = Array.isArray(series) ? series : [];
    return arr
      .filter((p) => p?.timestamp)
      .slice()
      .sort((a, b) => toEpoch(a.timestamp) - toEpoch(b.timestamp))
      .map((p) => {
        const t = toEpoch(p.timestamp);
        return { ...p, t };
      })
      .filter((p) => Number.isFinite(p.t));
  }, [series]);

  const anomalyPoints = useMemo(() => cleaned.filter((p) => p.is_anomaly === 1), [cleaned]);

  const anomalyRanges = useMemo(() => {
    const ranges = [];
    let start = null;
    let prevWas = false;

    for (let i = 0; i < cleaned.length; i++) {
      const cur = cleaned[i];
      const isA = cur.is_anomaly === 1;

      if (isA && !prevWas) start = cur.t;

      if (!isA && prevWas && start != null) {
        const end = cleaned[i - 1]?.t;
        if (end != null) ranges.push({ start, end });
        start = null;
      }

      prevWas = isA;
    }

    if (prevWas && start != null) {
      const end = cleaned[cleaned.length - 1]?.t;
      if (end != null) ranges.push({ start, end });
    }

    return ranges;
  }, [cleaned]);

  const ticks = useMemo(() => {
    if (!cleaned.length) return [];
    const minE = cleaned[0].t;
    const maxE = cleaned[cleaned.length - 1].t;
    return buildTicksCapped(minE, maxE);
  }, [cleaned]);

  const selectedLabel =
    METRICS.find((m) => m.key === selectedMetric)?.label || "Metric";

  if (!cleaned.length) {
    return <div className="text-gray-600">No timeline data available yet.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-gray-600">
          Windows:{" "}
          <span className="font-semibold text-gray-900">{cleaned.length}</span>{" "}
          • Anomalies:{" "}
          <span className="font-semibold text-gray-900">{anomalyPoints.length}</span>
        </div>
      </div>

      {/* Metric control (segmented) */}
      <div>
        <div className="text-sm font-semibold text-gray-900 mb-2">Metric</div>
        <SegmentedMetric selected={selectedMetric} onChange={setSelectedMetric} />
      </div>

      {/* 1) Anomaly timeline strip */}
      <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-gray-900">Anomaly timeline</div>
            <div className="text-xs text-gray-500">Red windows differ from your baseline</div>
          </div>
        </div>

        <div className="mt-3 h-[90px] w-full">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={ticks}
                interval={0}
                minTickGap={28}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={shortTick}
              />
              <YAxis hide domain={[0, 1]} />

              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: "rgba(59, 130, 246, 0.18)", strokeWidth: 2 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const p = payload[0]?.payload;
                  if (!p) return null;

                  return (
                    <TooltipShell
                      subtitle={shortTime(p.t)}
                      title="Window"
                      rows={[
                        {
                          label: "Status",
                          value: p.is_anomaly === 1 ? "Anomaly" : "Normal",
                        },
                      ]}
                    />
                  );
                }}
              />

              <Scatter
                data={cleaned.filter((p) => p.is_anomaly !== 1)}
                dataKey="is_anomaly"
                fill="#22c55e"
              />
              <Scatter data={anomalyPoints} dataKey="is_anomaly" fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Tip: Tap around to inspect windows; use the metric trend below for details.
        </div>
      </div>

      {/* 2) Metric trend */}
      <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-bold text-gray-900">Trend</div>
            <div className="text-xs text-gray-500">{selectedLabel} across resting windows</div>
          </div>
        </div>

        <div className="mt-3 h-[280px] w-full">
          <ResponsiveContainer>
            <LineChart data={cleaned} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                ticks={ticks}
                interval={0}
                minTickGap={28}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={shortTick}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />

              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: "rgba(59, 130, 246, 0.18)", strokeWidth: 2 }}
                content={<MetricTooltip />}
              />

              {/* Highlight anomaly runs subtly */}
              {anomalyRanges.map((r, idx) => (
                <ReferenceArea
                  key={idx}
                  x1={r.start}
                  x2={r.end}
                  fill="rgba(239, 68, 68, 0.08)"
                  strokeOpacity={0}
                />
              ))}

              <Line
                type="monotone"
                dataKey={selectedMetric}
                dot={false}
                strokeWidth={2.5}
                stroke="rgba(17, 24, 39, 0.85)"
                connectNulls={false}
                isAnimationActive={false}
              />

              {/* Overlay anomaly points */}
              <Scatter
                data={anomalyPoints}
                dataKey={selectedMetric}
                fill="#ef4444"
                shape="circle"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Tip: Tooltips show HR, SpO₂, and BP for the same time window.
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHealthChart;
