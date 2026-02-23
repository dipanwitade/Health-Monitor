// src/pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import PeriodSelector from "../components/PeriodSelector";
import LineChartPanel from "../components/LineChartPanel";
import GroupedHealthCards from "../components/GroupedHealthCards";
import SleepChart from "../components/SleepChart";
import DemoTourModal from "../components/DemoTourModal";
import { isDemoMode, exitDemoMode } from "../demo/demoMode";
import { demoHistory, demoSleepSessions } from "../demo/demoData";


const getPeriodLabel = (period, customStart) => {
  if (period === "Today") return "Today";
  if (period === "Yesterday") return "Yesterday";
  if (period === "Custom" && customStart) {
    const d = new Date(customStart + "T00:00:00");
    return `On ${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
  }
  return "Selected day";
};

const formatDuration = (hours) => {
  if (!hours || hours === "--") return "--";
  return `${parseFloat(hours).toFixed(1)} hrs`;
};

const getSumInt = (data) => {
  if (!data || data.length === 0) return "--";
  const sum = data.reduce((acc, val) => acc + (val.value || 0), 0);
  return Math.round(sum);
};

const getSumFloat = (data) => {
  if (!data || data.length === 0) return 0;
  return data.reduce(
    (acc, val) => acc + (val.value || val.duration_hours || 0),
    0
  );
};

const toNums = (arr) =>
  (arr || [])
    .map((x) => Number(x?.value))
    .filter((v) => Number.isFinite(v));

const getMin = (data) => {
  const nums = toNums(data);
  if (!nums.length) return "--";
  return Math.min(...nums);
};

const getMax = (data) => {
  const nums = toNums(data);
  if (!nums.length) return "--";
  return Math.max(...nums);
};

const getMedian = (data) => {
  const nums = toNums(data).sort((a, b) => a - b);
  if (!nums.length) return "--";
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2 === 0) return Math.round((nums[mid - 1] + nums[mid]) / 2);
  return Math.round(nums[mid]);
};

const getAvgRounded = (data) => {
  const nums = toNums(data);
  if (!nums.length) return "--";
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round(sum / nums.length);
};

const getLatestBP = (bpArr) => {
  const arr = (bpArr || [])
    .filter((d) => d?.systolic != null && d?.diastolic != null && d?.timestamp)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (!arr.length) return "--";
  const last = arr[arr.length - 1];
  return `${Math.round(Number(last.systolic))}/${Math.round(
    Number(last.diastolic)
  )}`;
};

const getAvgBP = (bpArr) => {
  const arr = (bpArr || []).filter(
    (d) => d?.systolic != null && d?.diastolic != null
  );
  if (!arr.length) return "--";
  const s = arr.reduce((a, d) => a + Number(d.systolic), 0) / arr.length;
  const di = arr.reduce((a, d) => a + Number(d.diastolic), 0) / arr.length;
  return `${Math.round(s)}/${Math.round(di)}`;
};

const Dashboard = () => {

  const demo = isDemoMode();
  const [tourOpen, setTourOpen] = useState(false);
  const [period, setPeriod] = useState("Today");
  const [customStart, setCustomStart] = useState(null);

  const navigate = useNavigate();
  const email = localStorage.getItem("user_email");

  const [sleepSessions, setSleepSessions] = useState([]);
  const [userName, setUserName] = useState("");


  const [syncState, setSyncState] = useState("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState(
    localStorage.getItem("last_synced_at")
  );




  const [history, setHistory] = useState({
    heart_rate: [],
    blood_pressure: [],
    spo2: [],
    steps: [],
    distance: [],
    calories: [],
    sleep: [],
    stress: [],
  });

  const [averageMetrics, setAverageMetrics] = useState({
    heart_rate: "--",
    spo2: "--",
    blood_pressure: "--",
    steps: "--",
    distance: "--",
    calories: "--",
    sleep: "--",
    stress: "--",
  });




  // ---------- sync ----------
  const handleSync = async () => {
    if (demo) return;
    if (syncState !== "idle") return;

    try {
      setSyncState("syncing");

      // await axios.post("http://localhost:8000/google/sync", {
      await axios.post("https://health-monitor-djcv.onrender.com/google/sync", {
        user_email: email,
        days_back: 7,
      });

      setSyncState("success");


      const nowIso = new Date().toISOString();
      localStorage.setItem("last_synced_at", nowIso);
      setLastSyncedAt(nowIso);

      setTimeout(() => setSyncState("idle"), 5000);
    } catch (err) {
      console.error(err);
      setSyncState("error");
      setTimeout(() => setSyncState("idle"), 5000);
    }
  };

  // ---------- auth redirect ----------

  useEffect(() => {
    if (!demo && !email) navigate("/login");
  }, [demo, email, navigate]);


  useEffect(() => {
    if (period !== "Custom") setCustomStart(null);
  }, [period]);

  // ---------- trends tab (mobile) ----------
  const [trendTab, setTrendTab] = useState("Heart Rate");
  useEffect(() => {
    setTrendTab("Heart Rate");
  }, [period, customStart]);

  // ---------- fetch data ----------
  useEffect(() => {
    const periodLabel = getPeriodLabel(period, customStart);
    const fetchHealthData = async () => {
      
      if (demo) {
        setSleepSessions(demoSleepSessions);

        setHistory({
          heart_rate: demoHistory.heart_rate,
          spo2: demoHistory.spo2,
          blood_pressure: demoHistory.blood_pressure,
          steps: demoHistory.steps,
          distance: demoHistory.distance,
          calories: demoHistory.calories,
          sleep: demoHistory.sleep,
          stress: demoHistory.stress,
        });

        setAverageMetrics({
          heart_rate: { primary: 76, unit: "bpm", subtitle: "Low 70 • High 88" },
          spo2: { primary: 96, unit: "%", subtitle: "Avg 97%" },
          blood_pressure: { primary: "122/80", unit: "mmHg", subtitle: `${periodLabel} avg 124/82` },
          steps: { primary: 6400, unit: "", subtitle: `${periodLabel} total` },
          distance: { primary: "4.30", unit: "km", subtitle: `${periodLabel} total` },
          calories: { primary: 520, unit: "kcal", subtitle: `${periodLabel} total` },
          sleep: { primary: "7.0 hrs", unit: "", subtitle: "Last night" },
          stress: { primary: 3, unit: "level", subtitle: "Peak 4" },
        });

        setUserName("Demo User");
        return;
      }
      if (!email) return;

      setHistory({
        heart_rate: [],
        spo2: [],
        blood_pressure: [],
        steps: [],
        distance: [],
        calories: [],
        sleep: [],
        stress: [],
      });

      setAverageMetrics({
        heart_rate: "--",
        spo2: "--",
        blood_pressure: "--",
        steps: "--",
        distance: "--",
        calories: "--",
        sleep: "--",
        stress: "--",
      });

      let startDate;

      try {
        // const sleepSessionRes = await axios.get("http://localhost:8000/sleep-sessions", {
        const sleepSessionRes = await axios.get("https://health-monitor-djcv.onrender.com/sleep-sessions", {
          params: { user_email: email, days: 60 },
        });
        setSleepSessions(sleepSessionRes.data.sleep_sessions);

        if (period === "Today") {
          const now = new Date();
          const offsetMs = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(now.getTime() + offsetMs);
          startDate = istNow.toISOString().split("T")[0];
        } else if (period === "Yesterday") {
          const now = new Date();
          const offsetMs = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(now.getTime() + offsetMs);
          istNow.setDate(istNow.getDate() - 1);
          startDate = istNow.toISOString().split("T")[0];
        } else if (period === "Custom") {
          if (!customStart) return;
          startDate = customStart;
        }

        // const res = await axios.get("http://localhost:8000/healthdata/history", {
        const res = await axios.get("https://health-monitor-djcv.onrender.com/healthdata/history", {
          params: { user_email: email, start_date: startDate, end_date: startDate },
        });

        const data = res.data;

        setHistory({
          heart_rate: data.heart_rate || [],
          spo2: data.spo2 || [],
          blood_pressure: data.blood_pressure || [],
          sleep: data.sleep || [],
          stress: data.stress || [],
          steps: data.steps || [],
          distance: data.distance || [],
          calories: data.calories || [],
        });

        setAverageMetrics({
          heart_rate: data.heart_rate?.length
            ? {
              primary: getMedian(data.heart_rate),
              unit: "bpm",
              subtitle: `Low ${getMin(data.heart_rate)} • High ${getMax(
                data.heart_rate
              )}`,
            }
            : { primary: "--", unit: "bpm", subtitle: "" },

          spo2: data.spo2?.length
            ? {
              primary: getMin(data.spo2),
              unit: "%",
              subtitle: `Avg ${getAvgRounded(data.spo2)}%`,
            }
            : { primary: "--", unit: "%", subtitle: "" },

          blood_pressure: data.blood_pressure?.length
            ? {
              primary: getLatestBP(data.blood_pressure),
              unit: "mmHg",
              subtitle: `${periodLabel} avg ${getAvgBP(data.blood_pressure)}`,
            }
            : { primary: "--", unit: "mmHg", subtitle: "" },

          stress: data.stress?.length
            ? {
              primary: getMedian(data.stress),
              unit: "level",
              subtitle: `Peak ${getMax(data.stress)}`,
            }
            : { primary: "--", unit: "level", subtitle: "" },

          steps: data.steps?.length
            ? { primary: getSumInt(data.steps), unit: "", subtitle: `${periodLabel} total` }
            : { primary: "--", unit: "", subtitle: "" },

          calories: data.calories?.length
            ? {
              primary: getSumInt(data.calories),
              unit: "kcal",
              subtitle: `${periodLabel} total`,
            }
            : { primary: "--", unit: "kcal", subtitle: "" },

          distance: data.distance?.length
            ? {
              primary: `${getSumFloat(data.distance).toFixed(2)}`,
              unit: "km",
              subtitle: `${periodLabel} total`,
            }
            : { primary: "--", unit: "km", subtitle: "" },

          sleep: (() => {
            const targetIST = new Date(startDate + "T00:00:00+05:30");
            const nextIST = new Date(targetIST.getTime() + 24 * 60 * 60 * 1000);

            const filteredSleepSessions = sleepSessionRes.data.sleep_sessions.filter(
              (session) => {
                const sessionStart = new Date(session.start_time);
                const sessionEnd = new Date(session.end_time);
                return sessionStart < nextIST && sessionEnd > targetIST;
              }
            );

            return filteredSleepSessions.length
              ? {
                primary: formatDuration(getSumFloat(filteredSleepSessions)),
                unit: "",
                subtitle: period === "Today" ? "Last night" : periodLabel,
              }
              : { primary: "--", unit: "", subtitle: "" };
          })(),
        });
      } catch (err) {
        console.error("History DB fetch error:", err);
      }


    };

    fetchHealthData();

  }, [demo, email, period, customStart]);

  // ---------- user name ----------
  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) return;
      try {
        // const res = await axios.get(
        //   `http://localhost:8000/users/profile?email=${email}`
        // );
        const res = await axios.get(`https://health-monitor-djcv.onrender.com/users/profile?email=${email}`);
        setUserName(res.data?.name || "User");
      } catch (err) {
        console.error("Failed to fetch user name:", err);
      }
    };
    fetchUserName();
  }, [email]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-gray-900 truncate">
                Hi, {userName || "User"}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">

              <div className="flex flex-col items-end leading-tight">
                <span
                  className={[
                    "px-3 py-1 rounded-full border text-xs font-semibold",
                    syncState === "syncing"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : syncState === "success"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : syncState === "error"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-gray-50 text-gray-700 border-gray-200",
                  ].join(" ")}
                >
                  {syncState === "syncing"
                    ? "Syncing"
                    : syncState === "success"
                      ? "Synced"
                      : syncState === "error"
                        ? "Failed"
                        : "Ready"}
                </span>

                {lastSyncedAt && syncState !== "syncing" && (
                  <span className="mt-0.5 text-[11px] text-gray-400">
                    Last synced{" "}
                    {new Date(lastSyncedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>


              <button
                onClick={handleSync}
                // disabled={syncState !== "idle"}
                disabled={demo || syncState !== "idle"}
                className={[
                  "px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                  syncState === "syncing"
                    ? "bg-blue-500 text-white cursor-not-allowed"
                    : syncState === "success"
                      ? "bg-green-600 text-white"
                      : syncState === "error"
                        ? "bg-red-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white",
                ].join(" ")}
              >
                {syncState === "syncing" && (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}

                {syncState === "idle" && "Sync Now"}
                {syncState === "syncing" && "Syncing…"}
                {syncState === "success" && "Synced successfully"}
                {syncState === "error" && "Sync failed"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {demo && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-2xl border bg-yellow-50 p-3 flex items-center justify-between gap-3">
            <div className="text-sm text-yellow-900">
              <span className="font-extrabold">DEMO MODE</span> — showing sample data.
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

      {/* Page content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-10 space-y-5">
        {/* Quick Summary */}
        <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{period}</div>
              <div className="text-base sm:text-lg font-bold text-gray-900">
                Quick Summary
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Updated{" "}
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-500">Heart Rate</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-xl font-extrabold text-gray-900">
                  {averageMetrics.heart_rate?.primary ?? "--"}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {averageMetrics.heart_rate?.unit ?? "bpm"}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                {averageMetrics.heart_rate?.subtitle ?? ""}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-500">SpO₂</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-xl font-extrabold text-gray-900">
                  {averageMetrics.spo2?.primary ?? "--"}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {averageMetrics.spo2?.unit ?? "%"}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                {averageMetrics.spo2?.subtitle ?? ""}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-500">Blood Pressure</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-xl font-extrabold text-gray-900">
                  {averageMetrics.blood_pressure?.primary ?? "--"}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {averageMetrics.blood_pressure?.unit ?? "mmHg"}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                {averageMetrics.blood_pressure?.subtitle ?? ""}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-xs text-gray-500">Steps</div>
              <div className="mt-1 flex items-end gap-2">
                <div className="text-xl font-extrabold text-gray-900">
                  {averageMetrics.steps?.primary ?? "--"}
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                {averageMetrics.steps?.subtitle ?? ""}
              </div>
            </div>
          </div>
        </div>

        {/* Time range */}
        <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-6">
          <div className="text-base font-bold text-gray-900">Time range</div>

          <div className="mt-4">
            <PeriodSelector period={period} setPeriod={setPeriod} />
          </div>

          {period === "Custom" && (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-900">
                Select Date
              </label>
              <input
                type="date"
                value={customStart || ""}
                onChange={(e) => setCustomStart(e.target.value)}
                className="mt-2 w-full sm:w-auto border rounded-xl px-3 py-2 bg-white"
              />
            </div>
          )}
        </div>

        {/* Overview */}
        <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-gray-900">Overview</div>
              <div className="text-xs text-gray-500">
                Tap a group to expand and see more
              </div>
            </div>
          </div>

          <div className="mt-4">
            <GroupedHealthCards averageMetrics={averageMetrics} period={period} />
          </div>
        </div>

        {/* Trends */}
        <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-6">
          <div className="text-base font-bold text-gray-900">Trends</div>

          {/* Mobile tabs */}
          <div className="mt-4 sm:hidden">
            <div className="bg-gray-50 border rounded-2xl p-2">
              <div className="grid grid-cols-2 gap-2">
                {["Heart Rate", "SpO₂", "Blood Pressure", "Stress"].map((t) => {
                  const active = trendTab === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrendTab(t)}
                      className={[
                        "h-11 rounded-2xl text-sm font-semibold transition",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                        active
                          ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                          : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-white/60",
                      ].join(" ")}
                      aria-pressed={active}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              {trendTab === "Heart Rate" && (
                <LineChartPanel
                  title="Heart Rate Trend"
                  data={history.heart_rate}
                  unit="bpm"
                />
              )}

              {trendTab === "SpO₂" && (
                <LineChartPanel title="SpO₂ Trend" data={history.spo2} unit="%" />
              )}

              {trendTab === "Blood Pressure" && (
                <LineChartPanel
                  title="Blood Pressure Trend"
                  data={history.blood_pressure.map((d) => ({
                    systolic: d.systolic,
                    diastolic: d.diastolic,
                    timestamp: d.timestamp,
                  }))}
                  color="red"
                />
              )}

              {trendTab === "Stress" && (
                <LineChartPanel
                  title="Stress Trend"
                  data={history.stress}
                  unit="level"
                />
              )}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden sm:grid mt-4 grid-cols-1 md:grid-cols-2 gap-5">
            <LineChartPanel title="Heart Rate Trend" data={history.heart_rate} unit="bpm" />
            <LineChartPanel title="SpO₂ Trend" data={history.spo2} unit="%" />

            <LineChartPanel
              title="Blood Pressure Trend"
              data={history.blood_pressure.map((d) => ({
                systolic: d.systolic,
                diastolic: d.diastolic,
                timestamp: d.timestamp,
              }))}
              color="red"
            />

            <LineChartPanel title="Stress Trend" data={history.stress} unit="level" />
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white rounded-3xl border shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-gray-900">Sleep</div>
              <div className="text-xs text-gray-500">
                Sessions across recent days
              </div>
            </div>
          </div>

          <div className="mt-4">
            {/* <SleepChart sleepSessions={sleepSessions} /> */}
            <SleepChart sleepSessions={sleepSessions} isDemo={demo} />
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 pb-4">
          Insights are based on your personal baseline and are not a medical diagnosis.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
