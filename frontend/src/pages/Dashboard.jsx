import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, CheckCircle, ArrowUpRight, Plus, Eye } from 'lucide-react';
import { borrowingService, statsService } from '../services/api';

function Dashboard({ user, token }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_books: 0,
    total_users: 0,
    active_borrowings: 0,
    total_borrowings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, totalBooksRes] = await Promise.all([
          borrowingService.getStats(),
          statsService.getTotalBooks()
        ]);

        let combinedStats = {
          total_books: 0,
          total_users: 0,
          active_borrowings: 0,
          total_borrowings: 0
        };

        if (statsRes && statsRes.success) {
          combinedStats = { ...combinedStats, ...statsRes.data };
        }
        if (totalBooksRes && totalBooksRes.success) {
          combinedStats.total_books = totalBooksRes.data.total;
        }

        setStats(combinedStats);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat statistik sistem.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  // Statistics calculation helpers
  const returnRate = stats.total_borrowings > 0
    ? Math.round(((stats.total_borrowings - stats.active_borrowings) / stats.total_borrowings) * 100)
    : 0;

  const statCards = [
    {
      title: 'Total Koleksi Buku',
      value: stats.total_books,
      desc: 'Buku terdaftar di sistem',
      icon: BookOpen,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      title: 'Anggota Aktif',
      value: stats.total_users,
      desc: 'Anggota perpustakaan terdaftar (Klik detail)',
      icon: Users,
      color: 'from-indigo-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-pointer',
      link: '/members'
    },
    {
      title: 'Buku Sedang Dipinjam',
      value: stats.active_borrowings,
      desc: 'Transaksi peminjaman berjalan',
      icon: ClipboardList,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      title: 'Rasio Pengembalian',
      value: `${returnRate}%`,
      desc: 'Persentase pengembalian buku',
      icon: CheckCircle,
      color: 'from-fuchsia-500/20 to-rose-500/20 text-rose-400 border-rose-500/30'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 to-slate-900 border border-slate-700/80 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
            Selamat Datang Kembali, {user?.username}! 👋
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">
            Anda login sebagai <span className="font-semibold text-teal-400 capitalize">{user?.role}</span>. Kelola katalog buku, catat peminjaman baru, dan pantau aktivitas perpustakaan melalui panel kontrol ini.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-900/40 border border-slate-800/80 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Gagal terhubung dengan server: {error}. Menampilkan data mock kosong.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            const CardContent = (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-400 tracking-wide">{card.title}</span>
                  <div className="p-2 bg-slate-950/40 rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{card.value}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.desc}</p>
                </div>
              </>
            );

            if (card.link) {
              return (
                <Link
                  key={idx}
                  to={card.link}
                  className={`glass-card p-6 rounded-xl flex flex-col justify-between border bg-gradient-to-br ${card.color} block`}
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div key={idx} className={`glass-card p-6 rounded-xl flex flex-col justify-between border bg-gradient-to-br ${card.color}`}>
                {CardContent}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Panels & Info Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Akses Cepat</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Pintas menu cepat untuk menjalankan alur operasional utama perpustakaan secara efisien.</p>
          </div>
          
          <div className="space-y-3">
            {user?.role === 'admin' ? (
              <>
                <button 
                  onClick={() => navigate('/books')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-semibold border border-teal-500/20 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Koleksi Buku
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => navigate('/borrowings')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700/60 text-slate-100 text-sm font-semibold border border-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Lihat Log Transaksi
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/books')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-semibold border border-teal-500/20 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Jelajahi Buku & Pinjam
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => navigate('/borrowings')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700/60 text-slate-100 text-sm font-semibold border border-slate-700 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Pengembalian Buku
                  </span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Operational Guidelines Panel */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Panduan Sistem & Ketentuan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Hal penting yang wajib diperhatikan oleh Administrator dan Anggota dalam mengoperasikan aplikasi Sistem Perpustakaan Digital:</p>
            
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                <span><strong>Peminjaman Buku:</strong> Peminjaman buku akan mengurangi kuota stok buku secara real-time. Jika stok habis, tombol peminjaman akan nonaktif.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                <span><strong>Batas Pengembalian:</strong> Wajib mengembalikan buku tepat waktu untuk menjaga sirkulasi inventaris koleksi perpustakaan.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                <span><strong>Otorisasi Data:</strong> Pengubahan metadata buku (tambah, edit, hapus) hanya dapat dilakukan oleh akun dengan role administrator.</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between items-center">
            <span>Sistem Perpustakaan Digital UAS</span>
            <span>UAS Web Dev 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
