// src/constants/iconMap.js
import { FaHeartbeat, FaTint, FaLungs, FaBed, FaShoePrints, FaFireAlt } from "react-icons/fa";

export const iconMap = {
  heart_rate: { icon: <FaHeartbeat />, unit: "bpm", color: "bg-red-500", title: "Heart Rate", group: "Vitals" },
  blood_pressure: { icon: <FaTint />, unit: "mmHg", color: "bg-blue-500", title: "Blood Pressure", group: "Vitals" },
  spo2: { icon: <FaLungs />, unit: "%", color: "bg-green-500", title: "SpO₂", group: "Vitals" },
  steps: { icon: <FaShoePrints />, unit: "steps", color: "bg-orange-500", title: "Steps", group: "Activity" },
  distance: { icon: <FaShoePrints />, unit: "km", color: "bg-purple-600", title: "Distance", group: "Activity" },
  calories: { icon: <FaFireAlt />, unit: "kcal", color: "bg-pink-600", title: "Calories", group: "Activity" },
  sleep: { icon: <FaBed />, unit: "hrs", color: "bg-indigo-500", title: "Sleep", group: "Lifestyle" },
  stress: { icon: <FaLungs />, unit: "", color: "bg-yellow-700", title: "Stress", group: "Lifestyle" },
};
