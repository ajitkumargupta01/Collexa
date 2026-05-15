import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CollegeDashboard from './pages/CollegeDashboard';
import Events from './pages/Events';
import About from './pages/About';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
