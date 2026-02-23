// // src/routes/ProtectedRoute.jsx

// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem("user_email"); // or use token

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;


// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const email = localStorage.getItem("user_email");
  const demo = localStorage.getItem("demo_mode") === "true";

  if (!email && !demo) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;