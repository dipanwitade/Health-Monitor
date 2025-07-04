import React from "react";

const LoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;
