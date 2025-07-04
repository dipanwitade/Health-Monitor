export function generateChartData(label) {
  const now = new Date();
  const data = [];

  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      value: parseFloat((Math.random() * (label === "HR" ? 40 : 10) + (label === "HR" ? 60 : 90)).toFixed(1)),
    });
  }

  return data;
}
