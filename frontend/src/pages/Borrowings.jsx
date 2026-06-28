import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, CheckCircle, Clock, AlertCircle, RefreshCw, History, Receipt } from 'lucide-react';
import { borrowingService, statsService } from '../services/api';

function Borrowings({ user, token, filterStatus = 'semua' }) {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [ratioStats, setRatioStats] = useState(null);

  // Fetch borrowing history logs
  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const data = user?.role === 'admin' 
        ? await borrowingService.getAll() 
        : await borrowingService.getMy();
      if (data.success) {
        setBorrowings(data.data);
      }

      if (filterStatus === 'semua') {
        const statsData = await statsService.getReturnRatio();
        if (statsData.success) {
          setRatioStats(statsData.data);
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal memuat riwayat peminjaman.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [token, user, filterStatus]);

  // Flash Alert message utility
  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Return book transaction trigger
  const handleReturnBook = async (borrowingId) => {
    try {
      const data = await borrowingService.returnBook(borrowingId);
      showAlert(data.message || 'Buku berhasil dikembalikan.', 'success');
      fetchBorrowings(); // Refresh listings
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal melakukan pengembalian.', 'error');
    }
  };

  // Date formatting helper function
  const formatDateString = (rawDate) => {
    if (!rawDate) return '-';
    const d = new Date(rawDate);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter listings based on filterStatus
  const displayedBorrowings = borrowings.filter((tx) => {
    if (filterStatus === 'dipinjam') return tx.status === 'dipinjam';
    if (filterStatus === 'kembali') return tx.status === 'kembali';
    return true; // 'semua'
  });

  // Dynamic Page Header Information based on filterStatus
  const getHeaderInfo = () => {
    if (filterStatus === 'dipinjam') {
      return {
        title: user?.role === 'admin' ? 'Log Peminjaman Buku (Aktif)' : 'Peminjaman Buku',
        desc: user?.role === 'admin' 
          ? 'Pantau daftar buku yang saat ini sedang dipinjam oleh anggota.' 
          : 'Daftar buku yang sedang Anda pinjam. Silakan lakukan pengembalian buku di sini.',
        icon: Receipt
      };
    } else if (filterStatus === 'kembali') {
      return {
        title: user?.role === 'admin' ? 'Log Pengembalian Buku' : 'Pengembalian',
        desc: user?.role === 'admin' 
          ? 'Pantau riwayat pengembalian buku yang telah selesai diproses.' 
          : 'Daftar buku yang telah selesai Anda pinjam dan sukses dikembalikan.',
        icon: CheckCircle
      };
    } else {
      return {
        title: user?.role === 'admin' ? 'Riwayat Transaksi Peminjaman & Pengembalian' : 'Riwayat Peminjaman dan Pengembalian',
        desc: user?.role === 'admin'
          ? 'Seluruh riwayat sirkulasi peminjaman dan pengembalian buku di perpustakaan.'
          : 'Seluruh riwayat transaksi peminjaman dan pengembalian buku Anda.',
        icon: History
      };
    }
  };

  const headerInfo = getHeaderInfo();
  const IconHeader = headerInfo.icon;

  return (
    <div className="space-y-6">
      {/* Page header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IconHeader className="h-6 w-6 text-teal-500 dark:text-teal-400" />
            {headerInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {headerInfo.desc}
          </p>
        </div>

        <button
          onClick={fetchBorrowings}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {/* Flash alert banner */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 border text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Analytical Insights for Return Performance */}
      {filterStatus === 'semua' && ratioStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rasio Kepatuhan</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-500 dark:text-teal-400">{ratioStats.ratio}%</span>
              <span className="text-xs text-slate-500">dari total transaksi</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${ratioStats.ratio}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tepat Waktu</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">{ratioStats.tepat_waktu}</span>
              <span className="text-xs text-slate-500">buku dikembalikan</span>
            </div>
            <p className="text-[10px] text-emerald-500 mt-2 font-semibold">✓ Dikembalikan dalam batas tenggat waktu 7 hari</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terlambat / Denda</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-500 dark:text-rose-400">{ratioStats.terlambat}</span>
              <span className="text-xs text-slate-500">transaksi terlambat</span>
            </div>
            <p className="text-[10px] text-rose-500 mt-2 font-semibold">⚠ Melebihi batas tenggat waktu 7 hari (denda berlaku)</p>
          </div>
        </div>
      )}

      {/* Listing tables */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : displayedBorrowings.length === 0 ? (
        <div className="glass-panel text-center p-12 rounded-xl border border-slate-200 dark:border-slate-800">
          <IconHeader className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">
            {filterStatus === 'dipinjam' 
              ? 'Belum ada buku yang sedang dipinjam.' 
              : filterStatus === 'kembali' 
                ? 'Belum ada riwayat pengembalian buku.' 
                : 'Belum ada transaksi peminjaman.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {user?.role === 'admin' ? 'Belum ada anggota yang melakukan transaksi.' : 'Buku yang Anda pinjam akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Buku</th>
                  {user?.role === 'admin' && <th className="py-4 px-6">Peminjam</th>}
                  <th className="py-4 px-6">Tanggal Pinjam</th>
                  {filterStatus !== 'dipinjam' && <th className="py-4 px-6">Tanggal Kembali</th>}
                  <th className="py-4 px-6 text-center">Status</th>
                  {filterStatus !== 'kembali' && <th className="py-4 px-6 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {displayedBorrowings.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{tx.judul}</p>
                      <p className="text-[10px] text-slate-500">ID Transaksi: #{tx.id}</p>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">{tx.username}</td>
                    )}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{formatDateString(tx.tanggal_pinjam)}</span>
                      </div>
                    </td>
                    {filterStatus !== 'dipinjam' && (
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                        {tx.tanggal_kembali ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span>{formatDateString(tx.tanggal_kembali)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-xs">Belum dikembalikan</span>
                        )}
                      </td>
                    )}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        tx.status === 'dipinjam' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {tx.status === 'dipinjam' ? (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Dipinjam</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>Selesai</span>
                          </>
                        )}
                      </span>
                    </td>
                    {filterStatus !== 'kembali' && (
                      <td className="py-4 px-6 text-right">
                        {tx.status === 'dipinjam' ? (
                          <button
                            onClick={() => handleReturnBook(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs transition-colors"
                          >
                            Kembalikan Buku
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs">Selesai</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Borrowings;
