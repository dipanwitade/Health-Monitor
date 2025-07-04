import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import React from "react";

const periods = ["Today", "Yesterday", "Custom"];

const PeriodSelector = ({ period, setPeriod }) => {
  const currentIndex = periods.indexOf(period);

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + periods.length) % periods.length;
    setPeriod(periods[prevIndex]);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % periods.length;
    setPeriod(periods[nextIndex]);
  };

  return (
    <div className="flex items-center justify-center space-x-4 my-4">
      <button onClick={handlePrev} className="text-2xl">←</button>
      <span className="text-lg font-semibold w-32 text-center">{period}</span>
      <button onClick={handleNext} className="text-2xl">→</button>
    </div>
  );
};

export default PeriodSelector;
