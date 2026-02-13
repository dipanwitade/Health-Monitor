// src/components/LoginButton.jsx
import React, { useMemo, useState } from "react";

const LoginButton = ({ onStart }) => {
  const [loading, setLoading] = useState(false);

  const backendUrl = useMemo(() => {
    const url =
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_BACKEND_URL ||
      "http://localhost:8000";
    return url.replace(/\/+$/, "");
  }, []);

  const handleGoogleLogin = () => {
    if (loading) return;
    setLoading(true);
    onStart?.(); 

    window.location.href = `${backendUrl}/auth/google/login`;
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      aria-busy={loading}
      className={[
        "w-full flex items-center justify-center gap-3",
        "rounded-2xl px-5 py-3.5",
        "border border-gray-200 bg-white",
        "text-gray-900 font-semibold shadow-sm transition",
        "hover:bg-gray-50 hover:border-gray-300",
        "active:scale-[0.99]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.3l8.1 6.3C12.7 13.2 17.9 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.7c-.5 2.6-2.1 4.9-4.4 6.4l7 5.4c4.1-3.8 6.8-9.4 6.8-15.5z"
        />
        <path
          fill="#FBBC05"
          d="M10.7 28.1c-.5-1.6-.8-3.3-.8-5.1s.3-3.5.8-5.1l-8.1-6.3C.9 14.8 0 19.3 0 24s.9 9.2 2.6 12.4l8.1-6.3z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.5 0 12-2.1 16-5.8l-7-5.4c-1.9 1.3-4.4 2.1-9 2.1-6.1 0-11.3-3.7-13.3-8.9l-8.1 6.3C6.5 42.6 14.6 48 24 48z"
        />
      </svg>

      <span className={loading ? "opacity-70" : ""}>
        {loading ? "Connecting…" : "Continue with Google"}
      </span>

      {loading ? (
        <svg width="18" height="18" viewBox="0 0 24 24" className="animate-spin">
          <path
            d="M12 2a10 10 0 1 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
    </button>
  );
};

export default LoginButton;
