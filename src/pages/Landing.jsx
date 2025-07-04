import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 text-center">
        Smart IoT-Based Healthcare Monitoring
      </h1>
      <p className="text-lg text-gray-700 max-w-xl text-center mb-8">
        Monitor your health in real-time with wearable device integration, AI-driven insights,
        and secure blockchain-based data storage.
      </p>

      <div className="space-x-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>

      <footer className="absolute bottom-4 text-gray-500 text-sm">
        © 2025 SmartHealth Inc.
      </footer>
    </div>
  );
};

export default Landing;
