import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, BookOpen, AlertCircle, CheckCircle, X } from 'lucide-react';
import { bookService, borrowingService } from '../services/api';

function Books({ user, token }) {
  const { searchKeyword } = useOutletContext() || {};
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Alert/Notification states
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);
  
  // Form fields
  const [judul, setJudul] = useState('');
  const [penulis, setPenulis] = useState('');
  const [penerbit, setPenerbit] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [stok, setStok] = useState('');

  // Fetch book collections
  const fetchBooks = async (query = '') => {
    setLoading(true);
    try {
      const data = await bookService.getAll(query);
      if (data.success) {
        setBooks(data.data);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal menghubungi server database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(searchKeyword || '');
  }, [token, searchKeyword]);

  // Utility to handle search input
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  // Helper to show flash alert message
  const showAlert = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // Clear modal inputs
  const resetForm = () => {
    setJudul('');
    setPenulis('');
    setPenerbit('');
    setTahunTerbit('');
    setStok('');
    setCurrentBookId(null);
    setIsEdit(false);
  };

  // Handle open create modal
  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle open edit modal
  const openEditModal = (book) => {
    setJudul(book.judul);
    setPenulis(book.penulis);
    setPenerbit(book.penerbit);
    setTahunTerbit(book.tahun_terbit);
    setStok(book.stok);
    setCurrentBookId(book.id);
    setIsEdit(true);
    setShowModal(true);
  };

  // Submit form (Create or Edit Book)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!judul || !penulis || !penerbit || !tahunTerbit || stok === '') {
      showAlert('Semua field wajib diisi.', 'error');
      return;
    }

    const payload = {
      judul,
      penulis,
      penerbit,
      tahun_terbit: parseInt(tahunTerbit),
      stok: parseInt(stok)
    };

    try {
      const data = isEdit 
        ? await bookService.update(currentBookId, payload)
        : await bookService.create(payload);

      showAlert(data.message || 'Buku berhasil disimpan.', 'success');
      setShowModal(false);
      resetForm();
      fetchBooks(search);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal menyimpan data buku.', 'error');
    }
  };

  // Delete Book handler
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;

    try {
      const data = await bookService.delete(id);
      showAlert(data.message || 'Buku berhasil dihapus.', 'success');
      fetchBooks(search);
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal menghapus buku.', 'error');
    }
  };

  // Borrow Book handler
  const handleBorrowBook = async (bookId) => {
    try {
      const data = await borrowingService.borrow(bookId);
      showAlert(data.message || 'Buku berhasil dipinjam.', 'success');
      fetchBooks(search); // Refresh lists to show new stock level
    } catch (err) {
      showAlert(err.response?.data?.message || err.message || 'Gagal meminjam buku.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-400" />
            {user?.role === 'admin' ? 'Kelola Katalog Buku' : 'Daftar Buku Digital'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Cari, temukan, dan pinjam buku favorit Anda dalam hitungan detik.</p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm shadow-lg shadow-teal-500/10 transition-colors"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Tambah Buku</span>
          </button>
        )}
      </div>

      {/* Alert Banner */}
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

      {/* Search Input Filter bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, penulis, atau penerbit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm transition-colors font-semibold"
        >
          Cari
        </button>
      </form>

      {/* Table list section */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-panel text-center p-12 rounded-xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">Koleksi buku kosong atau tidak ditemukan.</p>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Informasi Buku</th>
                  <th className="py-4 px-6">Penerbit</th>
                  <th className="py-4 px-6">Tahun</th>
                  <th className="py-4 px-6 text-center">Stok</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-base">{book.judul}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Penulis: {book.penulis}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{book.penerbit}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{book.tahun_terbit}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        book.stok > 0 
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {book.stok} Buku
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user?.role === 'admin' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(book)}
                            title="Edit Buku"
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-slate-350 dark:border-slate-700/60"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            title="Hapus Buku"
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-slate-350 dark:border-slate-700/60"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleBorrowBook(book.id)}
                          disabled={book.stok <= 0}
                          className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors shadow-sm"
                        >
                          {book.stok > 0 ? 'Pinjam Buku' : 'Stok Habis'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal for Admin (Add / Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{isEdit ? 'Ubah Informasi Buku' : 'Tambah Buku Baru'}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Judul Buku</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Laskar Pelangi"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Penulis</label>
                <input
                  type="text"
                  required
                  value={penulis}
                  onChange={(e) => setPenulis(e.target.value)}
                  placeholder="Andrea Hirata"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Penerbit</label>
                <input
                  type="text"
                  required
                  value={penerbit}
                  onChange={(e) => setPenerbit(e.target.value)}
                  placeholder="Bentang Pustaka"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tahun Terbit</label>
                  <input
                    type="number"
                    required
                    value={tahunTerbit}
                    onChange={(e) => setTahunTerbit(e.target.value)}
                    placeholder="2005"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Jumlah Stok</label>
                  <input
                    type="number"
                    required
                    value={stok}
                    onChange={(e) => setStok(e.target.value)}
                    placeholder="10"
                    min="0"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition-colors font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-teal-500/10"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
