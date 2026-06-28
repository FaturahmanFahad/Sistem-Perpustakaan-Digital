import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, Library } from 'lucide-react';
import { authService } from '../services/api';

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const usernameWords = username.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
        const cleanEmail = email.toLowerCase().trim();
        const isMatched = usernameWords.some(word => cleanEmail.includes(word));
        
        if (!isMatched) {
          setError('Email harus mengandung unsur nama dari Username Anda!');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Kata sandi dan konfirmasi kata sandi tidak cocok!');
          setLoading(false);
          return;
        }
        const data = await authService.register(username, email, password, confirmPassword, 'user');
        setSuccessMsg(data.message || 'Registrasi berhasil! Silakan login.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const data = await authService.login(email, password);
        // Logged in successfully
        onLoginSuccess(
          { id: data.data.id, username: data.data.username, email: data.data.email, role: data.data.role },
          data.data.token
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 z-10 glow-teal shadow-2xl">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-teal-500/20 text-teal-500 dark:text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            📚
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
            {isRegister ? 'Buat Akun Baru' : 'Masuk Ke Library'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {isRegister ? 'Daftar untuk mengakses ratusan buku digital' : 'Sistem Informasi Perpustakaan Digital'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Konfirmasi Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
          )}



          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:translate-y-[1px] disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                <span>{isRegister ? 'Daftar Akun' : 'Masuk'}</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-5">
          <p>
            {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
              }}
              className="text-teal-500 dark:text-teal-400 hover:underline font-semibold ml-1.5 focus:outline-none"
            >
              {isRegister ? 'Masuk sekarang' : 'Daftar sekarang'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
