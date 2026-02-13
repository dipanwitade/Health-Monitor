


import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Blockchain from '../pages/Blockchain';
import NotFound from '../pages/NotFound';
import OauthSuccess from "../pages/OAuthSuccess";
import PersonalizedDashboard from '../pages/PersonalizedDashboard';


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/blockchain" element={<Blockchain />} />
    <Route path="/oauth-success" element={<OauthSuccess />} />
    <Route path="/personal-dashboard" element={<PersonalizedDashboard />} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
