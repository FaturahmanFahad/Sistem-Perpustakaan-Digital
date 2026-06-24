import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function MainLayout({ user, onLogout, theme, toggleTheme }) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar Panel */}
      <Sidebar user={user} />

      {/* Main Work Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar user={user} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} onSearch={handleSearch} />

        {/* Dynamic Nested Route Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 px-6 py-6 md:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet context={{ searchKeyword }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
