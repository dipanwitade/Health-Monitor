
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaTint, FaLungs, FaBed, FaShoePrints, FaFireAlt } from "react-icons/fa";
import axios from "axios";
import api from "../api/axios";

import PeriodSelector from "../components/PeriodSelector";
import HealthCard from "../components/HealthCard";

import StatCard from "../components/StatCard";
import LineChartPanel from "../components/LineChartPanel";
import { Link } from 'react-router-dom';
import MainLayout from "../layouts/MainLayout";
import HealthChart from "../components/HealthChart";
import GroupedHealthCards from "../components/GroupedHealthCards";
import { iconMap } from "../constants/iconMap";


import SleepChart from "../components/SleepChart";

import AiInsightCard from "../components/AiInsightCard";
import InsightsPanel from "../components/InsightsPanel";
import ActivityChart from "../components/ActivityChart";
import AnomalyCard from "../components/AnomalyCard";

// const formatDuration = (totalHours) => {
//   if (!totalHours || totalHours === "--") return "--";
//   const hours = Math.floor(totalHours);
//   const minutes = Math.round((totalHours - hours) * 60);
//   return `${hours}h ${minutes}m`;
// };


// ✅ Format sleep duration for display (1 decimal place)
const formatDuration = (hours) => {
  if (!hours || hours === "--") return "--";
  return `${parseFloat(hours).toFixed(1)} hrs`;
};



