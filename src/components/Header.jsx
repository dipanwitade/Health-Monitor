import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">Smart Health Dashboard</h1>
      <div className="text-sm">Welcome, User</div>
    </header>
  );
};

export default Header;
