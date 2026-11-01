import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider, useAINativeAuth } from '@ainative/react-sdk';
import CardManagement from './components/CardManagement';
import Authentication from './components/Authentication';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('ainative_token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate an auth check or fetch user info
        // In a real app, you might want to verify the token here
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      const data = await response.json();
      localStorage.setItem('ainative_token', data.access_token);
      window.location.href = '/'; // Redirect to home
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    window.location.href = '/login'; // Redirect to login
  };

  const token = localStorage.getItem('ainative_token');

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <BrowserRouter>
        <header className="bg-dark-navy text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/card-management">Card Management</Link>
                </li>
              </ul>
            </nav>
            {token ? (
              <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded text-sm">
                Logout
              </button>
            ) : (
              <Link to="/login" className="bg-blue-500 px-4 py-2 rounded text-sm">
                Login
              </Link>
            )}
          </div>
        </header>

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={<Authentication onLogin={handleLogin} />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div className="mt-10">
                    <h1 className="text-2xl font-bold mb-4">Minimal Kanban Board</h1>
                    <p>Welcome to your kanban board!</p>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/card-management"
              element={
                <ProtectedRoute>
                  <CardManagement />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AINativeProvider>
  );
};

export default App;