import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />
      <main
        className={`transition-all duration-300 p-6 overflow-auto ${
          collapsed ? "w-[calc(100%-80px)]" : "w-[calc(100%-250px)]"
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
