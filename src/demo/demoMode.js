// src/demo/demoMode.js
export function enterDemoMode() {
  localStorage.setItem("demo_mode", "true");
  // set a stable demo email so your existing code works without changes
  localStorage.setItem("user_email", "demo@smarthealth.local");
}

export function exitDemoMode() {
  localStorage.removeItem("demo_mode");
  localStorage.removeItem("user_email");
  localStorage.removeItem("last_synced_at");
}

export function isDemoMode() {
  return localStorage.getItem("demo_mode") === "true";
}