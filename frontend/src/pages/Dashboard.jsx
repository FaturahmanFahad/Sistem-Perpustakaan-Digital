import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, CheckCircle, ArrowUpRight, Plus, Eye, Calendar, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { borrowingService, statsService, bookService } from '../services/api';

function Dashboard({ user, token }) {
  const navigate = useNavigate();
  
  // Admin stats states
  const [stats, setStats] = useState({
    total_books: 0,
    total_users: 0,
    active_borrowings: 0,
    total_borrowings: 0
  });

  // User personal dashboard states
  const [userStats, setUserStats] = useState({
    active_borrowings: 0,
    closest_due_date: null,
    remaining_quota: 3,
    max_quota: 3
  });
  const [recommendations, setRecommendations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
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
        } else {
          // Fetch user-specific metrics and recommendation grid
          const [userStatsRes, recoRes] = await Promise.all([
            statsService.getUserStats(),
            bookService.getRecommendations()
          ]);

          if (userStatsRes && userStatsRes.success) {
            setUserStats(userStatsRes.data);
          }
          if (recoRes && recoRes.success) {
            setRecommendations(recoRes.data);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Gagal memuat data dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, user]);

  const showActionAlert = (text, type) => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: '', type: '' }), 4000);
  };

  // Quick borrow handler from recommendation cards
  const handleQuickBorrow = async (bookId) => {
    try {
      const res = await borrowingService.borrow(bookId, 7);
      showActionAlert(res.message || 'Buku berhasil dipinjam!', 'success');
      // Refresh user metrics after borrowing
      const updatedUserStats = await statsService.getUserStats();
      if (updatedUserStats.success) {
        setUserStats(updatedUserStats.data);
      }
    } catch (err) {
      showActionAlert(err.response?.data?.message || err.message || 'Gagal meminjam buku.', 'error');
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'Tidak Ada Peminjaman';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const adminStatCards = [
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
      desc: 'Transaksi peminjaman berjalan (Klik detail)',
      icon: ClipboardList,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-pointer',
      link: '/borrowings'
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
            {user?.role === 'admin' 
              ? 'Anda login sebagai Administrator. Kelola katalog buku, catat peminjaman baru, dan pantau aktivitas perpustakaan.'
              : 'Anda login sebagai Anggota Perpustakaan. Pantau status pinjaman Anda dan jelajahi ratusan koleksi buku menarik kami.'}
          </p>
        </div>
      </div>

      {actionMsg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm ${
          actionMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Stats Section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-900/40 border border-slate-800/80 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          Gagal terhubung dengan server: {error}
        </div>
      ) : user?.role === 'admin' ? (
        /* ADMIN STATS CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminStatCards.map((card, idx) => {
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

            return card.link ? (
              <Link key={idx} to={card.link} className={`glass-card p-6 rounded-xl flex flex-col justify-between border bg-gradient-to-br ${card.color} block`}>
                {CardContent}
              </Link>
            ) : (
              <div key={idx} className={`glass-card p-6 rounded-xl flex flex-col justify-between border bg-gradient-to-br ${card.color}`}>
                {CardContent}
              </div>
            );
          })}
        </div>
      ) : (
        /* USER PERSONALIZED METRICS CARDS */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Buku Sedang Saya Pinjam */}
          <Link to="/returns" className="glass-card p-6 rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 block">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Buku Sedang Saya Pinjam</span>
              <div className="p-2 bg-slate-950/40 text-teal-400 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{userStats.active_borrowings} Buku</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                Klik untuk mengembalikan / cek status <ArrowUpRight className="h-3 w-3 inline" />
              </p>
            </div>
          </Link>

          {/* Card 2: Tenggat Waktu Terdekat */}
          <div className="glass-card p-6 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tenggat Waktu Terdekat</span>
              <div className="p-2 bg-slate-950/40 text-amber-400 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {formatDueDate(userStats.closest_due_date)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {userStats.closest_due_date ? 'Jatuh tempo peminjaman terdekat' : 'Belum ada tanggungan pinjaman'}
              </p>
            </div>
          </div>

          {/* Card 3: Sisa Kuota Pinjam */}
          <div className="glass-card p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Sisa Kuota Pinjam</span>
              <div className="p-2 bg-slate-950/40 text-cyan-400 rounded-lg">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-100 tracking-tight">{userStats.remaining_quota} Slot</h3>
              <p className="text-xs text-slate-400 mt-1">Dapat meminjam hingga {userStats.max_quota} buku bersamaan</p>
            </div>
          </div>
        </div>
      )}

      {/* USER SECTION: Rekomendasi Buku Terpopuler */}
      {user?.role === 'user' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Rekomendasi Buku Terpopuler
            </h3>
            <Link to="/books" className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1">
              Lihat Semua Katalog <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendations.map((book) => (
              <div key={book.id} className="glass-panel border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-teal-500/40 transition-all group shadow-lg">
                <div>
                  <div className="h-40 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-lg flex flex-col items-center justify-center p-4 text-center mb-4 relative overflow-hidden group-hover:scale-[1.01] transition-transform">
                    <BookOpen className="h-10 w-10 text-teal-400/80 mb-2" />
                    <span className="text-xs font-bold text-slate-200 line-clamp-2 px-2">{book.judul}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-base line-clamp-1 group-hover:text-teal-400 transition-colors">{book.judul}</h4>
                  <p className="text-xs text-slate-400 mt-1">Penulis: <span className="text-slate-300 font-medium">{book.penulis}</span></p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stok Tersedia: <span className="font-semibold text-teal-400">{book.stok} buah</span></p>
                </div>

                <button
                  onClick={() => handleQuickBorrow(book.id)}
                  disabled={book.stok <= 0 || userStats.remaining_quota <= 0 || userStats.active_borrowings >= 3}
                  className="mt-4 w-full py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors shadow-md shadow-teal-500/10"
                >
                  {book.stok <= 0 ? 'Stok Habis' : (userStats.remaining_quota <= 0 || userStats.active_borrowings >= 3) ? 'Kuota Pinjam Habis' : 'Pinjam Buku'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action & Info Guidelines Panels for Admin */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel rounded-xl p-6 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Akses Cepat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Pintas menu cepat untuk menjalankan alur operasional utama perpustakaan.</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/books')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm font-semibold border border-teal-500/20 transition-all"
              >
                <span className="flex items-center gap-2"><Plus className="h-4 w-4" /> Tambah Koleksi Buku</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button 
                onClick={() => navigate('/borrowings')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-700/60 text-slate-100 text-sm font-semibold border border-slate-700 transition-all"
              >
                <span className="flex items-center gap-2"><Eye className="h-4 w-4" /> Lihat Log Transaksi</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Panduan Sistem & Ketentuan Administrator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">Ketentuan operasional administrator perpustakaan digital:</p>
              
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span><strong>Peminjaman Buku:</strong> Peminjaman mengurangi stok buku secara otomatis real-time.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                  <span><strong>Batas Pengembalian:</strong> Wajib memantau keterlambatan pengembalian buku anggota.</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Sistem Perpustakaan Digital UAS</span>
              <span>UAS Web Dev 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
