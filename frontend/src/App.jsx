import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Borrowings from './pages/Borrowings';
import useTheme from './hooks/useTheme';

function App() {
  // Theme state using custom hook
  const { theme, toggleTheme } = useTheme();

  // Authentication state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Keep track of the user token
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || '';
  });

  // Persist authentication data when states change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  // Handle Login success
  const handleLoginSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null);
    setToken('');
  };

  // Route protector for authorized access
  const ProtectedRoute = ({ children }) => {
    if (!user || !token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* Protected Dashboard/App Shell Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout user={user} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
            </ProtectedRoute>
          }
        >
          {/* Default Route redirects to Dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="dashboard" 
            element={<Dashboard user={user} token={token} />} 
          />
          
          <Route 
            path="books" 
            element={<Books user={user} token={token} />} 
          />
          
          <Route 
            path="borrowings" 
            element={<Borrowings user={user} token={token} filterStatus="dipinjam" />} 
          />
          
          <Route 
            path="returns" 
            element={<Borrowings user={user} token={token} filterStatus="kembali" />} 
          />
          
          <Route 
            path="history" 
            element={<Borrowings user={user} token={token} filterStatus="semua" />} 
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
