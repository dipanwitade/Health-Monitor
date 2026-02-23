// src/demo/demoData.js
const now = Date.now();
const hour = 60 * 60 * 1000;

const mkTs = (hAgo) => new Date(now - hAgo * hour).toISOString();

export const demoHistory = {
  heart_rate: [
    { timestamp: mkTs(22), value: 72 },
    { timestamp: mkTs(18), value: 78 },
    { timestamp: mkTs(14), value: 75 },
    { timestamp: mkTs(10), value: 88 }, // mild spike
    { timestamp: mkTs(6), value: 74 },
    { timestamp: mkTs(2), value: 70 },
  ],
  spo2: [
    { timestamp: mkTs(22), value: 98 },
    { timestamp: mkTs(14), value: 97 },
    { timestamp: mkTs(6), value: 96 },
    { timestamp: mkTs(2), value: 98 },
  ],
  blood_pressure: [
    { timestamp: mkTs(20), systolic: 118, diastolic: 78 },
    { timestamp: mkTs(10), systolic: 132, diastolic: 86 }, // a bit high
    { timestamp: mkTs(3), systolic: 122, diastolic: 80 },
  ],
  stress: [
    { timestamp: mkTs(18), value: 2 },
    { timestamp: mkTs(12), value: 3 },
    { timestamp: mkTs(8), value: 4 },
    { timestamp: mkTs(4), value: 2 },
  ],
  steps: [{ timestamp: mkTs(1), value: 6400 }],
  distance: [{ timestamp: mkTs(1), value: 4.3 }],
  calories: [{ timestamp: mkTs(1), value: 520 }],
  sleep: [],
};

export const demoSleepSessions = [
  {
    date: new Date(now - 6 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (6 * 24 * hour + 8 * hour)).toISOString(),
    end_time: new Date(now - (6 * 24 * hour + 1 * hour)).toISOString(),
    duration_hours: 7.0,
  },
  {
    date: new Date(now - 5 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (5 * 24 * hour + 8 * hour)).toISOString(),
    end_time: new Date(now - (5 * 24 * hour + 0.5 * hour)).toISOString(),
    duration_hours: 7.5,
  },
  {
    date: new Date(now - 4 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (4 * 24 * hour + 7.5 * hour)).toISOString(),
    end_time: new Date(now - (4 * 24 * hour + 0.7 * hour)).toISOString(),
    duration_hours: 6.8,
  },
  {
    date: new Date(now - 3 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (3 * 24 * hour + 8.2 * hour)).toISOString(),
    end_time: new Date(now - (3 * 24 * hour + 1.0 * hour)).toISOString(),
    duration_hours: 7.2,
  },
  {
    date: new Date(now - 2 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (2 * 24 * hour + 7.8 * hour)).toISOString(),
    end_time: new Date(now - (2 * 24 * hour + 0.8 * hour)).toISOString(),
    duration_hours: 7.0,
  },
  {
    date: new Date(now - 1 * 24 * hour).toISOString().slice(0, 10),
    start_time: new Date(now - (1 * 24 * hour + 8.1 * hour)).toISOString(),
    end_time: new Date(now - (1 * 24 * hour + 1.2 * hour)).toISOString(),
    duration_hours: 6.9,
  },
  {
    date: new Date(now).toISOString().slice(0, 10),
    start_time: new Date(now - 8 * hour).toISOString(),
    end_time: new Date(now - 1 * hour).toISOString(),
    duration_hours: 7.0,
  },
];


export const demoAnomalySummary = {
  status: "alert",              
  percent_anomalies: 18.4,
  data_confidence: "high",
  top_contributors: ["Heart Rate", "Blood Pressure"],

 
  series: [
    {
      timestamp: mkTs(22),
      is_anomaly: 0,
      heart_rate: 72,
      spo2: 98,
      systolic_bp: 118,
      diastolic_bp: 78,
    },
    {
      timestamp: mkTs(18),
      is_anomaly: 0,
      heart_rate: 78,
      spo2: 97,
      systolic_bp: 120,
      diastolic_bp: 80,
    },
    {
      timestamp: mkTs(14),
      is_anomaly: 1,
      heart_rate: 92,
      spo2: 96,
      systolic_bp: 124,
      diastolic_bp: 82,
    },
    {
      timestamp: mkTs(10),
      is_anomaly: 1,
      heart_rate: 88,
      spo2: 97,
      systolic_bp: 138,
      diastolic_bp: 88,
    },
    {
      timestamp: mkTs(6),
      is_anomaly: 0,
      heart_rate: 74,
      spo2: 98,
      systolic_bp: 122,
      diastolic_bp: 80,
    },
    {
      timestamp: mkTs(2),
      is_anomaly: 0,
      heart_rate: 70,
      spo2: 98,
      systolic_bp: 120,
      diastolic_bp: 78,
    },
  ],
};