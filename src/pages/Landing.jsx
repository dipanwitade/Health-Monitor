// src/pages/Landing.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-blue-50 sm:via-white sm:to-blue-100">
      {/* Top bar */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            SH
          </div>
          <div className="leading-tight">
            <div className="font-bold text-gray-900">Smart Health Monitor</div>
            <div className="text-xs text-gray-500 hidden sm:block">IoT • AI • Insights</div>
          </div>
        </div>

        {/* Mobile: simple Login. Desktop: keep both if you want */}
        <button
          className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left */}
          <div className="pt-4 sm:pt-8">
            {/* Badge: keep it but make it quieter on mobile */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white text-sm text-gray-700">
              <span className="font-semibold text-blue-700">Personalized</span>
              <span className="text-gray-500 hidden sm:inline">health insights powered by your baseline</span>
              <span className="text-gray-500 sm:hidden">insights that stay simple</span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Your health,
              <br />
              clearly explained.
            </h1>

            <p className="mt-3 text-base sm:text-lg text-gray-700 max-w-xl">
              Sync Google Fit data, see calm charts, and notice unusual patterns early.
            </p>

            {/* Primary action */}
            <div className="mt-6">
              <button
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                onClick={() => navigate("/login")}
              >
                Connect Google Fit
              </button>

              {/* Secondary action becomes a subtle link on mobile */}
              <div className="mt-3">
                <button
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800"
                  onClick={() => navigate("/login")}
                >
                  View demo →
                </button>
              </div>
            </div>

            {/* Trust line */}
            <div className="mt-5 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">Privacy-first.</span>{" "}
              Not a medical diagnosis — just smart tracking from your trends.
            </div>

            {/* Mobile “Today summary” strip (lightweight, premium) */}
            <div className="mt-6 sm:hidden">
              <div className="rounded-2xl border bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Today</div>
                    <div className="text-base font-bold text-gray-900">Status</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
                    Normal
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-gray-500">Heart Rate</div>
                    <div className="text-lg font-bold text-gray-900">72 bpm</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-xs text-gray-500">SpO₂</div>
                    <div className="text-lg font-bold text-gray-900">98%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: full preview card (desktop / tablet). On mobile, we already showed a strip */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border p-4 sm:p-6 mt-6 lg:mt-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Today</div>
                <div className="text-xl font-bold text-gray-900">Personalized Summary</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold border border-green-200">
                ✅ Normal
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Heart Rate</div>
                <div className="text-lg font-bold text-gray-900">72 bpm</div>
                <div className="text-xs text-gray-500 mt-1">Resting • stable</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">SpO₂</div>
                <div className="text-lg font-bold text-gray-900">98%</div>
                <div className="text-xs text-gray-500 mt-1">Good saturation</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Blood Pressure</div>
                <div className="text-lg font-bold text-gray-900">120/80</div>
                <div className="text-xs text-gray-500 mt-1">Within range</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="text-xs text-gray-500">Anomaly Rate</div>
                <div className="text-lg font-bold text-gray-900">4.86%</div>
                <div className="text-xs text-gray-500 mt-1">Baseline matched</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-gray-50 p-3">
              <div className="text-sm font-semibold text-gray-800">What you’ll get</div>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>• Clean charts with anomaly markers</li>
                <li>• Personalized baseline per user</li>
                <li>• Sleep + activity insights</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits (mobile-friendly, premium rows instead of big cards) */}
        <section className="mt-10">
          <div className="text-lg font-bold text-gray-900">Why you’ll like it</div>

          <div className="mt-4 space-y-3">
            <div className="bg-white rounded-2xl border p-4 shadow-sm flex gap-3">
              <div className="text-xl">🔄</div>
              <div>
                <div className="font-bold text-gray-900">Fast sync</div>
                <div className="text-sm text-gray-700">
                  Incremental updates using timestamps — quick and reliable.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 shadow-sm flex gap-3">
              <div className="text-xl">🧠</div>
              <div>
                <div className="font-bold text-gray-900">Personal baseline</div>
                <div className="text-sm text-gray-700">
                  AI trained on your own resting windows — not generic averages.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border p-4 shadow-sm flex gap-3">
              <div className="text-xl">📈</div>
              <div>
                <div className="font-bold text-gray-900">Calm visuals</div>
                <div className="text-sm text-gray-700">
                  Charts designed for quick reading, not dashboard clutter.
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-8">
            <button
              className="w-full px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
              onClick={() => navigate("/login")}
            >
              Get Started
            </button>
            <div className="mt-3 text-center text-xs text-gray-500">
              © 2026 Smart Health Monitor
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
