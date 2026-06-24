import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Search, Sun, Moon } from 'lucide-react';
import API from '../services/api';

function Navbar({ user, onLogout, theme, toggleTheme, onSearch }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Fetch notifications from Backend API
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil notifikasi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle global search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(keyword);
    }
    navigate('/books'); // Redirect to books catalog page to show results
  };

  return (
    <header className="h-16 px-6 glass-panel border-b border-slate-800 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar section */}
      <form onSubmit={handleSearchSubmit} className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari buku atau transaksi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </form>

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

        {/* Notifications Dropdown Area */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-teal-500 rounded-full"></span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-350">Notifikasi Baru</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])} 
                    className="text-[10px] text-rose-500 hover:underline font-semibold"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">Memuat...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">Tidak ada notifikasi baru.</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{notif.text}</p>
                      <span className="text-[10px] text-slate-500 mt-1 block">{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
