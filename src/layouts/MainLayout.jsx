import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { FaBars } from "react-icons/fa";

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="font-extrabold text-gray-900">Smart Health Monitor</div>
          <button
            onClick={() => setMobileOpen(true)}
            className="h-10 w-10 rounded-xl border bg-white flex items-center justify-center text-gray-700"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </header>

      
      <div className="hidden md:flex h-[calc(100vh)]">
        <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />

        
        <main className="flex-1 min-w-0 p-6 overflow-auto">
          {children}
        </main>
      </div>

      
      <div className="md:hidden">
        <Sidebar
          collapsed={false} 
          toggleSidebar={() => {}}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
