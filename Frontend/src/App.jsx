import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import Events from './pages/Events';
import About from './pages/About';
import axios from 'axios';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Clear all auth-related keys
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          // Dispatch storage event so components can pick it up
          window.dispatchEvent(new Event('storage'));
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const allowedPaths = ['/dashboard', '/college-dashboard', '/events'];
      // If the user visits the home page or about page (anything not allowed), we log them out
      if (!allowedPaths.includes(location.pathname)) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('storage'));
      }
    }
  }, [location.pathname]);

  return (
      <div className="app-wrapper flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/college-dashboard" element={<CollegeDashboard />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            {/* Redirect unknown routes */}
            <Route path="*" element={
              <div className="container" style={{ textAlign:'center', paddingTop:'6rem' }}>
                <h1 style={{ fontSize:'4rem', fontFamily:'var(--font-display)' }}>404</h1>
                <p style={{ color:'hsl(var(--text-muted))', marginTop:'1rem' }}>Page not found.</p>
              </div>
            } />
          </Routes>
        </main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div className="footer-brand">
              <span>🎯</span>
              <span className="footer-brand-name">Collexa</span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} Collexa. Connecting campus events to the city.
            </p>
            <div className="footer-links">
              <a href="/about">About</a>
              <a href="/events">Events</a>
              <a href="/login">Sign In</a>
            </div>
          </div>
        </footer>
      </div>
  );
}

export default App;
