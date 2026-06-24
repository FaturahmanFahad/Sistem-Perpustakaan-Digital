import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Receipt, Settings, Library, CheckCircle, History } from 'lucide-react';

function Sidebar({ user }) {
  const links = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'user']
    },
    {
      to: '/books',
      label: user?.role === 'admin' ? 'Kelola Buku' : 'Daftar Buku',
      icon: BookOpen,
      roles: ['admin', 'user']
    },
    {
      to: '/borrowings',
      label: 'Peminjaman Buku',
      icon: Receipt,
      roles: ['admin', 'user']
    },
    {
      to: '/returns',
      label: 'Pengembalian',
      icon: CheckCircle,
      roles: ['admin', 'user']
    },
    {
      to: '/history',
      label: 'Riwayat Peminjaman dan Pengembalian',
      icon: History,
      roles: ['admin', 'user']
    }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-colors duration-200">
      {/* Brand logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
        <Library className="h-6.5 w-6.5 text-teal-500 dark:text-teal-400" />
        <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-300 bg-clip-text text-transparent">
          PerpusDigital
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        
        {links
          .filter(link => link.roles.includes(user?.role))
          .map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-l-2 border-teal-500'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500">Aplikasi Versi 1.0.0</p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold tracking-wider uppercase">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
