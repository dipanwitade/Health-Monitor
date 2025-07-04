import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = ({ collapsed, toggleSidebar }) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${isActive
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-blue-100 hover:text-blue-600"
    }`;






  return (
    <div
      className={`h-screen bg-white shadow-md transition-all duration-300 ease-in-out ${collapsed ? "w-[80px]" : "w-[250px]"
        }`}
    >
      <div className="flex justify-between items-center p-4">
        {!collapsed && (
          <h2 className="text-2xl font-bold text-blue-600">HealthApp</h2>
        )}
        <button onClick={toggleSidebar} className="text-gray-600 text-xl">
          <FaBars />
        </button>
      </div>

      <nav className="flex flex-col space-y-2 p-2">
        <NavLink to="/dashboard" className={linkClasses}>
          <FaTachometerAlt />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        <NavLink to="/profile" className={linkClasses}>
          <FaUser />
          {!collapsed && <span>Profile</span>}
        </NavLink>
        <NavLink to="/logout" className={linkClasses}>
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </NavLink>


      </nav>
    </div>
  );
};

export default Sidebar;
