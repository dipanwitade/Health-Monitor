// // src/constants/iconMap.js



import { FaHeartbeat, FaLungs, FaWalking, FaFireAlt } from "react-icons/fa";
import { MdBloodtype, MdHotel } from "react-icons/md";
import { GiBrain } from "react-icons/gi";

export const iconMap = {
  heart_rate: {
    title: "Heart Rate",
    icon: FaHeartbeat,      // ✅ COMPONENT, not JSX
    unit: "bpm",
    color: "#ef4444",
  },
  spo2: {
    title: "SpO₂",
    icon: FaLungs,
    unit: "%",
    color: "#3b82f6",
  },
  blood_pressure: {
    title: "Blood Pressure",
    icon: MdBloodtype,
    unit: "mmHg",
    color: "#f97316",
  },
  steps: {
    title: "Steps",
    icon: FaWalking,
    unit: "",
    color: "#22c55e",
  },
  calories: {
    title: "Calories",
    icon: FaFireAlt,
    unit: "kcal",
    color: "#f59e0b",
  },
  sleep: {
    title: "Sleep",
    icon: MdHotel,
    unit: "hrs",
    color: "#6366f1",
  },
  stress: {
    title: "Stress",
    icon: GiBrain,
    unit: "level",
    color: "#8b5cf6",
  },

  distance: {
    title: "Distance",
    unit: "km",
    icon: "distance", // or the actual icon component you use
    color: "text-blue-600", // match your style
  },
};
