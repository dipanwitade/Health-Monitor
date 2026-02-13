import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Customized,
} from "recharts";

import { formatToIST } from "../utils/time";


const MS_MIN = 60 * 1000;
const MS_HOUR = 60 * MS_MIN;

const floorToHour = (ms) => Math.floor(ms / MS_HOUR) * MS_HOUR;
const ceilToHour = (ms) => Math.ceil(ms / MS_HOUR) * MS_HOUR;

const buildTicks = (minEpoch, maxEpoch, stepHours = 4) => {
  const start = floorToHour(minEpoch);
  const end = ceilToHour(maxEpoch);
  const step = stepHours * MS_HOUR;

  const ticks = [];
  for (let t = start; t <= end; t += step) ticks.push(t);
  return ticks;
};


const formatTickLabel = (epoch) => {
  
  const raw = formatToIST(epoch);
  
  const m = String(raw).match(/(\d{1,2})(?::\d{2})?\s*([APap][Mm])/);
  if (m) return `${Number(m[1])} ${m[2].toUpperCase()}`;
  return raw;
};

// Parse timestamp robustly (ISO -> epoch)
const toEpoch = (ts) => {
  if (ts == null) return NaN;
  if (typeof ts === "number") return ts;
  
  const asNum = Number(ts);
  if (Number.isFinite(asNum)) return asNum;
  const asDate = Date.parse(ts);
  return Number.isFinite(asDate) ? asDate : NaN;
};


