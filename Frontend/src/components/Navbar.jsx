import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const ROLE_NAV = {
  student: [
    { to: '/events', label: '🎟️ Explore Events' },
    { to: '/dashboard', label: '📊 My Dashboard' },
  ],
  college: [
    { to: '/college-dashboard', label: '🏛️ Admin Panel' },
    { to: '/events', label: '🌐 All Events' },
  ],
  organizer: [
    { to: '/dashboard', label: '📋 My Quotations' },
    { to: '/events', label: '🔍 Browse Events' },
  ],
  company: [
    { to: '/dashboard', label: '📢 Sponsor Portal' },
    { to: '/events', label: '🌐 All Events' },
  ],
};

const ROLE_BADGE = {
  student: { label: 'Student', color: '#6366f1' },
  college: { label: 'College Admin', color: '#0ea5e9' },
  organizer: { label: 'Organizer', color: '#a855f7' },
  company: { label: 'Company', color: '#f59e0b' },
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, [location.pathname]);

  // Also listen for storage changes (e.g. logout from another section)
  useEffect(() => {
    const syncUser = () => {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      else setUser(null);
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = (redirect = '/login') => {
    // If redirect is an event object (from onClick), default to /login
    const target = typeof redirect === 'string' ? redirect : '/login';

    // Clear all auth-related keys
    const uid = user?._id || user?.id;
    if (uid) {
      localStorage.removeItem(`vendor_profile_${uid}`);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    // Dispatch storage event so other tabs/effects pick it up
    window.dispatchEvent(new Event('storage'));

    setUser(null);
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate(target);
  };

  let navLinks = user ? ROLE_NAV[user.role] || [] : [];
  if (user?.role === 'college') {
    navLinks = navLinks.map(lnk => 
      lnk.label.includes('Admin Panel') 
        ? { ...lnk, label: `🏛️ ${user.name || 'Admin Panel'}` } 
        : lnk
    );
  }
  const roleBadge = user ? ROLE_BADGE[user.role] : null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-name">🎯Collexa</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-center">
          {!user && (
            <>
              <Link to="/" className={`nav-link ${isActive('/') ? 'nav-active' : ''}`}>Home</Link>
              <Link to="/events" className={`nav-link ${isActive('/events') ? 'nav-active' : ''}`}>Explore Events</Link>
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'nav-active' : ''}`}>About</Link>
            </>
          )}
          {user && navLinks.map((lnk) => (
            <Link
              key={lnk.to}
              to={lnk.to}
              className={`nav-link ${isActive(lnk.to) ? 'nav-active' : ''}`}
            >
              {lnk.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button
                id="user-menu-btn"
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ '--role-color': roleBadge?.color }}
              >
                <span className="user-avatar-letter">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <div className="user-info">
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span className="user-role-badge" style={{ color: roleBadge?.color }}>
                    {roleBadge?.label}
                  </span>
                </div>
                <span className={`chevron ${userMenuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    <span
                      className="dropdown-role-pill"
                      style={{ background: `${roleBadge?.color}22`, color: roleBadge?.color, borderColor: `${roleBadge?.color}44` }}
                    >
                      {roleBadge?.label}
                    </span>
                  </div>
                  <div className="dropdown-divider" />
                  {navLinks.map((lnk) => (
                    <Link
                      key={lnk.to}
                      to={lnk.to}
                      className="dropdown-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      {lnk.label}
                    </Link>
                  ))}
                  {(user?.role === 'student' || user?.role === 'organizer' || user?.role === 'company') && (
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (user.role === 'student') {
                          navigate('/dashboard', { state: { studentTab: 'profile' } });
                        } else {
                          navigate('/dashboard', { state: { activeTab: 'profile' } });
                        }
                      }}
                    >
                      ⚙️ Edit Profile
                    </button>
                  )}
                  <div className="dropdown-divider" />
                  <button
                    id="logout-btn"
                    className="dropdown-item dropdown-logout"
                    onClick={() => handleLogout()}
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-ghost-nav" id="nav-signin-btn">Sign In</Link>
              <Link to="/login" className="btn-primary-nav" id="nav-register-btn"
                onClick={() => setTimeout(() => {
                  const el = document.getElementById('auth-register-tab');
                  if (el) el.click();
                }, 100)}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            id="hamburger-btn"
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={`mobile-menu ${menuOpen ? 'mobile-open' : ''}`}>
        {!user && (
          <>
            <Link to="/" className="mob-nav-link" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/events" className="mob-nav-link" onClick={() => setMenuOpen(false)}>Explore Events</Link>
            <Link to="/about" className="mob-nav-link" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/login" className="mob-nav-link" onClick={() => setMenuOpen(false)}>Sign In / Register</Link>
          </>
        )}
        {user && (
          <>
            <div className="mob-user-info">
              <span>👤 {user.name}</span>
              <span className="mob-role" style={{ color: roleBadge?.color }}>{roleBadge?.label}</span>
            </div>
            {navLinks.map((lnk) => (
              <Link key={lnk.to} to={lnk.to} className="mob-nav-link" onClick={() => setMenuOpen(false)}>
                {lnk.label}
              </Link>
            ))}
            {(user?.role === 'student' || user?.role === 'organizer' || user?.role === 'company') && (
              <button
                className="mob-nav-link"
                onClick={() => {
                  setMenuOpen(false);
                  if (user.role === 'student') {
                    navigate('/dashboard', { state: { studentTab: 'profile' } });
                  } else {
                    navigate('/dashboard', { state: { activeTab: 'profile' } });
                  }
                }}
              >
                ⚙️ Edit Profile
              </button>
            )}
            <button className="mob-nav-link mob-logout" onClick={() => handleLogout()}>🚪 Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
