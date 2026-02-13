import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaSignOutAlt,
  FaHeartbeat,
  FaTimes,
} from "react-icons/fa";

const Sidebar = ({
  collapsed,
  toggleSidebar,
  mobileOpen = false,
  setMobileOpen = () => {},
}) => {
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.clear();
    closeMobile();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    }`;

  return (
    <>
      
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={[
          // Base look
          "bg-white border-r shadow-sm h-screen",
          // Drawer behavior on mobile
          "fixed inset-y-0 left-0 z-[90] md:static md:z-auto",

          "transform transition-transform duration-200 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Always visible on desktop
          "md:translate-x-0",
          
          "w-[260px] md:w-auto",
        ].join(" ")}
      >
        {/* Inner wrapper to control width on desktop */}
        <div
          className={[
            "h-full",
            "transition-all duration-300 ease-in-out",
            collapsed ? "md:w-[80px]" : "md:w-[250px]",
            "w-[260px] md:w-auto",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            {/* Title: always show in mobile drawer, hide when collapsed on desktop */}
            <h2
              className={[
                "text-2xl font-bold text-blue-600",
                collapsed ? "hidden md:hidden" : "block",
                // force visible on mobile drawer
                "md:block",
              ].join(" ")}
            >
              Smart Health Monitor
            </h2>

            {/* Right button:
                - mobile: close button
                - desktop: collapse button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // On mobile: close drawer
                  if (window.innerWidth < 768) closeMobile();
                }}
                className="md:hidden text-gray-600 text-xl"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>

              <button
                onClick={toggleSidebar}
                className="hidden md:inline-flex text-gray-600 text-xl"
                aria-label="Toggle sidebar"
              >
                <FaBars />
              </button>

              
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col space-y-2 p-2">
            <NavLink to="/dashboard" className={linkClasses} onClick={closeMobile}>
              <FaTachometerAlt />
              <span className={collapsed ? "hidden md:hidden" : "block"}>
                Dashboard
              </span>
            </NavLink>

            <NavLink to="/profile" className={linkClasses} onClick={closeMobile}>
              <FaUser />
              <span className={collapsed ? "hidden md:hidden" : "block"}>
                Profile
              </span>
            </NavLink>

            <NavLink
              to="/personal-dashboard"
              className={linkClasses}
              onClick={closeMobile}
            >
              <FaHeartbeat />
              <span className={collapsed ? "hidden md:hidden" : "block"}>
                Personalized Dashboard
              </span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
              <FaSignOutAlt />
              <span className={collapsed ? "hidden md:hidden" : "block"}>
                Logout
              </span>
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
