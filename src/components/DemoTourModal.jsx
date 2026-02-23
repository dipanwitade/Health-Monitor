// src/components/DemoTourModal.jsx
import React, { useMemo, useState } from "react";

export default function DemoTourModal({ open, onClose }) {
  const steps = useMemo(
    () => [
      {
        title: "Quick Summary",
        body: "These cards show daily highlights (median HR, min SpO₂, latest BP, total steps). In real mode, they come from your Google Fit sync.",
      },
      {
        title: "Time Range",
        body: "Use Today / Yesterday / Custom to filter what you see. Demo data simulates a typical day so charts look realistic.",
      },
      {
        title: "Trends",
        body: "Line charts show how values change over time. BP uses systolic & diastolic values together.",
      },
      {
        title: "Sleep",
        body: "Sleep sessions are grouped by day for the last 7 days. In real mode, sessions are fetched from your backend.",
      },
      {
        title: "Personalized AI",
        body: "This section uses your personal baseline model to flag unusual windows. Demo mode shows sample anomalies so reviewers understand the feature.",
      },
      {
        title: "Exit Demo",
        body: "Use the DEMO banner to exit and connect Google Fit for real data.",
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const step = steps[idx];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-xl border p-5">
        <div className="text-xs font-semibold text-gray-500">
          Demo tour {idx + 1} / {steps.length}
        </div>

        <div className="mt-2 text-lg font-extrabold text-gray-900">{step.title}</div>
        <div className="mt-2 text-sm text-gray-700 leading-relaxed">{step.body}</div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-2xl border bg-white hover:bg-gray-50 text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-2xl border bg-white hover:bg-gray-50 text-sm font-semibold disabled:opacity-50"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={idx === 0}
            >
              Back
            </button>

            {idx < steps.length - 1 ? (
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                onClick={() => setIdx((v) => Math.min(steps.length - 1, v + 1))}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="px-4 py-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                onClick={onClose}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}