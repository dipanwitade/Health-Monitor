import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Logout from './pages/Logout';
import OAuthSuccess from './pages/OAuthSuccess';

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PersonalizedDashboard from "./pages/PersonalizedDashboard";

import Landing from "./pages/Landing";


const App = () => {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}

        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}



        <Route
          path="/"
          element={
            localStorage.getItem("user_email") &&
              localStorage.getItem("demo_mode") !== "true"
              ? <Navigate to="/dashboard" replace />
              : <Landing />
          }
        />



        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        } />

        {/*  New Personalized Dashboard */}
        <Route path="/personal-dashboard" element={
          <ProtectedRoute>
            <MainLayout><PersonalizedDashboard /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
};

export default App;
