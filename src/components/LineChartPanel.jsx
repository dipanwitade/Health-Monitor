import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

import { formatToIST } from "../utils/time";

const LineChartPanel = ({ data, title, color }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-md w-full text-center">
        <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }





  const formattedData = data.map((d) => {
    const time = formatToIST(d.timestamp || d.time);  // use timestamp if available
    return { ...d, time };
  });


// const formattedData = data.map((d) => {
//   let time = "Invalid";

//   // Case: d.time is just "01:00 AM", "02:00 AM", etc.
//   if (typeof d.time === "string" && (d.time.includes("AM") || d.time.includes("PM")))
//  {
//     const today = new Date().toISOString().split("T")[0]; // e.g. "2025-07-03"
//     const combined = `${today} ${d.time}`; // "2025-07-03 01:00 AM"
//     const date = new Date(combined);
//     if (!isNaN(date)) {
//       time = date.toLocaleTimeString("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//         timeZone: "Asia/Kolkata"
//       });
//     }
//   }

//   return { ...d, time };
// });

    

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md w-full">
      <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          labelFormatter={(label) => {
    console.log("[🕒 Tooltip Label]", label);
    return label;
  }}
          {/* Dynamically render lines based on data keys */}
          {formattedData[0]?.systolic !== undefined && (
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#f87171"
              strokeWidth={2}
              name="Systolic"
              />
            )}
          {formattedData[0]?.diastolic !== undefined && (
            <Line
            type="monotone"
            dataKey="diastolic"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Diastolic"
            />
          )}
          {formattedData[0]?.value !== undefined && (
            <Line
            type="monotone"
            dataKey="value"
            stroke={color || "#10b981"}
            strokeWidth={2}
            />
          )}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartPanel;

{/* Handle both systolic and diastolic if available */ }
// {data[0]?.systolic !== undefined && (
  //   <Line type="monotone" dataKey="systolic" stroke="#f87171" strokeWidth={2} name="Systolic" />
  // )}
  // {data[0]?.diastolic !== undefined && (
    //   <Line type="monotone" dataKey="diastolic" stroke="#60a5fa" strokeWidth={2} name="Diastolic" />
    // )}
    
    // {/* Fallback for general value */}
    // {data[0]?.value !== undefined && (
      //   <Line type="monotone" dataKey="value" stroke={color || "#10b981"} strokeWidth={2} />
      // )}
      
      
      
      // {isBP && (
        //   <>
        //     <Line type="monotone" dataKey="systolic" stroke="#f87171" strokeWidth={2} name="Systolic" />
        //     <Line type="monotone" dataKey="diastolic" stroke="#60a5fa" strokeWidth={2} name="Diastolic" />
        //   </>
        // )}
        // {!isBP && (
          //   <Line type="monotone" dataKey="value" stroke={color || "#10b981"} strokeWidth={2} />
          // )}


          // let time = "Invalid";
          
          // if (d.timestamp && !isNaN(new Date(d.timestamp))) {
          //   time = formatToIST(d.timestamp);
          // } else if (typeof d.time === "string") {
          //   time = d.time; // already preformatted like "01:00 AM"
          // }
          
          // return { ...d, time };
          // });
          // if (formattedData.length === 0) {
          //   return (
          //     <div className="bg-white rounded-2xl p-4 shadow-md w-full text-center">
          //       <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
          //       <p className="text-sm text-gray-400">No valid data to display</p>
          //     </div>
          //   );
          // }