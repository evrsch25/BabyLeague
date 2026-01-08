import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Home from './pages/Home';
import MatchLive from './pages/MatchLive';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import { getCurrentUser, setCurrentUser } from './services/api';

function App() {
  const [currentUser, setCurrentUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUserState(user);
    setLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserState(null);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          {loading ? (
            <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚽</div>
                <div>Chargement...</div>
              </div>
            </div>
          ) : (
            <>
              {currentUser && <Navigation currentUser={currentUser} onLogout={handleLogout} />}
              <div className="main-content">
                <Routes>
                  <Route 
                    path="/login" 
                    element={currentUser ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
                  />
                  <Route 
                    path="/" 
                    element={currentUser ? <Home /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/match/:id" 
                    element={currentUser ? <MatchLive /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/ranking" 
                    element={currentUser ? <Ranking /> : <Navigate to="/login" />} 
                  />
                  <Route 
                    path="/profile/:id" 
                    element={currentUser ? <Profile /> : <Navigate to="/login" />} 
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </>
          )}
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;