const BPVerticalConnectors = ({ xAxisMap, yAxisMap, data }) => {
  const xAxisKey = Object.keys(xAxisMap || {})[0];
  const yAxisKey = Object.keys(yAxisMap || {})[0];
  const xScale = xAxisMap?.[xAxisKey]?.scale;
  const yScale = yAxisMap?.[yAxisKey]?.scale;

  if (!xScale || !yScale || !Array.isArray(data)) return null;

  return (
    <g>
      {data.map((d, idx) => {
        const epoch = d?.epoch;
        const sys = d?.systolic;
        const dia = d?.diastolic;

        if (!Number.isFinite(epoch) || !Number.isFinite(sys) || !Number.isFinite(dia)) return null;

        const x = xScale(epoch);
        const y1 = yScale(sys);
        const y2 = yScale(dia);

        if (![x, y1, y2].every((v) => Number.isFinite(v))) return null;

        return (
          <line
            key={`bp-conn-${idx}`}
            x1={x}
            x2={x}
            y1={y1}
            y2={y2}
            stroke="rgba(100, 116, 139, 0.26)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
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

const LineChartPanel = ({ data, title, color }) => {
  const { chartData, ticks, isBP, hasSystolic, hasDiastolic, hasValue, minEpoch, maxEpoch } =
    useMemo(() => {
      if (!data || data.length === 0) {
        return {
          chartData: [],
          ticks: [],
          isBP: false,
          hasSystolic: false,
          hasDiastolic: false,
          hasValue: false,
          minEpoch: NaN,
          maxEpoch: NaN,
        };
      }

      // 1) Normalize + sort
      const normalized = [...data]
        .filter((d) => d?.timestamp != null || d?.time != null)
        .map((d) => {
          const ts = d.timestamp ?? d.time;
          const epoch = toEpoch(ts);

          const systolic =
            d.systolic === null || d.systolic === undefined ? undefined : Number(d.systolic);
          const diastolic =
            d.diastolic === null || d.diastolic === undefined ? undefined : Number(d.diastolic);
          const value = d.value === null || d.value === undefined ? undefined : Number(d.value);

          return { ...d, epoch, systolic, diastolic, value };
        })
        .filter((d) => Number.isFinite(d.epoch))
        .sort((a, b) => a.epoch - b.epoch);

      if (!normalized.length) {
        return {
          chartData: [],
          ticks: [],
          isBP: false,
          hasSystolic: false,
          hasDiastolic: false,
          hasValue: false,
          minEpoch: NaN,
          maxEpoch: NaN,
        };
      }

      const hasS = normalized.some((d) => Number.isFinite(d.systolic));
      const hasD = normalized.some((d) => Number.isFinite(d.diastolic));
      const hasV = normalized.some((d) => Number.isFinite(d.value));
      const bp = hasS && hasD; 

      // 2) Gap-aware breaks (non-BP only)
      const GAP_THRESHOLD = 60 * MS_MIN;
      let withGaps = normalized;

      if (!bp) {
        const out = [];
        for (let i = 0; i < normalized.length; i++) {
          const cur = normalized[i];
          out.push(cur);

          const next = normalized[i + 1];
          if (next) {
            const gap = next.epoch - cur.epoch;
            if (gap > GAP_THRESHOLD) {
              out.push({
                epoch: cur.epoch + 1,
                value: null,
              });
            }
          }
        }
        withGaps = out;
      }

      
      const minE = normalized[0].epoch;
      const maxE = normalized[normalized.length - 1].epoch;
      const rangeMs = maxE - minE;

      // Step hours by range
      const stepHours =
        rangeMs <= 3 * MS_HOUR ? 1 :
        rangeMs <= 12 * MS_HOUR ? 2 :
        rangeMs <= 24 * MS_HOUR ? 4 :
        12;

      let tickList = buildTicks(minE, maxE, stepHours);

      
      const MAX_TICKS = 5;
      if (tickList.length > MAX_TICKS) {
        const skip = Math.ceil(tickList.length / MAX_TICKS);
        tickList = tickList.filter((_, idx) => idx % skip === 0);
      }

      return {
        chartData: withGaps,
        ticks: tickList,
        isBP: bp,
        hasSystolic: hasS,
        hasDiastolic: hasD,
        hasValue: hasV,
        minEpoch: minE,
        maxEpoch: maxE,
      };
    }, [data]);

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-3xl border shadow-sm p-4 w-full text-center">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  const showDots = !isBP && /heart\s*rate|hr\b|spo2|spo₂|oxygen|o2/i.test(title);

  return (
    <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-5 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        <div className="text-xs text-gray-500">
          {Number.isFinite(minEpoch) && Number.isFinite(maxEpoch)
            ? `${formatTickLabel(minEpoch)} – ${formatTickLabel(maxEpoch)}`
            : ""}
        </div>
      </div>

      <div className="mt-3">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="epoch"
              type="number"
              domain={["dataMin", "dataMax"]}
              ticks={ticks}
              interval={0}
              minTickGap={28}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatTickLabel}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />

            
            {isBP ? (
              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: "rgba(59, 130, 246, 0.25)", strokeWidth: 2 }}
                labelFormatter={(epoch) => formatToIST(epoch)}
                content={({ active, label, payload }) => {
                  if (!active) return null;

                  const systolic = payload?.find((p) => p.dataKey === "systolic")?.value;
                  const diastolic = payload?.find((p) => p.dataKey === "diastolic")?.value;

                  return (
                    <TooltipShell
                      subtitle={formatToIST(label)}
                      title="Blood Pressure"
                      rows={[
                        { label: "Systolic", value: Number.isFinite(systolic) ? `${systolic}` : "--" },
                        { label: "Diastolic", value: Number.isFinite(diastolic) ? `${diastolic}` : "--" },
                      ]}
                    />
                  );
                }}
              />
            ) : (
              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: "rgba(59, 130, 246, 0.18)", strokeWidth: 2 }}
                labelFormatter={(epoch) => formatToIST(epoch)}
                formatter={(val, name) => {
                  if (val === null || val === undefined) return ["--", name];
                  return [val, name];
                }}
                content={({ active, label, payload }) => {
                  if (!active) return null;

                  const v = payload?.[0]?.value;
                  const unitGuess =
                    /spo2|spo₂|oxygen|o2/i.test(title) ? "%" :
                    /heart\s*rate|hr\b/i.test(title) ? "bpm" :
                    "";

                  return (
                    <TooltipShell
                      subtitle={formatToIST(label)}
                      title={title}
                      rows={[
                        {
                          label: "Value",
                          value: v == null ? "--" : `${v}${unitGuess ? ` ${unitGuess}` : ""}`,
                        },
                      ]}
                    />
                  );
                }}
              />
            )}

            
            {isBP && <Customized component={BPVerticalConnectors} />}

            
            {isBP && hasSystolic && (
              <Line
                type="monotone"
                dataKey="systolic"
                name="Systolic"
                stroke="transparent"
                dot={{ r: 3, fill: "#f87171" }}
                activeDot={{ r: 6 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}

            {isBP && hasDiastolic && (
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Diastolic"
                stroke="transparent"
                dot={{ r: 3, fill: "#60a5fa" }}
                activeDot={{ r: 6 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}

            
            {!isBP && hasValue && (
              <Line
                type="monotone"
                dataKey="value"
                name={title}
                stroke={color || "#10b981"}
                strokeWidth={2.5}
                dot={showDots ? { r: 3 } : false}
                activeDot={{ r: 6 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartPanel;
