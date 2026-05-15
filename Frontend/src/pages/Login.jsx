import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    icon: '🎓',
    desc: 'Discover & attend events',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.4)',
  },
  {
    key: 'college',
    label: 'College',
    icon: '🏛️',
    desc: 'Manage your institution',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.12)',
    border: 'rgba(14,165,233,0.4)',
  },
  {
    key: 'organizer',
    label: 'Organizer',
    icon: '🎪',
    desc: 'Offer event services',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.4)',
  },
  {
    key: 'company',
    label: 'Company',
    icon: '🏢',
    desc: 'Sponsor & advertise',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
  },
];

const FEATURES = [
  { icon: '📅', text: 'Create & manage intercollege events' },
  { icon: '🎫', text: 'Purchase tickets for city-wide fests' },
  { icon: '💼', text: 'Submit service quotations & bids' },
  { icon: '📢', text: 'Run targeted event sponsorships' },
  { icon: '📊', text: 'Track analytics & event metrics' },
  { icon: '🤝', text: 'Connect colleges with top vendors' },
];

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');
  const [step, setStep] = useState(1); // 1 = role pick, 2 = form (only for register)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentCollegeName: '',
    studentMobileNumber: '',
    collegeDomain: '',
    collegeLocation: '',
    companyWebsite: '',
    organizerSpecialty: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const activeRole = ROLES.find((r) => r.key === selectedRole);

  // Redirect already-logged-in users back to their dashboard
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        if (parsedUser?.role === 'college') navigate('/college-dashboard');
        else navigate('/dashboard');
      } catch { /* invalid JSON — ignore */ }
    }
  }, [navigate]);

  useEffect(() => {
    // Reset step when switching login/register
    setStep(isLogin ? 2 : 1);
    setError('');
    setFormData({ name:'',email:'',password:'',confirmPassword:'',studentCollegeName:'',studentMobileNumber:'',collegeDomain:'',collegeLocation:'',companyWebsite:'',organizerSpecialty:'' });
  }, [isLogin]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
  };

  const handleNextStep = () => {
    setStep(2);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          const role = data.user.role;
          if (role === 'college') navigate('/college-dashboard');
          else navigate('/dashboard');
        }
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        };
        if (selectedRole === 'student') {
          payload.studentDetails = {
            collegeName: formData.studentCollegeName,
            officialEmail: formData.email,
            mobileNumber: formData.studentMobileNumber,
          };
        } else if (selectedRole === 'college') {
          payload.collegeDetails = {
            domain: formData.collegeDomain,
            address: formData.collegeLocation,
          };
        }
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, payload);
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          const role = data.user.role;
          if (role === 'college') navigate('/college-dashboard');
          else navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-icon">🎯</span>
            <span>Collexa</span>
          </Link>
          <h2 className="auth-tagline">
            Where Colleges,<br />
            <span className="auth-gradient-text">Events & Ideas</span><br />
            Come Together.
          </h2>
          <p className="auth-left-sub">
            India's premier intercollege event management platform connecting students, institutions, vendors and sponsors.
          </p>
          <div className="auth-features">
            {FEATURES.map((f, i) => (
              <div className="auth-feature-item" key={i} style={{ animationDelay: `${i * 80}ms` }}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          {/* Toggle */}
          <div className="auth-toggle-group">
            <button
              id="auth-login-tab"
              className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Sign In
            </button>
            <button
              id="auth-register-tab"
              className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {/* Heading */}
          <h3 className="auth-form-title">
            {isLogin
              ? 'Welcome back 👋'
              : step === 1
              ? 'Who are you? 🤔'
              : `Join as ${activeRole?.label} ${activeRole?.icon}`}
          </h3>
          <p className="auth-form-sub">
            {isLogin
              ? 'Sign in to your Collexa account'
              : step === 1
              ? 'Select your role to get started'
              : `Fill in your ${activeRole?.label.toLowerCase()} details below`}
          </p>

          {error && <div className="error-badge">{error}</div>}

          {/* ── STEP 1: Role Picker (Register only) ── */}
          {!isLogin && step === 1 && (
            <div className="role-picker-grid">
              {ROLES.map((role) => (
                <button
                  key={role.key}
                  id={`role-${role.key}`}
                  type="button"
                  className={`role-card ${selectedRole === role.key ? 'selected' : ''}`}
                  onClick={() => handleRoleSelect(role.key)}
                  style={{
                    '--role-color': role.color,
                    '--role-bg': role.bg,
                    '--role-border': role.border,
                    borderColor: selectedRole === role.key ? role.color : 'rgba(255,255,255,0.1)',
                    background: selectedRole === role.key ? role.bg : 'transparent',
                  }}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                  <span className="role-desc">{role.desc}</span>
                  {selectedRole === role.key && (
                    <span className="role-check" style={{ color: role.color }}>✓</span>
                  )}
                </button>
              ))}
              <button
                id="auth-next-btn"
                className="auth-submit-btn"
                type="button"
                onClick={handleNextStep}
                style={{ background: `linear-gradient(135deg, ${activeRole?.color}, ${activeRole?.color}cc)` }}
              >
                Continue as {activeRole?.label} →
              </button>
            </div>
          )}

          {/* ── STEP 2: Form ── */}
          {(isLogin || step === 2) && (
            <form className="auth-form" onSubmit={handleSubmit}>
              {/* Back button on register step 2 */}
              {!isLogin && (
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => setStep(1)}
                >
                  ← Change Role
                </button>
              )}

              {/* Role indicator on register */}
              {!isLogin && (
                <div
                  className="role-selected-badge"
                  style={{ background: activeRole?.bg, borderColor: activeRole?.border, color: activeRole?.color }}
                >
                  {activeRole?.icon} Registering as <strong>{activeRole?.label}</strong>
                </div>
              )}

              {/* Name (register only) */}
              {!isLogin && (
                <div className="auth-field">
                  <label>
                    {selectedRole === 'college' ? 'College / Institution Name' : 'Full Name'} *
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    name="name"
                    className="input-field"
                    placeholder={selectedRole === 'college' ? 'e.g. MIT College of Engineering' : 'Your full name'}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Student college name */}
              {!isLogin && selectedRole === 'student' && (
                <>
                  <div className="auth-field">
                    <label>Your College Name *</label>
                    <input
                      id="auth-college-name"
                      type="text"
                      name="studentCollegeName"
                      className="input-field"
                      placeholder="e.g. Meerut Institute of Engineering and Technology"
                      value={formData.studentCollegeName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>Mobile Number *</label>
                    <input
                      id="auth-mobile-number"
                      type="tel"
                      name="studentMobileNumber"
                      className="input-field"
                      placeholder="e.g. 9876543210"
                      value={formData.studentMobileNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}



              {/* College-specific fields */}
              {!isLogin && selectedRole === 'college' && (
                <>
                  <div className="auth-field">
                    <label>College Domain *</label>
                    <input
                      id="auth-domain"
                      type="text"
                      name="collegeDomain"
                      className="input-field"
                      placeholder="e.g. mitcoe.edu.in"
                      value={formData.collegeDomain}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="auth-field">
                    <label>College Location *</label>
                    <input
                      id="auth-location"
                      type="text"
                      name="collegeLocation"
                      className="input-field"
                      placeholder="e.g. Pune, Maharashtra"
                      value={formData.collegeLocation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {/* Organizer specialty */}
              {!isLogin && selectedRole === 'organizer' && (
                <div className="auth-field">
                  <label>Primary Specialty *</label>
                  <input
                    id="auth-specialty"
                    type="text"
                    name="organizerSpecialty"
                    className="input-field"
                    placeholder="e.g. DJ & Sound, Lighting, Decoration..."
                    value={formData.organizerSpecialty}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              {/* Company website */}
              {!isLogin && selectedRole === 'company' && (
                <div className="auth-field">
                  <label>Company Website</label>
                  <input
                    id="auth-website"
                    type="url"
                    name="companyWebsite"
                    className="input-field"
                    placeholder="https://yourcompany.com"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                  />
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label>Email Address *</label>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="auth-field">
                <label>Password *</label>
                <div className="password-wrapper">
                  <input
                    id="auth-password"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    className="input-field"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Confirm Password (register only) */}
              {!isLogin && (
                <div className="auth-field">
                  <label>Confirm Password *</label>
                  <input
                    id="auth-confirm-pass"
                    type={showPass ? 'text' : 'password'}
                    name="confirmPassword"
                    className="input-field"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {isLogin && (
                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <span className="auth-forgot">Forgot password?</span>
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
                style={
                  !isLogin
                    ? { background: `linear-gradient(135deg, ${activeRole?.color}, ${activeRole?.color}cc)` }
                    : {}
                }
              >
                {loading
                  ? 'Please wait...'
                  : isLogin
                  ? 'Sign In to Collexa'
                  : `Create ${activeRole?.label} Account`}
              </button>

              <p className="auth-switch-text">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Register here' : 'Sign in'}
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
