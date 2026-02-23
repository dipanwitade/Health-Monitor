// src/pages/Landing.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enterDemoMode, isDemoMode } from "../demo/demoMode";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    const demo = isDemoMode();
    if (demo || email) navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Top bar */}
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              SH
            </div>
            <div className="leading-tight">
              <div className="text-base sm:text-lg font-extrabold text-gray-900">
                Smart Health Monitor
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500">
                AI-powered health insights
              </div>
            </div>
          </div>

          <button
            className="h-10 px-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-white/70 border border-transparent hover:border-gray-200 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left */}
            <div className="pt-2 sm:pt-6">


              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                See what your health <br className="hidden sm:block" />
                <span className="text-blue-700">is really telling you.</span>
              </h1>

              <p className="mt-3 text-base sm:text-lg text-gray-700 max-w-xl">
                Turn your Google Fit data into clear trends and AI insights — personalized to your baseline.
              </p>

              {/* Buttons (mobile-first full width) */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition"
                >
                  Connect Google Fit
                </button>

                <button
                  onClick={() => {
                    enterDemoMode();
                    navigate("/dashboard", { replace: true });
                  }}
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl border bg-white hover:bg-gray-50 text-gray-900 font-semibold shadow-sm transition"
                >
                  Try Demo
                </button>
              </div>

              <div className="mt-5 text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">Private and secure.</span>{" "}
                Insights are for personal awareness only — not medical advice.
              </div>

              {/* Mobile-friendly feature rows */}
              <div className="mt-8 sm:mt-10 space-y-3">
                <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-4 flex gap-3">
                  <div className="text-xl">📊</div>
                  <div>
                    <div className="font-bold text-gray-900">Clean charts</div>
                    <div className="text-sm text-gray-700">
                      HR, SpO₂, BP, sleep and more — mobile-friendly visuals.
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-4 flex gap-3">
                  <div className="text-xl">🧠</div>
                  <div>
                    <div className="font-bold text-gray-900">Personalized AI</div>
                    <div className="text-sm text-gray-700">
                      Anomaly detection trained on your own resting baseline.
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur rounded-2xl border shadow-sm p-4 flex gap-3">
                  <div className="text-xl">⚡</div>
                  <div>
                    <div className="font-bold text-gray-900">Fast sync</div>
                    <div className="text-sm text-gray-700">
                      Incremental sync logic for quick, reliable updates.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right (preview) */}
            <div className="bg-white/90 backdrop-blur rounded-3xl border shadow-sm p-5 sm:p-6 mt-2 lg:mt-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Preview</div>
                  <div className="text-lg font-extrabold text-gray-900">
                    Personalized Summary
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full border bg-green-50 text-green-700 text-xs font-semibold">
                  Normal
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-xs text-gray-500">Heart Rate</div>
                  <div className="mt-1 text-xl font-extrabold text-gray-900">72 bpm</div>
                  <div className="mt-1 text-xs text-gray-500">Median • today</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-xs text-gray-500">SpO₂</div>
                  <div className="mt-1 text-xl font-extrabold text-gray-900">98%</div>
                  <div className="mt-1 text-xs text-gray-500">Min • today</div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border bg-gray-50 p-4">
                <div className="text-sm font-semibold text-gray-900">You’ll get</div>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li>• Trends for HR, SpO₂, BP, Sleep</li>
                  <li>• Baseline anomaly timeline</li>
                  <li>• Simple, calm dashboard UI</li>
                </ul>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Tip: Try demo first, then connect Google Fit when ready.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] sm:text-xs text-gray-500 py-6 px-4">
        © 2026 Smart Health Monitor
      </footer>
    </div>
  );
};

export default Landing;