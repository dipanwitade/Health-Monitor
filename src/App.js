import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Logout from './pages/Logout';
import OAuthSuccess from './pages/OAuthSuccess';

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";


const App = () => {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route path="/" element={<Landing />} />

        {/* <Route path="/" element={
          <ProtectedRoute>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } /> */}

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

        {/* Catch-All Route */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
};

export default App;
