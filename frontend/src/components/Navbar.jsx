import React from 'react';
import { LogOut, User, Bell, Search, Sun, Moon } from 'lucide-react';

function Navbar({ user, onLogout, theme, toggleTheme }) {
  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-800 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar section */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari buku atau transaksi..."
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* User Actions Section */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Switch */}
        <button 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-400" />}
        </button>

        {/* Notifications Mock */}
        <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-teal-500 rounded-full"></span>
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-100">{user?.username}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role === 'admin' ? 'Administrator' : 'Anggota'}</p>
          </div>
          
          <div className="h-9 w-9 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-lg flex items-center justify-center font-bold">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>

          <button 
            onClick={onLogout}
            title="Keluar Aplikasi"
            className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
