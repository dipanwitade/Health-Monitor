// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginButton from "../components/LoginButton";

function Login() {
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-blue-50 sm:via-white sm:to-blue-100 relative">
      
      {connecting ? (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border bg-white shadow-sm p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              SH
            </div>

            <div className="mt-4 text-xl font-extrabold text-gray-900">
              Connecting…
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Securely redirecting to Google to connect your Fit data.
            </div>

            <div className="mt-5 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" className="animate-spin">
                <path
                  d="M12 2a10 10 0 1 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <button
              className="mt-6 w-full rounded-2xl border bg-white hover:bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900"
              onClick={() => setConnecting(false)}
              type="button"
            >
              Cancel
            </button>

            <div className="mt-3 text-xs text-gray-500">
              If nothing happens, your browser may be blocking popups or redirects.
            </div>
          </div>
        </div>
      ) : null}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800"
            disabled={connecting}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              SH
            </div>
            <div className="leading-tight">
              <div className="font-bold text-gray-900">Smart Health Monitor</div>
              <div className="text-xs text-gray-500 hidden sm:block">
                Private • Calm • Personalized
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left info (Desktop) */}
          <div className="hidden lg:block bg-white rounded-2xl border shadow-sm p-6">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Connect to continue
            </h1>
            <p className="mt-2 text-gray-700">
              Sign in to sync wearable data and view your personalized health insights.
            </p>

            <div className="mt-5 rounded-xl border bg-gray-50 p-4">
              <div className="font-semibold text-gray-900">You’ll see:</div>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>• Daily anomaly summary + donut chart</li>
                <li>• Timeline markers for unusual windows</li>
                <li>• Trends for Heart Rate, SpO₂ and BP</li>
              </ul>
            </div>

            <div className="mt-4 text-xs text-gray-500 leading-relaxed">
              Note: This system provides insights based on personal baselines and is not a medical diagnosis.
            </div>
          </div>

          {/* Right login card */}
          <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6 flex flex-col justify-center">
            {/* Mobile headline */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                Connect to continue
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Sync Google Fit data and get calm, personalized insights.
              </p>
            </div>

            {/* Desktop headline */}
            <div className="hidden lg:block text-center">
              <h2 className="text-2xl font-bold text-gray-900">Login</h2>
              <p className="text-sm text-gray-600 mt-1">
                Continue with your connected account
              </p>
            </div>

            {/* Trust chips */}
            <div className="mt-4 lg:mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-xs font-semibold text-gray-700">
                Privacy-first
              </span>
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-xs font-semibold text-gray-700">
                No ads
              </span>
              <span className="px-3 py-1 rounded-full border bg-gray-50 text-xs font-semibold text-gray-700">
                Not a diagnosis
              </span>
            </div>

            {/* Login button */}
            <div className="mt-6 flex justify-center">
              <LoginButton onStart={() => setConnecting(true)} />
            </div>

            {/* Mobile expandable details */}
            <div className="mt-5 lg:hidden">
              <button
                type="button"
                onClick={() => setShowDetails((v) => !v)}
                className="w-full rounded-2xl border bg-white hover:bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 flex items-center justify-between"
                disabled={connecting}
              >
                <span>{showDetails ? "Hide details" : "What you’ll see"}</span>
                <span className="text-gray-500">{showDetails ? "—" : "+"}</span>
              </button>

              {showDetails ? (
                <div className="mt-3 rounded-2xl border bg-gray-50 p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Daily anomaly summary + donut chart</li>
                    <li>• Timeline markers for unusual windows</li>
                    <li>• Trends for Heart Rate, SpO₂ and BP</li>
                  </ul>
                  <div className="mt-3 text-xs text-gray-500 leading-relaxed">
                    Insights are based on your personal baseline and are not a medical diagnosis.
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to use this app responsibly for self-monitoring.
            </div>
          </div>
        </div>

        <footer className="mt-8 sm:mt-10 py-4 text-center text-xs sm:text-sm text-gray-500">
          © 2026 Smart Health Monitor
        </footer>
      </div>
    </div>
  );
}

export default Login;
