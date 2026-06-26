import React, { useState, useEffect } from 'react';
import { Users, Calendar, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import { memberService } from '../services/api';

function Members({ token }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await memberService.getAll();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat daftar anggota.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const formatDateString = (rawDate) => {
    if (!rawDate) return '-';
    const d = new Date(rawDate);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-500" />
            Daftar Anggota Aktif
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Menampilkan daftar seluruh anggota perpustakaan yang terdaftar di sistem.
          </p>
        </div>

        <button
          onClick={fetchMembers}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg flex items-center gap-3 border text-sm bg-rose-500/10 border-rose-500/20 text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200/40 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/80 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="glass-panel text-center p-12 rounded-xl border border-slate-200 dark:border-slate-800">
          <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">Belum ada anggota yang terdaftar.</p>
        </div>
      ) : (
        <div className="glass-panel border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">ID Anggota</th>
                  <th className="py-4 px-6">Nama Anggota</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Tanggal Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">
                      #{member.id}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                      {member.nama}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{formatDateString(member.created_at)}</span>
                      </div>
                    </td>
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

export default Members;
