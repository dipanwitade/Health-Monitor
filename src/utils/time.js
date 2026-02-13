// export const formatToIST = (timestamp) => {
//   const date = new Date(timestamp);
//   const istOffset = 5.5 * 60; // IST offset in minutes
//   const localTime = new Date(date.getTime() + istOffset * 60 * 1000);

//   return localTime.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true
//   });
// };


export const formatToIST = (epochMs) => {
  return new Date(epochMs).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


