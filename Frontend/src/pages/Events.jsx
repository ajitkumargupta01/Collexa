import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'all' | 'free'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
        setEvents(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.title?.toLowerCase().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.collegeId?.name?.toLowerCase().includes(q);

    const now = new Date();
    const eDate = new Date(e.date);
    if (tab === 'upcoming') return matchesSearch && eDate >= now;
    if (tab === 'free') return matchesSearch && e.ticketPrice === 0;
    return matchesSearch;
  });

  const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length;

  return (
    <div className="events-page container page-transition">
      {/* Header */}
      <div className="events-hero">
        <h1>Find your next <span className="text-gradient">event</span></h1>
        <p className="events-subtitle">
          Fests, hackathons, cultural shows — all the intercollege stuff happening near you.
        </p>
        <div className="events-search-bar">
          <span className="search-icon">🔍</span>
          <input
            id="events-search"
            type="text"
            placeholder="Search events, colleges, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="events-search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Tabs + count */}
      <div className="events-toolbar">
        <div className="events-tabs">
          {[
            { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
            { key: 'free', label: '🆓 Free only' },
            { key: 'all', label: 'All events' },
          ].map(t => (
            <button
              key={t.key}
              className={`events-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="events-count">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="events-loading">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="events-empty glass">
          <span style={{ fontSize: '2.5rem' }}>🎭</span>
          <h3>{search ? 'Nothing matches that search' : 'No events here yet'}</h3>
          <p>{search ? `Try searching something else, or check all events.` : 'Check back soon — colleges are still posting!'}</p>
          {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear search</button>}
        </div>
      ) : (
        <div className="events-grid-page">
          {filtered.map((evt, idx) => {
            const isPast = new Date(evt.date) < new Date();
            const isRestricted = evt.allowedColleges && evt.allowedColleges.length > 0;
            return (
              <div
                key={evt._id}
                className={`event-card-page glass ${isPast ? 'event-past' : ''}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="event-card-top">
                  <span className={`event-status-pill ${isPast ? 'pill-past' : 'pill-upcoming'}`}>
                    {isPast ? 'Past' : '● Live'}
                  </span>
                  {isRestricted ? (
                    <span className="event-access-pill pill-restricted">🔒 Restricted</span>
                  ) : (
                    <span className="event-access-pill pill-open">🌐 Open</span>
                  )}
                </div>

                <h3 className="event-card-title">{evt.title}</h3>
                <p className="event-card-college">🏛️ {evt.collegeId?.name || 'Unknown College'}</p>

                {evt.description && (
                  <p className="event-card-desc">{evt.description}</p>
                )}

                <div className="event-card-meta">
                  <span>🗓 {new Date(evt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>📍 {evt.location}</span>
                </div>

                <div className="event-card-footer">
                  <div className="event-price-tag">
                    {evt.ticketPrice === 0 ? (
                      <span className="price-free">Free entry</span>
                    ) : (
                      <span className="price-paid">₹{evt.ticketPrice}</span>
                    )}
                  </div>
                  {user ? (
                    <Link to="/dashboard" className="event-card-btn">
                      {user.role === 'student' ? 'Get ticket' : user.role === 'organizer' ? 'Quote this' : 'View'}
                    </Link>
                  ) : (
                    <Link to="/login" className="event-card-btn">Sign in</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Events;
