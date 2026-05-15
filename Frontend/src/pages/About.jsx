import { Link } from 'react-router-dom';
import './About.css';

const ROLES = [
  {
    icon: '🎓',
    role: 'Students',
    color: '#6366f1',
    desc: 'Discover intercollege fests, buy tickets, and participate in events across the city — all in one place.',
    features: ['Browse city-wide events', 'Purchase tickets online', 'Track your registrations', 'Get exclusive college discounts'],
  },
  {
    icon: '🏛️',
    role: 'Colleges',
    color: '#0ea5e9',
    desc: 'Manage your institution\'s events, review vendor quotations, and accept sponsorships effortlessly.',
    features: ['Create & publish events', 'Review service quotations', 'Accept/reject vendors', 'Manage ad sponsorships'],
  },
  {
    icon: '🎪',
    role: 'Organizers',
    color: '#a855f7',
    desc: 'Submit detailed service quotations to colleges for DJs, lighting, decoration, catering and more.',
    features: ['Bid on college events', 'Share itemized charges', 'Track quotation status', 'Build vendor profile'],
  },
  {
    icon: '🏢',
    role: 'Companies',
    color: '#f59e0b',
    desc: 'Reach thousands of students and young professionals by sponsoring intercollege events.',
    features: ['Submit ad requests', 'Set sponsorship budgets', 'Banner placements', 'Brand visibility at fests'],
  },
];

const STATS = [
  { value: '50+', label: 'Colleges Onboarded' },
  { value: '200+', label: 'Events Hosted' },
  { value: '10K+', label: 'Students Reached' },
  { value: '500+', label: 'Vendors Connected' },
];

const About = () => {
  return (
    <div className="about-page page-transition">
      {/* Hero */}
      <section className="about-hero container">
        <div className="about-badge animate-float">🎯 India's #1 Intercollege Event Platform</div>
        <h1 className="about-title">
          Connecting Colleges,<br />
          <span className="text-gradient">Students & Vendors</span>
        </h1>
        <p className="about-subtitle">
          Collexa is a multi-tenant SaaS platform designed to digitize and streamline every aspect of intercollege event management — from creation to vendor onboarding to sponsorships.
        </p>
        <div className="about-cta-row">
          <Link to="/login" className="btn btn-primary lg-btn">Get Started Free</Link>
          <Link to="/events" className="btn btn-secondary lg-btn">Browse Events</Link>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats glass container">
        {STATS.map((s, i) => (
          <div key={i} className="about-stat animate-slide-up" style={{ animationDelay: `${i*80}ms` }}>
            <span className="about-stat-val text-gradient">{s.value}</span>
            <span className="about-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="about-how-it-works container">
        <h2 className="section-center-title">How <span className="text-gradient">Collexa</span> works</h2>
        <p className="section-center-sub">A seamless experience from creation to execution</p>
        <div className="about-steps-grid">
          <div className="about-step-card glass animate-slide-up" style={{ animationDelay: '0ms' }}>
            <span className="about-step-num">01</span>
            <h3>College creates an event</h3>
            <p>Set ticket prices, restrict access to specific colleges, and enable free passes for partner institutes. Define custom quotas, waitlists, and manage multiple sub-events like hackathons and workshops within a single fest.</p>
          </div>
          <div className="about-step-card glass animate-slide-up" style={{ animationDelay: '100ms' }}>
            <span className="about-step-num">02</span>
            <h3>Students register</h3>
            <p>Students browse, buy tickets securely via UPI/Card, and get a unique QR code instantly. No printing, no forms, no mess. Track registrations and manage team formations all in one place.</p>
          </div>
          <div className="about-step-card glass animate-slide-up" style={{ animationDelay: '200ms' }}>
            <span className="about-step-num">03</span>
            <h3>Scan at the gate</h3>
            <p>Staff scan QR codes with a phone camera using our built-in scanner. Each ticket is single-use, preventing fraud. View real-time attendance stats and manage entry seamlessly. Done.</p>
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="about-roles container">
        <h2 className="section-center-title">Built for <span className="text-gradient">Everyone</span></h2>
        <p className="section-center-sub">Every stakeholder gets a purpose-built experience</p>
        <div className="about-roles-grid">
          {ROLES.map((r, i) => (
            <div
              key={r.role}
              className="about-role-card glass animate-slide-up"
              style={{ animationDelay: `${i*100}ms`, '--role-color': r.color }}
            >
              <div className="arc-icon-wrap" style={{ background: `${r.color}18` }}>
                <span style={{ fontSize: '2rem' }}>{r.icon}</span>
              </div>
              <h3 style={{ color: r.color }}>{r.role}</h3>
              <p className="arc-desc">{r.desc}</p>
              <ul className="arc-features">
                {r.features.map((f, fi) => (
                  <li key={fi}><span style={{ color: r.color }}>✓</span> {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="about-cta-banner container">
        <div className="cta-inner glass">
          <h2>Ready to elevate your events?</h2>
          <p>Join thousands of colleges, students, and vendors already on Collexa.</p>
          <Link to="/login" className="btn btn-primary lg-btn" style={{ marginTop: '1.5rem' }}>
            Create Your Account →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
