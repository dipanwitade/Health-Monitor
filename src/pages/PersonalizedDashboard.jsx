// /src/pages/PersonalizedDashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonalizedAnomalyCard from "../components/PersonalizedAnomalyCard";
import PersonalizedHealthChart from "../components/PersonalizedHealthChart";
import axios from "../api/axios";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";

import DemoTourModal from "../components/DemoTourModal";
import { isDemoMode, exitDemoMode } from "../demo/demoMode";
import { demoAnomalySummary } from "../demo/demoData";

const DonutCenterLabel = ({ viewBox, value, status }) => {
  const cx = viewBox?.cx;
  const cy = viewBox?.cy;
  if (cx == null || cy == null) return null;

  const isAlert = status === "alert";

  return (
    <>
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`text-2xl font-extrabold ${isAlert ? "fill-red-700" : "fill-green-700"}`}
      >
        {Number(value).toFixed(1)}%
      </text>

      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        className={`text-xs font-semibold ${isAlert ? "fill-red-600" : "fill-green-600"}`}
      >
        {isAlert ? "Anomalies" : "Normal"}
      </text>
    </>
  );
};

const PersonalizedDashboard = () => {
  const demo = isDemoMode();
  const [tourOpen, setTourOpen] = useState(false);
  const [anomalyData, setAnomalyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    setLoading(true);
    const email = localStorage.getItem("user_email");
    if (demo) {
      setAnomalyData(demoAnomalySummary);
      setMessage("");
      setLoading(false);
      return;
    }

    if (!email) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get("/personal_anomaly", { params: { email } });

        if (res.data.status === "no_data" || res.data.status === "insufficient") {
          setMessage(res.data.message);
          setAnomalyData(null);
        } else {
          setMessage("");
          setAnomalyData(res.data);
        }
      } catch (err) {
        if (err.response?.status === 202) {
          setMessage("Personalized model is still learning your baseline data.");
        } else {
          setMessage("Failed to load personalized health insights.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // }, [navigate]);
  }, [demo, navigate]);


  const statusMeta = useMemo(() => {
    const status = anomalyData?.status;
    if (status === "alert") {
      return {
        label: "Alert",
        badge: "bg-red-50 text-red-700 border-red-200",
        border: "border-red-200",
        icon: "⚠️",
        headline: "Needs attention",
      };
    }
    return {
      label: "Normal",
      badge: "bg-green-50 text-green-700 border-green-200",
      border: "border-green-200",
      icon: "✅",
      headline: "Looks normal",
    };
  }, [anomalyData]);

  const percent = Number(anomalyData?.percent_anomalies ?? 0);
  const anomalyColor = anomalyData?.status === "alert" ? "#ef4444" : "#22c55e";

  const donutData = useMemo(() => {
    const p = Math.max(0, Math.min(100, Number(percent) || 0));
    return [
      { name: "Anomalies", value: p },
      { name: "Normal", value: 100 - p },
    ];
  }, [percent]);

  const whatItMeansText = useMemo(() => {
    if (!anomalyData) return "";
    if (anomalyData.status === "alert") {
      return (
        "Most of today’s resting readings were different from your usual baseline. " +
        "This can happen due to stress, illness, poor sleep, unusual activity, or sensor noise. " +
        "If this continues for multiple days or you feel unwell, consider monitoring closely or consulting a professional."
      );
    }
    return (
      "Your resting readings are mostly consistent with your usual baseline. " +
      "Small variations are normal. Keep tracking regularly to maintain a reliable baseline."
    );
  }, [anomalyData]);

  const contributors = anomalyData?.top_contributors ?? [];
  const confidence = anomalyData?.data_confidence ?? null;

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    });
  }, []);

  // ---- Early returns (clean + prevents overlap) ----
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">{todayLabel}</div>
                <div className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  Insights
                </div>
              </div>
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700 text-xs font-semibold">
                Analyzing
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-10">
          <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Personalized baseline</div>
                <div className="text-base font-bold text-gray-900">Analyzing your health data…</div>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
            </div>

            <div className="mt-4 h-40 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!loading && message) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-gray-500">{todayLabel}</div>
                <div className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                  Insights
                </div>
              </div>
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700 text-xs font-semibold">
                Ready
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-10">
          <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6">
            <div className="text-base font-bold text-gray-900">Personalized insights</div>
            <p className="mt-2 text-sm text-gray-700">{message}</p>

            <div className="mt-4 text-xs text-gray-500">
              Tip: Sync a few days of resting data and check again.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main UI ----
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">{todayLabel}</div>
              <div className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                Insights
              </div>
            </div>

            {anomalyData ? (
              <div
                className={[
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full border whitespace-nowrap",
                  statusMeta.badge,
                ].join(" ")}
              >
                <span>{statusMeta.icon}</span>
                <span className="font-semibold">{statusMeta.label}</span>
                {confidence ? (
                  <span className="text-xs opacity-80">• confidence: {confidence}</span>
                ) : null}
              </div>
            ) : (
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700 text-xs font-semibold">
                Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {demo && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-2xl border bg-yellow-50 p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-yellow-900">
              <span className="font-extrabold">DEMO MODE</span> — showing sample insights.
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="px-3 py-2 rounded-xl border bg-white hover:bg-yellow-100 text-sm font-semibold"
              >
                Start Tour
              </button>

              <button
                type="button"
                onClick={() => {
                  exitDemoMode();
                  navigate("/", { replace: true });
                }}
                className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-sm font-semibold"
              >
                Exit Demo
              </button>

              <button
                type="button"
                onClick={() => {
                  exitDemoMode();
                  navigate("/login", { replace: true });
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                Connect Google Fit
              </button>
            </div>
          </div>
        </div>
      )}

      <DemoTourModal open={tourOpen} onClose={() => setTourOpen(false)} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-10 space-y-5">
        <div className="text-sm text-gray-500">
          Personalized baseline insights for today
        </div>

        {anomalyData ? (
          <>
            {/* Row 1: Summary + donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Summary card */}
              <div className={["bg-white rounded-3xl border shadow-sm p-5 sm:p-6", statusMeta.border, "lg:col-span-2"].join(" ")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mt-1 text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      <span>{statusMeta.icon}</span>
                      <span>{statusMeta.headline}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Based on your resting baseline windows.
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <PersonalizedAnomalyCard data={anomalyData} />
                </div>

                {contributors.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-gray-700 mb-2">
                      Main contributors today
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contributors.map((c) => (
                        <span
                          key={c}
                          className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-sm border"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Donut */}
              <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Anomaly rate</div>
                    <div className="mt-1 text-2xl font-extrabold text-gray-900">
                      {Number(percent).toFixed(2)}%
                    </div>
                  </div>

                  <span
                    className={[
                      "px-3 py-1 rounded-full border text-xs font-semibold",
                      anomalyData.status === "alert"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-green-50 text-green-700 border-green-200",
                    ].join(" ")}
                  >
                    {anomalyData.status === "alert" ? "High" : "Normal"}
                  </span>
                </div>

                <div className="mt-3 h-[180px] sm:h-[220px] w-full">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="70%"
                        outerRadius="92%"
                        paddingAngle={2}
                        isAnimationActive={true}
                      >
                        <Cell fill={anomalyColor} />
                        <Cell fill="#e5e7eb" />

                        <Label
                          position="center"
                          content={(props) => (
                            <DonutCenterLabel
                              {...props}
                              value={percent}
                              status={anomalyData.status}
                            />
                          )}
                        />
                      </Pie>

                      <Tooltip
                        formatter={(value) =>
                          typeof value === "number" ? `${value.toFixed(2)}%` : value
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  {anomalyData.status === "alert"
                    ? "Higher-than-usual deviation from baseline today."
                    : "Within your normal baseline range."}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Tip: Look at the timeline to see when deviations happened.
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6">
              <div>
                <div className="text-lg font-bold text-gray-900">Today’s timeline</div>
                <div className="text-sm text-gray-500">
                  Anomalies highlighted across your resting windows
                </div>
              </div>

              <div className="mt-4">
                <PersonalizedHealthChart series={anomalyData.series || []} />
              </div>
            </div>

            {/* Row 3 */}
            <div className="bg-white rounded-3xl border shadow-sm p-5 sm:p-6">
              <div className="text-lg font-bold text-gray-900">What does this mean?</div>
              <p className="text-gray-700 mt-2 leading-relaxed">{whatItMeansText}</p>

              <div className="mt-4 text-xs text-gray-500">
                Note: This is an automated insight based on your personal baseline. It is not a medical diagnosis.
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;
