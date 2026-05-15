import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, ShieldCheck, Calendar } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero container">
        <div className="hero-inner">
          <div className="hero-badge">
            🎉 Built for Meerut's college community
          </div>
          <h1 className="hero-title">
            Your college events,<br />
            <span className="text-gradient">one place.</span>
          </h1>
          <p className="hero-subtitle">
            Collexa helps students find events, colleges manage registrations, and 
            organizers get hired — without the WhatsApp chaos.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn btn-primary lg-btn">
              Get started free <ArrowRight size={17} />
            </Link>
            <Link to="/events" className="btn btn-secondary lg-btn">
              Browse events
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hs-num">100%</span>
              <span className="hs-label">Free to join</span>
            </div>
            <div className="hs-divider" />
            <div className="hero-stat">
              <span className="hs-num">4</span>
              <span className="hs-label">User types</span>
            </div>
            <div className="hs-divider" />
            <div className="hero-stat">
              <span className="hs-num">Live</span>
              <span className="hs-label">QR check-in</span>
            </div>
          </div>
        </div>
      </section>



      {/* Features */}
      <section className="features container">
        <p className="section-eyebrow">What's inside</p>
        <h2 className="section-title">Built for everyone involved</h2>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="icon-wrapper"><Calendar size={22} /></div>
            <h3>For Colleges</h3>
            <p>Create events, set access rules, receive organizer quotes, and validate tickets on the day.</p>
          </div>
          <div className="feature-card glass">
            <div className="icon-wrapper" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
              <Users size={22} />
            </div>
            <h3>For Students</h3>
            <p>Find fests, hackathons, and cultural events. Buy a ticket in under a minute. Show up.</p>
          </div>
          <div className="feature-card glass">
            <div className="icon-wrapper" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
              <Zap size={22} />
            </div>
            <h3>For Organizers</h3>
            <p>Browse college events and send your quote. Negotiate prices. Get hired without cold emails.</p>
          </div>
          <div className="feature-card glass">
            <div className="icon-wrapper" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              <ShieldCheck size={22} />
            </div>
            <h3>For Sponsors</h3>
            <p>Fund events that match your brand. Request ad placements and track your campaigns.</p>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="cta-strip container">
        <div className="cta-box glass">
          <h2>Ready to simplify your next event?</h2>
          <p>Takes about 2 minutes to get set up. No credit card needed.</p>
          <Link to="/login" className="btn btn-primary">
            Create your account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
