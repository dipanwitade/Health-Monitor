// src/pages/Logout.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exitDemoMode } from "../demo/demoMode"; 

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    
    localStorage.removeItem("user_email");
    localStorage.removeItem("last_synced_at");

    
    exitDemoMode?.(); 

    
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default Logout;