const Dashboard = () => {
  const [period, setPeriod] = useState("Today");
  // Add these states
  const [customStart, setCustomStart] = useState(null);
  const [customEnd, setCustomEnd] = useState(null);

  const selectedDate = (() => {
    const now = new Date();
    const offsetMs = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + offsetMs);

    if (period === "Today") {
      return istNow.toISOString().split("T")[0];
    } else if (period === "Yesterday") {
      istNow.setDate(istNow.getDate() - 1);
      return istNow.toISOString().split("T")[0];
    } else if (period === "Custom" && customStart) {
      return customStart;
    }
    return null;
  })();



  const navigate = useNavigate();
  const email = localStorage.getItem("user_email");

  const [heartRateData, setHeartRateData] = useState("--");
  const [bpData, setBpData] = useState("--");
  const [spo2Data, setSpo2Data] = useState("--");
  const [sleepSessions, setSleepSessions] = useState([]);
  const [userName, setUserName] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);



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
    stress: "--"
  });

  const [aiInsight, setAiInsight] = useState(null);
  const [insights, setInsights] = useState([]);

  // const getSum = (data) => {
  //   if (!data || data.length === 0) return "--";
  //   const sum = data.reduce((acc, val) => acc + (val.value || val.duration_hours || 0), 0);
  //   return Math.round(sum);
  // };

  // ✅ Integer sum – use for steps, calories
  const getSumInt = (data) => {
    if (!data || data.length === 0) return "--";
    const sum = data.reduce((acc, val) => acc + (val.value || 0), 0);
    return Math.round(sum);
  };
  // ✅ Float sum – use for distance, sleep (raw)
  const getSumFloat = (data) => {
    if (!data || data.length === 0) return 0;
    return data.reduce((acc, val) => acc + (val.value || val.duration_hours || 0), 0);
  };




  const getAverage = (data) => {
    if (!data || data.length === 0) return "--";
    console.log("📈 Computing avg from:", data);

    const sum = data.reduce((acc, val) => acc + (val.value || 0), 0);
    return Math.round(sum / data.length);
  };

  const getAverageBP = (data) => {
    if (!data || data.length === 0) return "--";
    console.log("📊 Raw BP:", data);
    const systolic = Math.round(
      data.reduce((acc, val) => acc + (val.systolic || 0), 0) / data.length
    );
    const diastolic = Math.round(
      data.reduce((acc, val) => acc + (val.diastolic || 0), 0) / data.length
    );
    return `${systolic}/${diastolic}`;
  };


  const handleSync = async () => {
    try {
      await axios.post("http://localhost:8000/google/sync", {
        user_email: email,
        days_back: 7   // or 30, or whatever you want
      });
      alert("Synced successfully");
      window.location.reload();
    } catch (err) {
      alert("Sync failed");
      console.error(err);
    }
  };


  // const [error, setError] = useState(null);



  useEffect(() => {
    if (!email) navigate("/login");
  }, []);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const [latestRes, historyRes] = await Promise.all([
  //         api.get("/healthdata/latest"),
  //         api.get("/healthdata/history"),
  //       ]);
  //       setLatest(latestRes.data);
  //       setHistory(historyRes.data);
  //     } catch (err) {
  //       console.error("Error fetching health data:", err);
  //     }
  //   };

  //   fetchData();
  // }, []);


  // useEffect(() => {

  //   const fetchHealthData = async () => {
  //     if (!email) return;
  //     let heartRate = "--";
  //     let spo2 = "--";
  //     let bp = "--";


  //     try {
  //       if (period === "Today") {
  //         const res = await axios.get("http://localhost:8000/google/health-data", {
  //           params: { user_email: email, period: "today" },
  //         });

  //         const data = res.data;
  //         heartRate = data.heart_rate?.at(-1)?.value || "--";
  //         spo2 = data.spo2?.at(-1)?.value || "--";
  //         const bpData = data.blood_pressure?.at(-1);
  //         bp = bpData ? `${bpData.systolic}/${bpData.diastolic}` : "--";

  //       } else {
  //         // History from DB
  //         let startDate, endDate;
  //         const today = new Date();

  //         if (period === "Yesterday") {
  //           const y = new Date(today.setDate(today.getDate() - 1));
  //           startDate = new Date(y.setHours(0, 0, 0, 0)).toISOString().split("T")[0];
  //           endDate = new Date(y.setHours(23, 59, 59, 999)).toISOString().split("T")[0];
  //         } else if (period === "Custom") {
  //           if (!customStart || !customEnd) return;
  //           startDate = customStart;
  //           endDate = customEnd;
  //         }

  //         const res = await axios.get("http://localhost:8000/healthdata/history", {
  //           params: {
  //             user_email: email,
  //             start_date: startDate,
  //             end_date: endDate,
  //           },
  //         });

  //         const data = res.data;
  //         heartRate = data.heart_rate?.at(-1)?.value || "--";
  //         spo2 = data.spo2?.at(-1)?.value || "--";
  //         const bpData = data.blood_pressure?.at(-1);
  //         bp = bpData ? `${bpData.systolic}/${bpData.diastolic}` : "--";
  //       }

  //       // Update cards
  //       setHeartRateData(heartRate);
  //       setSpo2Data(spo2);
  //       setBpData(bp);

  //     } catch (err) {
  //       console.error("Error fetching health data:", err);
  //     }
  //   };

  //   fetchHealthData();
  // }, [period, customStart, customEnd]);

  useEffect(() => {
    const fetchHealthData = async () => {
      if (!email) return;

      // Reset state
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

      // Determine period
      const today = new Date();
      let startDate;
      try {
        const sleepSessionRes = await axios.get("http://localhost:8000/sleep-sessions", {
          params: {
            user_email: email,
            days: 7
          }
        });
        setSleepSessions(sleepSessionRes.data.sleep_sessions); // ⬅ Make sure you’ve defined this state

        if (period === "Today") {


          // const startDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD


          // Convert to IST (UTC+5:30)
          const now = new Date();
          const offsetMs = 5.5 * 60 * 60 * 1000; // 5:30 in milliseconds
          const istNow = new Date(now.getTime() + offsetMs);
          const startDate = istNow.toISOString().split("T")[0];



          const res = await axios.get("http://localhost:8000/healthdata/history", {
            params: {
              user_email: email,
              start_date: startDate,
              end_date: startDate,
            }
          });

          const data = res.data;
          console.log("Fetched history data:", data);
          console.log("[🚦 Dashboard] period:", period, "→ startDate:", startDate);

          console.log("[🩸 BP Raw from DB]", history.blood_pressure);



          // Set chart data
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


          // Compute average

          setAverageMetrics({
            heart_rate: data.heart_rate?.length ? getAverage(data.heart_rate) : "--",
            spo2: data.spo2?.length ? getAverage(data.spo2) : "--",
            blood_pressure: data.blood_pressure?.length ? getAverageBP(data.blood_pressure) : "--",
            stress: data.stress?.length ? getAverage(data.stress) : "--",
            steps: data.steps?.length ? getSumInt(data.steps) : "--",
            calories: data.calories?.length ? getSumInt(data.calories) : "--",
            // distance: data.distance?.length ? getSum(data.distance) : "--",
            distance: data.distance?.length ? getSumFloat(data.distance).toFixed(2) : "--",

            // sleep: data.sleep?.length ? getSum(data.sleep) : "--",
            // sleep: data.sleep?.length ? getSum(sleepSessionRes.data.sleep_sessions) : "--",
            sleep: (() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const filteredSleepSessions = sleepSessionRes.data.sleep_sessions.filter(session => {
                // const sessionDate = new Date(session.start_time);
                // sessionDate.setHours(0, 0, 0, 0);
                // return sessionDate.getTime() === today.getTime();


                // const sessionDateStr = new Date(session.start_time).toISOString().split("T")[0];
                // console.log("🛌 Matching", sessionDateStr, "==", startDate);
                // return sessionDateStr === startDate;

                const sessionStart = new Date(session.start_time);
                const sessionEnd = new Date(session.end_time);
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start.getTime() + 86400000); // next day

                return sessionStart <= end && sessionEnd >= start;


              });
              return filteredSleepSessions.length ? formatDuration(getSumFloat(filteredSleepSessions)) : "--";
            })(),


          });




        } else {
          let startDate;
          if (period === "Yesterday") {

            // const y = new Date();
            // y.setDate(y.getDate() - 1);
            // startDate = y.toISOString().split("T")[0];

            const now = new Date();
            const offsetMs = 5.5 * 60 * 60 * 1000;
            const istNow = new Date(now.getTime() + offsetMs);
            istNow.setDate(istNow.getDate() - 1);
            startDate = istNow.toISOString().split("T")[0];



          } else if (period === "Custom") {
            if (!customStart) return;
            // startDate = new Date(customStart).toISOString().split("T")[0];
            startDate = customStart;
          }


          const res = await axios.get("http://localhost:8000/healthdata/history", {
            params: {
              user_email: email,
              start_date: startDate,
              end_date: startDate, // single date for 1-day data
            },
          });

          const data = res.data;
          // console.log("Fetched history data:", data);
          // console.log("[🚦 Dashboard] period:", period, "→ startDate:", startDate);

          // console.log("[🩸 BP Raw from DB]", history.blood_pressure);

          setHistory({
            heart_rate: data.heart_rate || [],
            spo2: data.spo2 || [],
            blood_pressure: data.blood_pressure || [],
            steps: data.steps || [],
            distance: data.distance || [],
            calories: data.calories || [],
            sleep: data.sleep || [],
            stress: data.stress || [],
          });

          setAverageMetrics({
            heart_rate: data.heart_rate?.length ? getAverage(data.heart_rate) : "--",
            spo2: data.spo2?.length ? getAverage(data.spo2) : "--",
            blood_pressure: data.blood_pressure?.length ? getAverageBP(data.blood_pressure) : "--",
            steps: getSumInt(data.steps),
            distance: getSumFloat(data.distance),
            calories: getSumInt(data.calories),
            stress: getAverage(data.stress),
            // sleep: getSum(sleepSessionRes.data.sleep_sessions),
            sleep: (() => {
              const target = new Date(startDate);
              target.setHours(0, 0, 0, 0);
              const filteredSleepSessions = sleepSessionRes.data.sleep_sessions.filter(session => {
                // const sessionDate = new Date(session.start_time);
                // sessionDate.setHours(0, 0, 0, 0);
                // return sessionDate.getTime() === target.getTime();


                // const sessionDateStr = new Date(session.start_time).toISOString().split("T")[0];
                // console.log("🛌 Matching", sessionDateStr, "==", startDate);

                // return sessionDateStr === startDate;

                const sessionStart = new Date(session.start_time);
                const sessionEnd = new Date(session.end_time);
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start.getTime() + 86400000);

                return sessionStart <= end && sessionEnd >= start;


              });
              return filteredSleepSessions.length ? formatDuration(getSumFloat(filteredSleepSessions)) : "--";
            })(),

          });
        }
        // 🟨 Fetch Sleep Sessions for bar chart (7-day graph)

      } catch (err) {
        console.error("History DB fetch error:", err);
      }

      // Fetch activity logs
      try {
        const actRes = await axios.get("http://localhost:8000/activity-logs", {
          params: {
            user_email: email,
            days: 7
          }
        });
        setActivityLogs(actRes.data || []);
      } catch (err) {
        console.error("Failed to fetch activity logs:", err);
      }

    };

    fetchHealthData();
  }, [period, customStart]);





  // useEffect(() => {
  //   const fetchAnomalyInsight = async () => {
  //     const hr = parseFloat(averageMetrics.heart_rate);
  //     const spo2 = parseFloat(averageMetrics.spo2);

  //     let sys, dia;
  //     if (typeof averageMetrics.blood_pressure === "string" && averageMetrics.blood_pressure.includes("/")) {
  //       const parts = averageMetrics.blood_pressure.split("/");
  //       sys = parseFloat(parts[0]);
  //       dia = parseFloat(parts[1]);
  //     }

  //     // ✅ Skip if any value is missing or "--"
  //     if (
  //       isNaN(hr) || isNaN(spo2) || isNaN(sys) || isNaN(dia)
  //     ) {
  //       console.warn("⚠️ Skipping AI check: missing or invalid metrics");
  //       setAiInsight(null); // 🚫 Reset insight
  //       return;
  //     }

  //     try {
  //       const response = await fetch("http://localhost:8000/ai/anomaly", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           heart_rate: hr,
  //           spo2: spo2,
  //           systolic_bp: sys,
  //           diastolic_bp: dia,
  //         }),
  //       });

  //       const data = await response.json();
  //       setAiInsight(data);
  //     } catch (error) {
  //       console.error("AI Insight error:", error);
  //       setAiInsight(null);
  //     }
  //   };

  //   fetchAnomalyInsight();
  // }, [averageMetrics]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!email) return;

      try {
        const res = await axios.get(`http://localhost:8000/users/profile?email=${email}`);
        const userData = res.data;
        setUserName(userData.name || "User");  // fallback to "User"
      } catch (err) {
        console.error("Failed to fetch user name:", err);
      }
    };

    fetchUserName();
  }, []);


  useEffect(() => {
    const fetchInsights = async () => {
      const email = localStorage.getItem("user_email");
      const res = await axios.get(`http://localhost:8000/ai/insights?user_email=${email}`);
      setInsights(res.data.insights || []);
    };

    fetchInsights();
  }, []);











  return (


    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between bg-white shadow p-4 rounded">
        <h1 className="text-xl font-bold text-green-700">Smart Health Monitor</h1>
        <p className="text-sm text-gray-500">Welcome, {userName}</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-800">Health Dashboard</h2>

      <button onClick={handleSync} className="text-sm px-3 py-1 bg-blue-500 text-white rounded">Sync Now</button>




      <PeriodSelector period={period} setPeriod={setPeriod} />
      {period === "Custom" && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div>
            <label className="block text-sm">Select Date:</label>
            <input
              type="date"
              value={customStart || ""}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border rounded px-2 py-1"

            />
          </div>
        </div>
      )}

      {/* {aiInsight?.result === "no_data" ? (
        <p className="text-sm text-gray-400">Not enough data to generate insight.</p>
      ) : (
        aiInsight && <AiInsightCard result={aiInsight.result} score={aiInsight.score} />
      )} */}

      {/* {aiInsight?.result === "normal" && (
        <AiInsightCard result="normal" score={aiInsight.score} />
      )}
      {aiInsight?.result === "anomaly" && (
        <AiInsightCard result="anomaly" score={aiInsight.score} />
      )}
      {aiInsight?.result === "no_data" && (
        <AiInsightCard result="no_data" />
      )} */}

      <AnomalyCard email={email} selectedDate={selectedDate} />

      <InsightsPanel insights={insights} />






      {/* Health Cards */}

      <GroupedHealthCards averageMetrics={averageMetrics} period={period} />






      {/* Charts */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LineChartPanel title="Heart Rate Trend" data={history.heart_rate} unit="bpm" />
        <LineChartPanel title="SpO₂ Trend" data={history.spo2} unit="%" />
        {/* <LineChartPanel title="Blood Pressure Trend" data={history.blood_pressure} unit="mmHg" /> */}
        {/* <LineChartPanel
          title="Blood Pressure Trend"
          data={history.blood_pressure.map((d) => {
            const date = new Date(d.timestamp);
            const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            return {
              systolic: d.systolic,
              diastolic: d.diastolic,
              time: time,
            };
          })}
          color="red"
        /> */}

        <LineChartPanel
          title="Blood Pressure Trend"
          data={history.blood_pressure.map((d) => ({
            systolic: d.systolic,
            diastolic: d.diastolic,
            timestamp: d.timestamp,  // ⬅️ keep raw ISO timestamp
          }))}
          color="red"
        />




        {/* <LineChartPanel title="Sleep Trend" data={history.sleep} unit="hrs" /> */}
        <LineChartPanel title="Stress Trend" data={history.stress} unit="level" />
      </div>

      <SleepChart sleepSessions={sleepSessions} />
      <ActivityChart data={activityLogs} />


      <div className="min-h-[40px] text-center">
        <p className="text-sm text-gray-500 mt-2">Last updated at: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default Dashboard;

/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <HealthCard
          title="Heart Rate"
          value={heartRateData}
          unit="bpm"
          icon={<FaHeartbeat />}
          color="bg-red-500"
        />
        <HealthCard
          title="Blood Pressure"
          value={bpData}
          unit="mmHg"
          icon={<FaTint />}
          color="bg-blue-500"
        />
        <HealthCard
          title="SpO₂"
          value={spo2Data}
          unit="%"
          icon={<FaLungs />}
          color="bg-green-500"
        />

      </div>
      <div className="min-h-[40px]">
        <p className="text-sm text-gray-500 mt-2 text-center">
          Last updated at: {new Date().toLocaleTimeString()}
        </p>
      </div>


    </div >

  );
};




export default Dashboard; */
