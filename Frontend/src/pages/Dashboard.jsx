import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './Dashboard.css';

const SERVICE_TYPES = [
  'DJ & Sound',
  'Lighting',
  'Decoration',
  'Photography/Videography',
  'Catering',
  'Security',
  'Stage Setup',
  'Transportation',
  'Other',
];

const statusColor = (s) => {
  if (s === 'accepted') return '#22c55e';
  if (s === 'rejected') return '#ef4444';
  return '#f59e0b';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'browse');

  // Data
  const [events, setEvents] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vendor Profile (persisted in localStorage)
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    companyName: '',
    email: '',
    address: '',
    website: '',
    gstNumber: '',
    experience: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Quotation modal
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    serviceType: 'DJ & Sound',
    proposedPrice: '',
    planningDetails: '',
    message: '',
  });
  const [serviceCharges, setServiceCharges] = useState([{ item: '', cost: '' }]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // ── Organizer state ───────────────────────────────────────────────────────
  const [quoteFilter, setQuoteFilter] = useState('all');

  // ── Sponsor (company) state ───────────────────────────────────────────────
  const [sponsorTab, setSponsorTab] = useState('overview');
  const [myAds, setMyAds] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]); // for public browser
  const [adForm, setAdForm] = useState({ eventId: '', adTitle: '', adType: 'Banner', budget: '', targetAudience: '', bannerRequirements: '', callToAction: '' });
  const [campaignForm, setCampaignForm] = useState({ title: '', description: '', goalAmount: '', category: 'Cultural', deadline: '', benefits: '' });
  const [adSubmitting, setAdSubmitting] = useState(false);
  const [campSubmitting, setCampSubmitting] = useState(false);
  const [expandedAdId, setExpandedAdId] = useState(null);
  const [editingAd, setEditingAd] = useState(null); // ad being edited
  const [editAdForm, setEditAdForm] = useState({});
  const [editAdSubmitting, setEditAdSubmitting] = useState(false);

  // ── Organizer quotation edit state ────────────────────────────────────────
  const [editingQuote, setEditingQuote] = useState(null);
  const [editQuoteForm, setEditQuoteForm] = useState({});
  const [editQuoteCharges, setEditQuoteCharges] = useState([]);
  const [editQuoteSubmitting, setEditQuoteSubmitting] = useState(false);

  // ── Student state ─────────────────────────────────────────────────────────
  const [studentTab, setStudentTab] = useState('browse');
  const [myTickets, setMyTickets] = useState([]);
  const [buyingEventId, setBuyingEventId] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketRefreshing, setTicketRefreshing] = useState(false);
  const [studentFilters, setStudentFilters] = useState({ upcoming: true, college: 'all' });
  const [selectedStudentEvent, setSelectedStudentEvent] = useState(null);
  const [studentProfile, setStudentProfile] = useState({ name: '', email: '', collegeName: '', mobileNumber: '' });
  const [studentProfileSaved, setStudentProfileSaved] = useState(false);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Load saved vendor profile from DB
    if (parsedUser.vendorDetails) {
      setProfile({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        ...parsedUser.vendorDetails,
      });
      setProfileSaved(true);
    } else {
      // Pre-fill from user account
      setProfile((prev) => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || '',
      }));
    }

    // Load student profile
    if (parsedUser.role === 'student') {
      setStudentProfile({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        collegeName: parsedUser.studentDetails?.collegeName || '',
        mobileNumber: parsedUser.studentDetails?.mobileNumber || '',
      });
      if (parsedUser.studentDetails?.collegeName) setStudentProfileSaved(true);
    }

    // Check for navigation activeTab state changes
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear state so refresh doesn't stick
      window.history.replaceState({}, document.title);
    }

    // Check for studentTab navigation state (e.g. from Navbar "Edit Profile" for student)
    if (location.state?.studentTab) {
      setStudentTab(location.state.studentTab);
      window.history.replaceState({}, document.title);
    }

    const uid = parsedUser._id || parsedUser.id;
    fetchData(uid, parsedUser.role);
  }, [navigate, location.state]);

  const fetchData = async (uid, role) => {
    try {
      setLoading(true);
      const evRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
      setEvents(evRes.data.data || []);

      if (role === 'organizer') {
        const qRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotations/organizer`, { headers: { 'user-id': uid } });
        setMyQuotations(qRes.data.data || []);
      }
      if (role === 'company') {
        const [adRes, campRes, allCampRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/ads/company`, { headers: { 'user-id': uid } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns/company`, { headers: { 'user-id': uid } }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/campaigns`)
        ]);
        setMyAds(adRes.data.data || []);
        setMyCampaigns(campRes.data.data || []);
        setAllCampaigns(allCampRes.data.data || []);
      }
      if (role === 'student') {
        const tRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/my`, { headers: { 'user-id': uid } });
        setMyTickets(tRes.data.data || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Profile ───────────────────────────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: profile.name,
        email: profile.email,
        vendorDetails: {
          companyName: profile.companyName,
          phone: profile.phone,
          address: profile.address,
          experience: profile.experience || '',
        }
      };

      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        // Update user state and local storage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Dispatch storage event so Navbar updates name/email if changed
        window.dispatchEvent(new Event('storage'));
        setProfileSaved(true);
        alert('✅ Profile saved successfully!');
        setActiveTab('browse');
      }
    } catch (err) {
      alert('Failed to save profile: ' + (err.response?.data?.error || err.message));
    }
  };

  // ── Student Profile Save ──────────────────────────────────────────────────
  const handleStudentProfileSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: studentProfile.name,
        email: studentProfile.email,
        studentDetails: {
          collegeName: studentProfile.collegeName,
          mobileNumber: studentProfile.mobileNumber,
        },
      };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('storage'));
        setStudentProfileSaved(true);
        alert('✅ Profile saved successfully!');
        setStudentTab('browse');
      }
    } catch (err) {
      alert('Failed to save profile: ' + (err.response?.data?.error || err.message));
    }
  };

  // ── Quotation Modal ───────────────────────────────────────────────────────
  const openQuote = (evt) => {
    if (!profileSaved) {
      alert('Please complete your Vendor Profile first before submitting a quotation.');
      setActiveTab('profile');
      return;
    }
    setSelectedEvent(evt);
    setQuoteForm({ serviceType: 'DJ & Sound', proposedPrice: '', planningDetails: '', message: '' });
    setServiceCharges([{ item: '', cost: '' }]);
    setShowQuoteModal(true);
  };

  const addChargeLine = () => setServiceCharges([...serviceCharges, { item: '', cost: '' }]);
  const removeChargeLine = (i) => setServiceCharges(serviceCharges.filter((_, idx) => idx !== i));
  const updateCharge = (i, field, val) => {
    const updated = [...serviceCharges];
    updated[i][field] = val;
    setServiceCharges(updated);
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const uid = user._id || user.id;
      const validCharges = serviceCharges
        .filter((c) => c.item.trim() && c.cost)
        .map((c) => ({ item: c.item, cost: Number(c.cost) }));

      const payload = {
        eventId: selectedEvent._id,
        organizerId: uid,
        collegeId: selectedEvent.collegeId?._id || selectedEvent.collegeId,
        serviceType: quoteForm.serviceType,
        proposedPrice: Number(quoteForm.proposedPrice),
        serviceCharges: validCharges,
        planningDetails: quoteForm.planningDetails,
        message: quoteForm.message,
        vendorContact: { ...profile },
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/quotations`, payload);
      if (data.success) {
        setMyQuotations([data.data, ...myQuotations]);
        setShowQuoteModal(false);
        alert('✅ Quotation submitted successfully! The college will review and contact you.');
      }
    } catch (err) {
      alert('Failed to submit quotation: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleWithdrawQuote = async (id) => {
    if (!window.confirm('Withdraw this quotation? This cannot be undone.')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/quotations/${id}`, { headers: { 'user-id': user._id || user.id } });
      setMyQuotations(myQuotations.filter(q => q._id !== id));
    } catch (err) {
      console.error(err); alert('Failed to withdraw quotation.'); }
  };

  const openEditQuote = (q) => {
    setEditingQuote(q);
    setEditQuoteForm({
      serviceType: q.serviceType,
      proposedPrice: q.proposedPrice,
      planningDetails: q.planningDetails || '',
      message: q.message || '',
    });
    setEditQuoteCharges(q.serviceCharges?.length > 0 ? q.serviceCharges.map(c => ({ item: c.item, cost: c.cost })) : [{ item: '', cost: '' }]);
  };

  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    setEditQuoteSubmitting(true);
    try {
      const validCharges = editQuoteCharges
        .filter(c => c.item.trim() && c.cost)
        .map(c => ({ item: c.item, cost: Number(c.cost) }));
      const payload = {
        serviceType: editQuoteForm.serviceType,
        proposedPrice: Number(editQuoteForm.proposedPrice),
        serviceCharges: validCharges,
        planningDetails: editQuoteForm.planningDetails,
        message: editQuoteForm.message,
      };
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/quotations/${editingQuote._id}`, payload);
      if (data.success) {
        setMyQuotations(myQuotations.map(q => q._id === editingQuote._id ? { ...q, ...payload } : q));
        setEditingQuote(null);
        alert('✅ Quotation updated successfully!');
      }
    } catch (err) {
      console.error(err); alert('Failed to update: ' + (err.response?.data?.error || err.message)); }
    finally { setEditQuoteSubmitting(false); }
  };

  // ── Sponsor handlers ───────────────────────────────────────────────────────
  const handleSubmitAd = async (e) => {
    e.preventDefault();
    if (!adForm.eventId) return alert('Please select an event.');
    setAdSubmitting(true);
    try {
      const uid = user._id || user.id;
      const ev = events.find(ev => ev._id === adForm.eventId);
      const payload = { ...adForm, companyId: uid, collegeId: ev?.collegeId?._id || ev?.collegeId, budget: Number(adForm.budget) };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/ads`, payload);
      if (data.success) {
        setMyAds([data.data, ...myAds]);
        setAdForm({ eventId: '', adTitle: '', adType: 'Banner', budget: '', targetAudience: '', bannerRequirements: '', callToAction: '' });
        setSponsorTab('my-ads');
        alert('✅ Advertisement request submitted! The college will review it shortly.');
      }
    } catch (err) {
      console.error(err); alert('Failed: ' + (err.response?.data?.error || err.message)); }
    finally { setAdSubmitting(false); }
  };

  const handleSubmitCampaign = async (e) => {
    e.preventDefault();
    setCampSubmitting(true);
    try {
      const uid = user._id || user.id;
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns`, { ...campaignForm, companyId: uid, goalAmount: Number(campaignForm.goalAmount) });
      if (data.success) {
        setMyCampaigns([data.data, ...myCampaigns]);
        setCampaignForm({ title: '', description: '', goalAmount: '', category: 'Cultural', deadline: '', benefits: '' });
        setSponsorTab('campaigns');
        alert('✅ Fundraising campaign created!');
      }
    } catch (err) {
      console.error(err); alert('Failed: ' + (err.response?.data?.error || err.message)); }
    finally { setCampSubmitting(false); }
  };

  const handleCancelCampaign = async (id) => {
    if (!window.confirm('Cancel this campaign?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/campaigns/${id}`);
      setMyCampaigns(myCampaigns.map(c => c._id === id ? { ...c, status: 'cancelled' } : c));
    } catch { alert('Failed to cancel campaign.'); }
  };

  const openEditAd = (ad) => {
    setEditingAd(ad);
    setEditAdForm({
      adTitle: ad.adTitle || '',
      adType: ad.adType || 'Banner',
      budget: ad.budget || '',
      targetAudience: ad.targetAudience || '',
      bannerRequirements: ad.bannerRequirements || '',
      callToAction: ad.callToAction || '',
    });
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setEditAdSubmitting(true);
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/ads/${editingAd._id}`, editAdForm);
      if (data.success) {
        setMyAds(myAds.map(a => a._id === editingAd._id ? { ...a, ...editAdForm } : a));
        setEditingAd(null);
        alert('✅ Advertisement updated successfully!');
      }
    } catch (err) {
      console.error(err); alert('Failed to update ad: ' + (err.response?.data?.error || err.message)); }
    finally { setEditAdSubmitting(false); }
  };

  const handleUpdateCampaignProgress = async (id, currentRaised, goalAmount) => {
    const amt = prompt(`Enter new total raised amount (Goal: ₹${goalAmount}):`, currentRaised || 0);
    if (amt === null || isNaN(amt)) return;
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/campaigns/${id}`, { raisedAmount: Number(amt) });
      if (data.success) {
        setMyCampaigns(myCampaigns.map(c => c._id === id ? data.data : c));
      }
    } catch (err) {
      console.error(err); alert('Failed to update campaign progress.'); }
  };

  // ── Student handlers ───────────────────────────────────────────────────────
  const handleBuyTicket = async (evt) => {
    const uid = user._id || user.id;
    if (!window.confirm(`Buy ticket for "${evt.title}"? Price: ₹${evt.ticketPrice || 0}`)) return;
    setBuyingEventId(evt._id);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/tickets`, { eventId: evt._id, studentId: uid, pricePaid: evt.ticketPrice || 0 });
      if (data.success) {
        const tRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/my`, { headers: { 'user-id': uid } });
        setMyTickets(tRes.data.data || []);
        setStudentTab('my-tickets');
      }
    } catch (err) {
      console.error(err); alert(err.response?.data?.error || 'Failed to buy ticket.'); }
    finally { setBuyingEventId(null); }
  };

  const refreshTickets = async () => {
    const uid = user._id || user.id;
    setTicketRefreshing(true);
    try {
      const tRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/my`, { headers: { 'user-id': uid } });
      setMyTickets(tRes.data.data || []);
    } catch (err) {
      console.error(err); console.error(err); }
    finally { setTicketRefreshing(false); }
  };



  // ── Render ────────────────────────────────────────────────────────────────
  if (!user) return null;

  const pendingCount = myQuotations.filter((q) => q.status === 'pending').length;
  const acceptedCount = myQuotations.filter((q) => q.status === 'accepted').length;

  const themeClass = {
    student: 'theme-student',
    college: 'theme-college',
    organizer: 'theme-organizer',
    company: 'theme-company',
  }[user.role] || '';

  const roleConfig = {
    student:   { icon: '🎓', label: 'Student Portal',          accent: '#6366f1', banner: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.04))' },
    organizer: { icon: '🎪', label: 'Service Provider Portal',  accent: '#a855f7', banner: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(168,85,247,0.04))' },
    company:   { icon: '🏢', label: 'Sponsor Portal',           accent: '#f59e0b', banner: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.04))' },
  }[user.role] || { icon: '👤', label: 'Dashboard', accent: 'hsl(var(--primary))', banner: 'none' };

  return (
    <div className={`dashboard-container container page-transition ${themeClass}`}>
      {/* Role Banner Strip */}
      <div className="role-banner-strip" style={{ background: roleConfig.banner, borderColor: `${roleConfig.accent}30` }}>
        <span className="rbs-icon">{roleConfig.icon}</span>
        <span className="rbs-label" style={{ color: roleConfig.accent }}>{roleConfig.label}</span>
      </div>

      {/* Header */}
      <div className="dash-header">
        <h1>
          Welcome back, <span className="text-gradient">{user.name}</span>
        </h1>
        <p className="role-badge" style={{ background: `${roleConfig.accent}18`, color: roleConfig.accent, borderColor: `${roleConfig.accent}30` }}>
          {roleConfig.icon} {roleConfig.label}
        </p>
        {profileSaved && (
          <p className="vendor-company-tag">
            🏢 {profile.companyName || 'Your Company'} &nbsp;|&nbsp; 📞 {profile.phone}
          </p>
        )}
      </div>

      {/* Stats Row */}
      {user.role === 'organizer' && (
        <div className="stats-row">
          <div className="stat-card glass">
            <span className="stat-num text-gradient">{myQuotations.length}</span>
            <span className="stat-label">Total Quotations</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-num" style={{ color: '#f59e0b' }}>{pendingCount}</span>
            <span className="stat-label">Pending Review</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-num" style={{ color: '#22c55e' }}>{acceptedCount}</span>
            <span className="stat-label">Accepted</span>
          </div>
          <div className="stat-card glass">
            <span className="stat-num" style={{ color: '#a78bfa' }}>{events.length}</span>
            <span className="stat-label">Open Events</span>
          </div>
        </div>
      )}

      {/* Tabs — only for organizer role */}
      {user.role === 'organizer' && (
        <>
          <div className="dashboard-tabs mt-4">
            <button
              id="tab-browse"
              className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              🔍 Browse Events
            </button>
            <button
              id="tab-quotations"
              className={`tab-btn ${activeTab === 'quotations' ? 'active' : ''}`}
              onClick={() => setActiveTab('quotations')}
            >
              📋 My Quotations{' '}
              {pendingCount > 0 && (
                <span className="tab-badge">{pendingCount}</span>
              )}
            </button>
            <button
              id="tab-profile"
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              👤 Vendor Profile {!profileSaved && <span className="tab-badge warn">!</span>}
            </button>
          </div>

          <div className="mt-4">
            {/* ── BROWSE EVENTS TAB ── */}
            {activeTab === 'browse' && (
              <div className="dash-section glass animate-slide-up">
                <h2>Available Events to Bid On</h2>
                <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Browse upcoming events and submit your service quotation. Colleges will review your proposal and contact you.
                </p>
                {loading ? (
                  <p className="text-center mt-4">Loading events...</p>
                ) : events.length === 0 ? (
                  <p className="text-muted mt-4">No events are currently scheduled. Check back later!</p>
                ) : (
                  <div className="events-grid mt-4">
                    {events.map((evt) => (
                      <div key={evt._id} className="event-item-vendor card-hover p-4 rounded">
                        <div className="event-header-row">
                          <div>
                            <h3 className="event-title">{evt.title}</h3>
                            <p className="event-meta">
                              🏛️ {evt.collegeId?.name || 'Unknown College'}
                            </p>
                            <p className="event-meta">
                              🗓️ {new Date(evt.date).toDateString()} &nbsp;|&nbsp; 📍 {evt.location}
                            </p>
                            {evt.description && (
                              <p className="event-desc">{evt.description}</p>
                            )}
                          </div>
                          <button
                            id={`quote-btn-${evt._id}`}
                            className="btn btn-primary"
                            onClick={() => openQuote(evt)}
                          >
                            Submit Quotation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── MY QUOTATIONS TAB ── */}
            {activeTab === 'quotations' && (
              <div className="dash-section glass animate-slide-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2>My Submitted Quotations</h2>
                  <select
                    className="input-field"
                    style={{ maxWidth: '200px' }}
                    value={quoteFilter}
                    onChange={(e) => setQuoteFilter(e.target.value)}
                  >
                    <option value="all">All Quotations</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                {loading ? (
                  <p className="mt-4">Loading...</p>
                ) : myQuotations.length === 0 ? (
                  <div className="empty-state mt-4">
                    <p>📭 You haven't submitted any quotations yet.</p>
                    <button
                      className="btn btn-primary mt-4"
                      onClick={() => setActiveTab('browse')}
                    >
                      Browse Events to Bid
                    </button>
                  </div>
                ) : (
                  <div className="quotations-list mt-4">
                    {myQuotations.filter(q => quoteFilter === 'all' || q.status === quoteFilter).map((q) => (
                      <div key={q._id} className="quotation-card glass">
                        <div className="q-top-row">
                          <div>
                            <h3 className="q-event-title">
                              {q.eventId?.title || 'Unknown Event'}
                            </h3>
                            <p className="q-meta">
                              🏛️ {q.collegeId?.name || 'Unknown College'} &nbsp;|&nbsp;
                              🗓️ {q.eventId?.date ? new Date(q.eventId.date).toDateString() : '—'}
                            </p>
                            <p className="q-meta">📍 {q.eventId?.location || '—'}</p>
                          </div>
                          <div className="q-price-status">
                            <span className="q-price">₹{q.proposedPrice?.toLocaleString()}</span>
                            <span
                              className="q-status-badge"
                              style={{ background: statusColor(q.status) }}
                            >
                              {q.status.toUpperCase()}
                            </span>
                            {q.status === 'pending' && (
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                                 <button onClick={() => openEditQuote(q)} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '100%' }}>
                                   ✏️ Edit
                                 </button>
                                 <button onClick={() => handleWithdrawQuote(q._id)} className="btn btn-danger-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', width: '100%' }}>
                                   Withdraw
                                 </button>
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="q-detail-grid">
                          <div className="q-detail-item">
                            <span className="q-detail-label">Service</span>
                            <span className="q-detail-value service-badge">
                              {q.serviceType}
                            </span>
                          </div>
                          <div className="q-detail-item">
                            <span className="q-detail-label">Submitted</span>
                            <span className="q-detail-value">
                              {new Date(q.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {q.vendorContact?.companyName && (
                            <div className="q-detail-item">
                              <span className="q-detail-label">Company</span>
                              <span className="q-detail-value">{q.vendorContact.companyName}</span>
                            </div>
                          )}
                        </div>

                        {q.serviceCharges && q.serviceCharges.length > 0 && (
                          <div className="q-charges">
                            <p className="q-detail-label mb-1">💰 Service Charges Breakdown</p>
                            {q.serviceCharges.map((c, i) => (
                              <div key={i} className="charge-row">
                                <span>{c.item}</span>
                                <span>₹{Number(c.cost).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.message && (
                          <p className="q-message">
                            💬 "{q.message}"
                          </p>
                        )}

                        {q.status === 'accepted' && (
                          <div className="q-acceptance-note">
                            ✅ Congratulations! Your quotation was accepted. The college admin will reach out at{' '}
                            <strong>{q.vendorContact?.email}</strong> or{' '}
                            <strong>{q.vendorContact?.phone}</strong>.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── VENDOR PROFILE TAB ── */}
            {activeTab === 'profile' && (
              <div className="dash-section glass animate-slide-up">
                <h2>Vendor / Service Provider Profile</h2>
                <p className="text-muted" style={{ marginTop: '0.35rem', fontSize: '0.9rem' }}>
                  Fill in your contact and company details. This information will be shared with colleges when you submit a quotation.
                </p>

                <form className="vendor-profile-form mt-4" onSubmit={handleProfileSave}>
                  <div className="form-two-col">
                    <div className="form-group">
                      <label>Contact Person Name *</label>
                      <input
                        id="vendor-name"
                        type="text"
                        className="input-field"
                        placeholder="Your full name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        id="vendor-phone"
                        type="tel"
                        className="input-field"
                        placeholder="+91 98765 43210"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-two-col">
                    <div className="form-group">
                      <label>Company / Business Name *</label>
                      <input
                        id="vendor-company"
                        type="text"
                        className="input-field"
                        placeholder="e.g. SoundBlast Events Pvt. Ltd."
                        value={profile.companyName}
                        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Email *</label>
                      <input
                        id="vendor-email"
                        type="email"
                        className="input-field"
                        placeholder="contact@yourbusiness.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Business Address *</label>
                    <textarea
                      id="vendor-address"
                      className="input-field"
                      rows="2"
                      placeholder="Shop #12, MG Road, Pune, Maharashtra - 411001"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-two-col">
                    <div className="form-group">
                      <label>Website (Optional)</label>
                      <input
                        id="vendor-website"
                        type="url"
                        className="input-field"
                        placeholder="https://yourwebsite.com"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>GST / Tax ID (Optional)</label>
                      <input
                        id="vendor-gst"
                        type="text"
                        className="input-field"
                        placeholder="27ABCDE1234F1Z5"
                        value={profile.gstNumber}
                        onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Years of Experience & Specialization</label>
                    <textarea
                      id="vendor-experience"
                      className="input-field"
                      rows="2"
                      placeholder="e.g. 8 years experience in college festivals, corporate events, and weddings. Speciality: LED stage lighting & DJ setups."
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    />
                  </div>

                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', width: '100%' }}
                  >
                    💾 Save Profile & Continue
                  </button>
                </form>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── STUDENT DASHBOARD ── */}
      {user.role === 'student' && (
        <div className="dash-content">
          {/* Student Stats */}
          <div className="stats-row" style={{marginTop:'1.5rem'}}>
            <div className="stat-card glass"><span className="stat-num text-gradient">{events.filter(e=>new Date(e.date)>new Date()).length}</span><span className="stat-label">Upcoming Events</span></div>
            <div className="stat-card glass"><span className="stat-num" style={{color:'#22c55e'}}>{myTickets.filter(t=>!t.isUsed&&t.status==='active').length}</span><span className="stat-label">Active Tickets</span></div>
            <div className="stat-card glass"><span className="stat-num" style={{color:'#6366f1'}}>{myTickets.length}</span><span className="stat-label">Total Tickets</span></div>
            <div className="stat-card glass"><span className="stat-num" style={{color:'#f59e0b'}}>₹{myTickets.reduce((s,t)=>s+(t.pricePaid||0),0).toLocaleString()}</span><span className="stat-label">Total Spent</span></div>
          </div>

          <div className="dashboard-tabs mt-4">
            <button className={`tab-btn ${studentTab==='browse'?'active':''}`} onClick={()=>setStudentTab('browse')}>🔍 Browse Events</button>
            <button className={`tab-btn ${studentTab==='my-tickets'?'active':''}`} onClick={()=>setStudentTab('my-tickets')}>🎫 My Tickets {myTickets.length>0&&<span className="tab-badge">{myTickets.filter(t=>!t.isUsed&&t.status==='active').length}</span>}</button>
            <button id="tab-student-profile" className={`tab-btn ${studentTab==='profile'?'active':''}`} onClick={()=>setStudentTab('profile')}>👤 My Profile {!studentProfileSaved&&<span className="tab-badge warn">!</span>}</button>
          </div>

          {studentTab==='browse' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'1rem'}}>
                <div>
                  <h2>🎪 Available Events</h2>
                  <p className="text-muted" style={{marginTop:'0.25rem',fontSize:'0.9rem'}}>Browse and purchase tickets for upcoming college events.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select
                    className="input-field"
                    style={{ maxWidth: '150px' }}
                    value={studentFilters.college}
                    onChange={(e) => setStudentFilters({ ...studentFilters, college: e.target.value })}
                  >
                    <option value="all">All Colleges</option>
                    {[...new Set(events.map(e => e.collegeId?.name).filter(Boolean))].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: '#ccc' }}>
                    <input type="checkbox" checked={studentFilters.upcoming} onChange={(e) => setStudentFilters({ ...studentFilters, upcoming: e.target.checked })} />
                    Upcoming Only
                  </label>
                  <input
                    className="input-field"
                    style={{maxWidth:'200px'}}
                    placeholder="🔍 Search events..."
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {loading ? <p className="mt-4 text-center">Loading events...</p> : (
                <div className="events-grid mt-4">
                  {events
                    .filter(evt => {
                      if (studentFilters.upcoming && new Date(evt.date) < new Date()) return false;
                      if (studentFilters.college !== 'all' && evt.collegeId?.name !== studentFilters.college) return false;
                      if (searchQuery && !evt.title.toLowerCase().includes(searchQuery.toLowerCase()) && !evt.location.toLowerCase().includes(searchQuery.toLowerCase()) && !evt.collegeId?.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    })
                    .map(evt => {
                      const isPast = new Date(evt.date) < new Date();
                      const alreadyOwned = myTickets.some(t => (t.eventId?._id||t.eventId)===evt._id && (t.status==='active'&&!t.isUsed));
                      const daysLeft = Math.ceil((new Date(evt.date)-new Date())/86400000);
                      return (
                        <div key={evt._id} className={`event-item-vendor card-hover p-4 rounded ${isPast?'event-item-past':''}`}>
                          <div className="event-header-row">
                            <div style={{flex:1}}>
                              <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                                <h3 className="event-title">{evt.title}</h3>
                                {!isPast&&daysLeft<=7&&<span style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',borderRadius:'9999px',background:'rgba(239,68,68,0.15)',color:'#ef4444',fontWeight:700}}>🔥 {daysLeft}d left</span>}
                              </div>
                              <p className="event-meta">🏛️ {evt.collegeId?.name||'Unknown College'}</p>
                              <p className="event-meta">🗓️ {new Date(evt.date).toDateString()} &nbsp;|&nbsp; 📍 {evt.location}</p>
                              {evt.description && <p className="event-desc">{evt.description}</p>}
                              {evt.vipPrice>0 && <p className="event-meta" style={{color:'#a855f7'}}>👑 VIP: ₹{evt.vipPrice} &nbsp;|&nbsp; 🐦 Early Bird: ₹{evt.earlyBirdPrice||'—'}</p>}
                            </div>
                            <div className="q-price-status">
                              <span style={{fontWeight:700,fontSize:'1.15rem',color:evt.ticketPrice===0?'#22c55e':'hsl(var(--secondary))'}}>{evt.ticketPrice===0?'🎁 FREE':`🎫 ₹${evt.ticketPrice}`}</span>
                              <span style={{fontSize:'0.75rem',padding:'0.2rem 0.6rem',borderRadius:'9999px',background:isPast?'rgba(107,114,128,0.2)':'rgba(34,197,94,0.15)',color:isPast?'#9ca3af':'#22c55e',fontWeight:600}}>{isPast?'Past Event':'Upcoming'}</span>
                              {!isPast && (alreadyOwned
                                ? <><span style={{fontSize:'0.78rem',color:'#22c55e',fontWeight:700}}>✅ Ticket Owned</span><button className="btn btn-cancel" style={{fontSize:'0.75rem',padding:'0.3rem 0.8rem'}} onClick={()=>{const tk=myTickets.find(t=>(t.eventId?._id||t.eventId)===evt._id);if(tk)setShowQR(tk);}}>📱 Show QR</button></>
                                : <div className="event-actions-row"><button className="btn btn-secondary" style={{fontSize:'0.85rem',padding:'0.45rem 0.75rem'}} onClick={()=>setSelectedStudentEvent(evt)}>ℹ️ Info</button><button id={`buy-${evt._id}`} className="btn btn-primary" style={{fontSize:'0.85rem',padding:'0.45rem 1.1rem'}} onClick={()=>handleBuyTicket(evt)} disabled={buyingEventId===evt._id}>{buyingEventId===evt._id?'⏳ Buying...':'🎫 Buy Ticket'}</button></div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                  {events.filter(evt => {
                    if (studentFilters.upcoming && new Date(evt.date) < new Date()) return false;
                    if (studentFilters.college !== 'all' && evt.collegeId?.name !== studentFilters.college) return false;
                    if (searchQuery && !evt.title.toLowerCase().includes(searchQuery.toLowerCase()) && !evt.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                    return true;
                  }).length===0 && <p className="text-muted">No events match your filters.</p>}
                </div>
              )}
            </div>
          )}

          {studentTab==='my-tickets' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
                <h2>🎫 My Tickets</h2>
                <button className="btn btn-cancel" style={{fontSize:'0.82rem',padding:'0.4rem 1rem'}} onClick={refreshTickets} disabled={ticketRefreshing}>{ticketRefreshing?'⏳ Refreshing...':'🔄 Refresh'}</button>
              </div>
              {myTickets.length===0 ? (
                <div className="empty-state mt-4">
                  <p style={{fontSize:'2rem'}}>🎟️</p>
                  <p style={{marginTop:'0.5rem'}}>No tickets yet. Browse events to buy your first ticket!</p>
                  <button className="btn btn-primary mt-4" onClick={()=>setStudentTab('browse')}>Browse Events</button>
                </div>
              ) : (
                <>
                  <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginTop:'1rem'}}>
                    <span style={{fontSize:'0.8rem',padding:'0.2rem 0.7rem',borderRadius:'9999px',background:'rgba(34,197,94,0.12)',color:'#22c55e',fontWeight:600}}>🟢 Available: {myTickets.filter(t=>!t.isUsed&&t.status!=='cancelled'&&!(t.eventId?.date&&new Date(t.eventId.date)<new Date())).length}</span>
                    <span style={{fontSize:'0.8rem',padding:'0.2rem 0.7rem',borderRadius:'9999px',background:'rgba(168,85,247,0.12)',color:'#a855f7',fontWeight:600}}>✅ Used: {myTickets.filter(t=>t.isUsed||t.status==='used').length}</span>
                    <span style={{fontSize:'0.8rem',padding:'0.2rem 0.7rem',borderRadius:'9999px',background:'rgba(245,158,11,0.12)',color:'#f59e0b',fontWeight:600}}>⏰ Expired: {myTickets.filter(t=>!t.isUsed&&t.status!=='cancelled'&&t.eventId?.date&&new Date(t.eventId.date)<new Date()).length}</span>
                    <span style={{fontSize:'0.8rem',padding:'0.2rem 0.7rem',borderRadius:'9999px',background:'rgba(107,114,128,0.12)',color:'#9ca3af',fontWeight:600}}>📦 Total: {myTickets.length}</span>
                  </div>
                  <div className="events-grid mt-4">
                    {myTickets.map(tk => {
                      const evt = tk.eventId;
                      const eventDate = evt?.date ? new Date(evt.date) : null;
                      const isExpired = eventDate && eventDate < new Date() && !tk.isUsed;
                      const isUsed = tk.isUsed || tk.status === 'used';
                      const isCancelled = tk.status === 'cancelled';
                      // Determine display status
                      let statusClr, statusLbl, statusIcon;
                      if (isUsed) {
                        statusClr = '#a855f7'; statusLbl = 'Used'; statusIcon = '✅';
                      } else if (isCancelled) {
                        statusClr = '#6b7280'; statusLbl = 'Cancelled'; statusIcon = '❌';
                      } else if (isExpired) {
                        statusClr = '#f59e0b'; statusLbl = 'Expired'; statusIcon = '⏰';
                      } else {
                        statusClr = '#22c55e'; statusLbl = 'Available'; statusIcon = '🟢';
                      }
                      return (
                        <div key={tk._id} className="event-item-vendor p-4 rounded" style={{borderLeft:`4px solid ${statusClr}`,opacity:(isUsed||isCancelled||isExpired)?0.75:1}}>
                          <div className="event-header-row">
                            <div style={{flex:1}}>
                              <h3 className="event-title">{evt?.title||'Event'}</h3>
                              <p className="event-meta">🏛️ {evt?.collegeId?.name||'College'}</p>
                              <p className="event-meta">🗓️ {eventDate?eventDate.toDateString():'—'} &nbsp;|&nbsp; 📍 {evt?.location||'—'}</p>
                              <p className="event-meta">💰 Paid: <strong>₹{tk.pricePaid}</strong> &nbsp;|&nbsp; 🗂️ Purchased: {new Date(tk.purchaseDate).toLocaleDateString()}</p>
                              {isUsed && tk.scannedAt && <p className="event-meta" style={{color:'#a855f7'}}>🔍 Scanned at entry: {new Date(tk.scannedAt).toLocaleString()}</p>}
                              {/* Status Badge */}
                              <span style={{
                                display:'inline-flex',alignItems:'center',gap:'0.3rem',
                                marginTop:'0.5rem',padding:'0.25rem 0.85rem',
                                borderRadius:'9999px',fontSize:'0.78rem',fontWeight:700,
                                background:`${statusClr}22`,color:statusClr,
                                border:`1px solid ${statusClr}55`
                              }}>{statusIcon} {statusLbl}</span>
                            </div>
                            <div className="q-price-status">
                              {!isUsed && !isCancelled && !isExpired && (
                                <button className="btn btn-primary" style={{fontSize:'0.82rem',padding:'0.45rem 1rem'}} onClick={()=>setShowQR(tk)}>📱 Show QR</button>
                              )}
                              {isUsed && <p style={{fontSize:'0.75rem',color:'#a855f7',textAlign:'right',fontWeight:600}}>Entry Validated<br/>{tk.scannedAt?new Date(tk.scannedAt).toLocaleDateString():'—'}</p>}
                              {isExpired && <p style={{fontSize:'0.75rem',color:'#f59e0b',textAlign:'right',fontWeight:600}}>Event ended<br/>{eventDate.toLocaleDateString()}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STUDENT PROFILE TAB ── */}
          {studentTab==='profile' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>👤 Student Profile</h2>
              <p className="text-muted" style={{marginTop:'0.35rem',fontSize:'0.9rem'}}>
                Keep your profile up to date. Your details help colleges identify and reach you.
              </p>
              <form className="vendor-profile-form mt-4" onSubmit={handleStudentProfileSave}>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      id="student-name"
                      type="text"
                      className="input-field"
                      placeholder="Your full name"
                      value={studentProfile.name}
                      onChange={e=>setStudentProfile({...studentProfile,name:e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Email *</label>
                    <input
                      id="student-email"
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                      value={studentProfile.email}
                      onChange={e=>setStudentProfile({...studentProfile,email:e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>College / University Name</label>
                    <input
                      id="student-college"
                      type="text"
                      className="input-field"
                      placeholder="e.g. IIT Delhi, Symbiosis Pune"
                      value={studentProfile.collegeName}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      id="student-mobile"
                      type="tel"
                      className="input-field"
                      placeholder="e.g. 9876543210"
                      value={studentProfile.mobileNumber}
                      onChange={e=>setStudentProfile({...studentProfile,mobileNumber:e.target.value})}
                    />
                  </div>
                </div>
                <button
                  id="save-student-profile-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{marginTop:'0.5rem',width:'100%'}}
                >
                  💾 Save Profile
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* ── SPONSOR DASHBOARD ── */}
      {user.role === 'company' && (
        <div className="dash-content">
          <div className="dashboard-tabs mt-4">
            <button className={`tab-btn ${sponsorTab==='overview'?'active':''}`} onClick={()=>setSponsorTab('overview')}>🏠 Overview</button>
            <button className={`tab-btn ${sponsorTab==='public-campaigns'?'active':''}`} onClick={()=>setSponsorTab('public-campaigns')}>🌐 Browse Campaigns</button>
            <button className={`tab-btn ${sponsorTab==='create-ad'?'active':''}`} onClick={()=>setSponsorTab('create-ad')}>📢 Create Ad</button>
            <button className={`tab-btn ${sponsorTab==='my-ads'?'active':''}`} onClick={()=>setSponsorTab('my-ads')}>📋 My Ads {myAds.length>0&&<span className="tab-badge">{myAds.length}</span>}</button>
            <button className={`tab-btn ${sponsorTab==='raise-fund'?'active':''}`} onClick={()=>setSponsorTab('raise-fund')}>💰 Raise Funds</button>
            <button className={`tab-btn ${sponsorTab==='campaigns'?'active':''}`} onClick={()=>setSponsorTab('campaigns')}>📊 Campaigns {myCampaigns.length>0&&<span className="tab-badge">{myCampaigns.length}</span>}</button>
            <button id="tab-company-profile" className={`tab-btn ${sponsorTab==='profile'?'active':''}`} onClick={()=>setSponsorTab('profile')}>👤 My Profile {!profileSaved&&<span className="tab-badge warn">!</span>}</button>
          </div>

          {sponsorTab==='overview' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>🏢 Sponsor Overview</h2>
              <p className="text-muted" style={{marginTop:'0.5rem',fontSize:'0.9rem'}}>Manage your advertisements and fundraising campaigns across Meerut colleges.</p>
              <div className="stats-row mt-4">
                <div className="stat-card glass"><span className="stat-num text-gradient">{myAds.length}</span><span className="stat-label">Ad Requests</span></div>
                <div className="stat-card glass"><span className="stat-num" style={{color:'#22c55e'}}>{myAds.filter(a=>a.status==='accepted').length}</span><span className="stat-label">Approved Ads</span></div>
                <div className="stat-card glass"><span className="stat-num" style={{color:'#f59e0b'}}>{myCampaigns.length}</span><span className="stat-label">Campaigns</span></div>
                <div className="stat-card glass"><span className="stat-num" style={{color:'#a78bfa'}}>₹{myCampaigns.reduce((s,c)=>s+(c.raisedAmount||0),0).toLocaleString()}</span><span className="stat-label">Funds Raised</span></div>
              </div>
              <div style={{display:'flex',gap:'1rem',marginTop:'2rem',flexWrap:'wrap'}}>
                <button className="btn btn-primary" onClick={()=>setSponsorTab('create-ad')}>📢 Create Advertisement</button>
                <button className="btn btn-primary" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}} onClick={()=>setSponsorTab('raise-fund')}>💰 Launch Campaign</button>
              </div>
            </div>
          )}

          {sponsorTab==='public-campaigns' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>🌐 Browse Public Campaigns</h2>
              <p className="text-muted" style={{marginTop:'0.5rem',fontSize:'0.9rem'}}>See what other companies are doing and get inspiration for your own sponsorships.</p>
              {allCampaigns.length===0 ? (
                <p className="mt-4 text-muted">No public campaigns found.</p>
              ) : (
                <div className="events-grid mt-4">
                  {allCampaigns.map(c => {
                    const pct = c.goalAmount>0?Math.min(100,Math.round((c.raisedAmount||0)/c.goalAmount*100)):0;
                    return (
                      <div key={c._id} className="event-item-vendor card-hover p-4 rounded" style={{borderLeft:'4px solid #3b82f6'}}>
                        <h3 className="font-bold">{c.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">🏢 {c.companyId?.name||'Unknown Company'} &nbsp;|&nbsp; 📂 {c.category}</p>
                        <p className="text-sm mt-2">{c.description}</p>
                        <div style={{marginTop:'0.75rem'}}>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:'0.3rem'}}>
                            <span>Raised: <strong>₹{(c.raisedAmount||0).toLocaleString()}</strong></span>
                            <span>Goal: <strong>₹{c.goalAmount.toLocaleString()}</strong></span>
                          </div>
                          <div style={{background:'rgba(255,255,255,0.1)',borderRadius:'9999px',height:'8px',overflow:'hidden'}}>
                            <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#3b82f6,#2563eb)',borderRadius:'9999px'}}/>
                          </div>
                          <p style={{fontSize:'0.75rem',color:'#3b82f6',marginTop:'0.25rem',fontWeight:700}}>{pct}% funded</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {sponsorTab==='create-ad' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>📢 Create Advertisement</h2>
              <p className="text-muted" style={{marginTop:'0.5rem',fontSize:'0.9rem'}}>Submit an ad request for a college event. The college admin will approve and display your ad.</p>
              <form onSubmit={handleSubmitAd} className="vendor-profile-form mt-4">
                <div className="form-group">
                  <label>Select Event *</label>
                  <select id="ad-event" className="input-field" value={adForm.eventId} onChange={e=>setAdForm({...adForm,eventId:e.target.value})} required>
                    <option value="">— Choose an upcoming event —</option>
                    {events.filter(ev=>new Date(ev.date)>new Date()).map(ev=>(
                      <option key={ev._id} value={ev._id}>{ev.title} — {ev.collegeId?.name||'College'} ({new Date(ev.date).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Ad Title *</label>
                    <input id="ad-title" className="input-field" placeholder="e.g. TechBrand at Fest 2025" value={adForm.adTitle} onChange={e=>setAdForm({...adForm,adTitle:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Ad Type *</label>
                    <select className="input-field" value={adForm.adType} onChange={e=>setAdForm({...adForm,adType:e.target.value})}>
                      {['Banner','Stage Backdrop','LED Screen','Social Media','Pamphlet','Stall','Merchandise','Other'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Budget (₹) *</label>
                    <input id="ad-budget" type="number" min="0" className="input-field" placeholder="e.g. 50000" value={adForm.budget} onChange={e=>setAdForm({...adForm,budget:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Target Audience</label>
                    <input className="input-field" placeholder="e.g. Engineering students, age 18-25" value={adForm.targetAudience} onChange={e=>setAdForm({...adForm,targetAudience:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Banner / Creative Requirements *</label>
                  <textarea className="input-field" rows="3" placeholder="Describe your banner size, design specs, placement preferences, any special requirements..." value={adForm.bannerRequirements} onChange={e=>setAdForm({...adForm,bannerRequirements:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Call to Action</label>
                  <input className="input-field" placeholder="e.g. Visit our stall, Scan QR for 20% off, Follow us @brand" value={adForm.callToAction} onChange={e=>setAdForm({...adForm,callToAction:e.target.value})} />
                </div>
                <button id="submit-ad-btn" type="submit" className="btn btn-primary" disabled={adSubmitting} style={{marginTop:'0.5rem'}}>
                  {adSubmitting?'Submitting...':'🚀 Submit Ad Request'}
                </button>
              </form>
            </div>
          )}

          {sponsorTab==='my-ads' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>📋 My Advertisement Requests</h2>
              {myAds.length===0 ? (
                <div className="empty-state mt-4"><p>📭 No ad requests yet.</p><button className="btn btn-primary mt-4" onClick={()=>setSponsorTab('create-ad')}>Create Your First Ad</button></div>
              ) : (
                <div className="quotations-list mt-4">
                  {myAds.map(ad=>{
                    const isExpanded = expandedAdId === ad._id;
                    return (
                      <div key={ad._id} className="quotation-card glass">
                        <div className="q-top-row" onClick={() => setExpandedAdId(isExpanded ? null : ad._id)} style={{ cursor: 'pointer' }}>
                          <div>
                            <h3 className="q-event-title">{ad.adTitle||'Advertisement'}</h3>
                            <p className="q-meta">🎪 {ad.eventId?.title||'Event'} &nbsp;|&nbsp; 🏛️ {ad.collegeId?.name||'College'}</p>
                            <p className="q-meta">📅 {ad.eventId?.date?new Date(ad.eventId.date).toDateString():'—'}</p>
                          </div>
                          <div className="q-price-status">
                            <span className="q-price">₹{Number(ad.budget).toLocaleString()}</span>
                            <span className="q-status-badge" style={{background:statusColor(ad.status)}}>{(ad.status||'pending').toUpperCase()}</span>
                            <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem', color: '#6b7280' }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="p-4 bg-black/20 rounded-lg mt-2 text-sm border border-white/5 animate-slide-down">
                            {ad.adType && <p className="mb-2"><span className="text-gray-400">Ad Type:</span> <span className="font-bold">{ad.adType}</span></p>}
                            {ad.targetAudience && <p className="mb-2"><span className="text-gray-400">Target Audience:</span> {ad.targetAudience}</p>}
                            {ad.bannerRequirements && <p className="mb-2"><span className="text-gray-400">Requirements:</span> {ad.bannerRequirements}</p>}
                            {ad.callToAction && <p className="mb-2"><span className="text-gray-400">Call to Action:</span> {ad.callToAction}</p>}
                             {ad.status === 'pending' && (
                               <button
                                 className="btn btn-secondary mt-2"
                                 style={{ fontSize: '0.82rem', padding: '0.35rem 0.8rem' }}
                                 onClick={(e) => { e.stopPropagation(); openEditAd(ad); }}
                               >
                                 ✏️ Edit Ad Request
                               </button>
                             )}
                            {ad.status === 'accepted' && <p className="mt-4 text-green-400 bg-green-400/10 p-2 rounded">✅ Accepted! The college will contact you for materials.</p>}
                            {ad.status === 'rejected' && <p className="mt-4 text-red-400 bg-red-400/10 p-2 rounded">❌ Rejected. Please submit a new request if needed.</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {sponsorTab==='raise-fund' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>💰 Launch Fundraising Campaign</h2>
              <p className="text-muted" style={{marginTop:'0.5rem',fontSize:'0.9rem'}}>Create a fundraising campaign to support college events and build brand recognition.</p>
              <form onSubmit={handleSubmitCampaign} className="vendor-profile-form mt-4">
                <div className="form-group">
                  <label>Campaign Title *</label>
                  <input id="camp-title" className="input-field" placeholder="e.g. TechBrand Engineering Fest Sponsorship 2025" value={campaignForm.title} onChange={e=>setCampaignForm({...campaignForm,title:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Campaign Description *</label>
                  <textarea className="input-field" rows="3" placeholder="Describe the purpose of this campaign, what you aim to fund, and what impact it will have..." value={campaignForm.description} onChange={e=>setCampaignForm({...campaignForm,description:e.target.value})} required />
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Fundraising Goal (₹) *</label>
                    <input id="camp-goal" type="number" min="1" className="input-field" placeholder="e.g. 500000" value={campaignForm.goalAmount} onChange={e=>setCampaignForm({...campaignForm,goalAmount:e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="input-field" value={campaignForm.category} onChange={e=>setCampaignForm({...campaignForm,category:e.target.value})}>
                      {['Education','Sports','Cultural','Tech','Social Cause','Infrastructure','Other'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Campaign Deadline *</label>
                  <input id="camp-deadline" type="date" className="input-field" value={campaignForm.deadline} onChange={e=>setCampaignForm({...campaignForm,deadline:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Sponsor Benefits</label>
                  <textarea className="input-field" rows="2" placeholder="What do you offer in return? e.g. Logo on banners, social media mentions, stall at event, certificate of recognition..." value={campaignForm.benefits} onChange={e=>setCampaignForm({...campaignForm,benefits:e.target.value})} />
                </div>
                <button id="submit-camp-btn" type="submit" className="btn btn-primary" disabled={campSubmitting} style={{marginTop:'0.5rem',background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>
                  {campSubmitting?'Creating...':'🚀 Launch Campaign'}
                </button>
              </form>
            </div>
          )}

          {sponsorTab==='campaigns' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>📊 My Campaigns</h2>
              {myCampaigns.length===0 ? (
                <div className="empty-state mt-4"><p>📭 No campaigns yet.</p><button className="btn btn-primary mt-4" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)'}} onClick={()=>setSponsorTab('raise-fund')}>Launch Your First Campaign</button></div>
              ) : (
                <div className="quotations-list mt-4">
                  {myCampaigns.map(c=>{
                    const pct = c.goalAmount>0?Math.min(100,Math.round((c.raisedAmount||0)/c.goalAmount*100)):0;
                    return (
                      <div key={c._id} className="quotation-card glass">
                        <div className="q-top-row">
                          <div style={{flex:1}}>
                            <h3 className="q-event-title">{c.title}</h3>
                            <p className="q-meta">📂 {c.category} &nbsp;|&nbsp; ⏰ Deadline: {new Date(c.deadline).toLocaleDateString()}</p>
                            <p className="q-message">{c.description}</p>
                            <div style={{marginTop:'0.75rem'}}>
                              <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:'0.3rem'}}>
                                <span>Raised: <strong>₹{(c.raisedAmount||0).toLocaleString()}</strong></span>
                                <span>Goal: <strong>₹{c.goalAmount.toLocaleString()}</strong></span>
                              </div>
                              <div style={{background:'rgba(255,255,255,0.1)',borderRadius:'9999px',height:'8px',overflow:'hidden'}}>
                                <div style={{width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#f59e0b,#22c55e)',borderRadius:'9999px',transition:'width 0.5s'}}/>
                              </div>
                              <p style={{fontSize:'0.75rem',color:'#f59e0b',marginTop:'0.25rem',fontWeight:700}}>{pct}% funded</p>
                            </div>
                            {c.benefits && <p className="q-meta" style={{marginTop:'0.5rem'}}>🎁 Benefits: {c.benefits}</p>}
                          </div>
                          <div className="q-price-status">
                            <span className="q-status-badge" style={{background:c.status==='active'?'#22c55e':c.status==='completed'?'#6366f1':'#6b7280'}}>{(c.status||'active').toUpperCase()}</span>
                            {c.status==='active' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                                <button className="btn btn-primary" style={{fontSize:'0.75rem', padding: '0.2rem 0.5rem'}} onClick={()=>handleUpdateCampaignProgress(c._id, c.raisedAmount, c.goalAmount)}>Update Funds</button>
                                <button className="btn btn-cancel" style={{fontSize:'0.75rem', padding: '0.2rem 0.5rem'}} onClick={()=>handleCancelCampaign(c._id)}>Cancel</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── COMPANY PROFILE TAB ── */}
          {sponsorTab==='profile' && (
            <div className="dash-section glass animate-slide-up mt-4">
              <h2>🏢 Company Profile</h2>
              <p className="text-muted" style={{marginTop:'0.35rem',fontSize:'0.9rem'}}>
                Fill in your contact and company details. This information will be visible to colleges when you place ads or raise funds.
              </p>
              <form className="vendor-profile-form mt-4" onSubmit={handleProfileSave}>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Contact Person Name *</label>
                    <input
                      id="company-name"
                      type="text"
                      className="input-field"
                      placeholder="Your full name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      id="company-phone"
                      type="tel"
                      className="input-field"
                      placeholder="+91 98765 43210"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Company / Business Name *</label>
                    <input
                      id="company-biz-name"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Acme Corp Pvt. Ltd."
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Email *</label>
                    <input
                      id="company-email"
                      type="email"
                      className="input-field"
                      placeholder="contact@company.com"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Business Address *</label>
                  <textarea
                    id="company-address"
                    className="input-field"
                    rows="2"
                    placeholder="Office address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-two-col">
                  <div className="form-group">
                    <label>Website (Optional)</label>
                    <input
                      id="company-website"
                      type="url"
                      className="input-field"
                      placeholder="https://yourcompany.com"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>GST / Tax ID (Optional)</label>
                    <input
                      id="company-gst"
                      type="text"
                      className="input-field"
                      placeholder="27ABCDE1234F1Z5"
                      value={profile.gstNumber}
                      onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Industry / About Company</label>
                  <textarea
                    id="company-experience"
                    className="input-field"
                    rows="2"
                    placeholder="e.g. Leading FMCG brand targeting youth, active in college events across India."
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  />
                </div>
                <button
                  id="save-company-profile-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{marginTop:'0.5rem',width:'100%'}}
                >
                  💾 Save Company Profile
                </button>
              </form>
            </div>
          )}
        </div>
      )}


      {/* ── QUOTATION MODAL ── */}
      {showQuoteModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Submit Service Quotation</h3>
              <button className="modal-close" onClick={() => setShowQuoteModal(false)}>✕</button>
            </div>

            <div className="modal-event-info">
              <p>📌 <strong>{selectedEvent.title}</strong></p>
              <p>🏛️ {selectedEvent.collegeId?.name || 'College'} &nbsp;|&nbsp; 📍 {selectedEvent.location}</p>
              <p>🗓️ {new Date(selectedEvent.date).toDateString()}</p>
            </div>

            <form onSubmit={handleSubmitQuote} className="modal-form">
              {/* Service Type */}
              <div className="form-group">
                <label>Service Type *</label>
                <select
                  id="quote-service-type"
                  className="input-field"
                  value={quoteForm.serviceType}
                  onChange={(e) => setQuoteForm({ ...quoteForm, serviceType: e.target.value })}
                  required
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Proposed Total Price */}
              <div className="form-group">
                <label>Total Quoted Price (₹) *</label>
                <input
                  id="quote-price"
                  type="number"
                  className="input-field"
                  placeholder="e.g. 25000"
                  min="0"
                  value={quoteForm.proposedPrice}
                  onChange={(e) => setQuoteForm({ ...quoteForm, proposedPrice: e.target.value })}
                  required
                />
              </div>

              {/* Itemized Charges */}
              <div className="form-group">
                <label>
                  Itemized Charges Breakdown
                  <span className="optional-tag">(recommended)</span>
                </label>
                {serviceCharges.map((charge, i) => (
                  <div key={i} className="charge-input-row">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Item (e.g. DJ Equipment)"
                      value={charge.item}
                      onChange={(e) => updateCharge(i, 'item', e.target.value)}
                    />
                    <input
                      type="number"
                      className="input-field charge-cost"
                      placeholder="₹ Cost"
                      min="0"
                      value={charge.cost}
                      onChange={(e) => updateCharge(i, 'cost', e.target.value)}
                    />
                    {serviceCharges.length > 1 && (
                      <button
                        type="button"
                        className="remove-charge-btn"
                        onClick={() => removeChargeLine(i)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-charge-btn"
                  onClick={addChargeLine}
                >
                  + Add Another Item
                </button>
              </div>

              {/* Planning Details */}
              <div className="form-group">
                <label>Event Planning Details</label>
                <textarea
                  id="quote-planning"
                  className="input-field"
                  rows="3"
                  placeholder="Describe your plan for this event (e.g. setup time, equipment specifications, team size, special requirements...)"
                  value={quoteForm.planningDetails}
                  onChange={(e) => setQuoteForm({ ...quoteForm, planningDetails: e.target.value })}
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label>Cover Message / Pitch *</label>
                <textarea
                  id="quote-message"
                  className="input-field"
                  rows="3"
                  placeholder="Introduce your services, why you're the best fit, any packages or deals..."
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  required
                />
              </div>

              {/* Vendor contact preview */}
              <div className="vendor-contact-preview">
                <p className="preview-label">📇 Your contact info attached to this quotation:</p>
                <div className="preview-pills">
                  <span>👤 {profile.name}</span>
                  <span>📞 {profile.phone}</span>
                  <span>🏢 {profile.companyName}</span>
                  <span>✉️ {profile.email}</span>
                </div>
                <p className="preview-edit" onClick={() => { setShowQuoteModal(false); setActiveTab('profile'); }}>
                  Edit profile →
                </p>
              </div>

              {/* Submit */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowQuoteModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-quote-btn"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Submitting...' : '🚀 Submit Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── QR TICKET MODAL ── */}
      {showQR && (
        <div className="modal-overlay" onClick={()=>setShowQR(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{maxWidth:'400px',textAlign:'center'}}>
            <div className="modal-header">
              <h3 className="modal-title">🎫 Your Event Ticket</h3>
              <button className="modal-close" onClick={()=>setShowQR(null)}>✕</button>
            </div>
            <div style={{padding:'2rem'}}>
              <p style={{fontWeight:700,fontSize:'1.1rem',marginBottom:'0.25rem'}}>{showQR.eventId?.title||'Event Ticket'}</p>
              <p style={{fontSize:'0.82rem',color:'hsl(var(--text-muted))',marginBottom:'1.5rem'}}>🗓️ {showQR.eventId?.date?new Date(showQR.eventId.date).toDateString():'—'} | 📍 {showQR.eventId?.location||'—'}</p>
              <div style={{display:'inline-block',background:'white',padding:'1rem',borderRadius:'12px'}}>
                <QRCodeSVG value={showQR.ticketCode} size={200} level="H" />
              </div>
              <p style={{marginTop:'1rem',fontSize:'0.72rem',color:'hsl(var(--text-muted))',wordBreak:'break-all',fontFamily:'monospace'}}>{showQR.ticketCode}</p>
              <div style={{marginTop:'1rem',padding:'0.6rem 1rem',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'8px',fontSize:'0.82rem',color:'#22c55e',fontWeight:600}}>
                ✅ Valid Ticket — Show this QR at the entrance
              </div>
              <p style={{marginTop:'0.75rem',fontSize:'0.75rem',color:'hsl(var(--text-muted))'}}>⚠️ This QR can only be scanned once. Do not share it.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENT EVENT DETAIL MODAL ── */}
      {selectedStudentEvent && (
        <div className="modal-overlay" onClick={()=>setSelectedStudentEvent(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()} style={{maxWidth:'600px'}}>
            <div className="modal-header">
              <h3 className="modal-title">🎪 {selectedStudentEvent.title}</h3>
              <button className="modal-close" onClick={()=>setSelectedStudentEvent(null)}>✕</button>
            </div>
            <div style={{padding:'1rem'}}>
              <p style={{fontSize:'0.9rem',color:'#aaa'}}>🏛️ College: <span style={{color:'white'}}>{selectedStudentEvent.collegeId?.name || 'Unknown'}</span></p>
              <p style={{fontSize:'0.9rem',color:'#aaa',marginTop:'0.5rem'}}>🗓️ Date: <span style={{color:'white'}}>{new Date(selectedStudentEvent.date).toLocaleString()}</span></p>
              <p style={{fontSize:'0.9rem',color:'#aaa',marginTop:'0.5rem'}}>📍 Location: <span style={{color:'white'}}>{selectedStudentEvent.location}</span></p>
              
              <div style={{background:'rgba(255,255,255,0.05)',padding:'1rem',borderRadius:'8px',marginTop:'1rem'}}>
                <h4 style={{fontSize:'1rem',marginBottom:'0.5rem',color:'#a855f7'}}>📝 Description</h4>
                <p style={{fontSize:'0.9rem',lineHeight:'1.5',whiteSpace:'pre-wrap'}}>{selectedStudentEvent.description || 'No description available.'}</p>
              </div>

              <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem',paddingTop:'1rem',borderTop:'1px solid rgba(255,255,255,0.1)'}}>
                <div style={{flex:1}}>
                  <p style={{fontSize:'0.85rem',color:'#aaa'}}>Ticket Price</p>
                  <p style={{fontSize:'1.5rem',fontWeight:'bold',color:'#22c55e'}}>₹{selectedStudentEvent.ticketPrice}</p>
                </div>
                {selectedStudentEvent.vipPrice > 0 && (
                  <div style={{flex:1}}>
                    <p style={{fontSize:'0.85rem',color:'#aaa'}}>VIP Pass</p>
                    <p style={{fontSize:'1.5rem',fontWeight:'bold',color:'#a855f7'}}>₹{selectedStudentEvent.vipPrice}</p>
                  </div>
                )}
              </div>
              <div className="modal-actions mt-4">
                <button className="btn btn-cancel w-full" onClick={()=>setSelectedStudentEvent(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT AD MODAL ── */}
      {editingAd && (
        <div className="modal-overlay" onClick={() => setEditingAd(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Advertisement</h3>
              <button className="modal-close" onClick={() => setEditingAd(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateAd} className="modal-form">
              <div className="form-group">
                <label>Ad Title *</label>
                <input className="input-field" value={editAdForm.adTitle} onChange={e => setEditAdForm({...editAdForm, adTitle: e.target.value})} required />
              </div>
              <div className="form-two-col">
                <div className="form-group">
                  <label>Ad Type *</label>
                  <select className="input-field" value={editAdForm.adType} onChange={e => setEditAdForm({...editAdForm, adType: e.target.value})}>
                    {['Banner','Stage Backdrop','LED Screen','Social Media','Pamphlet','Stall','Merchandise','Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Budget (₹) *</label>
                  <input type="number" min="0" className="input-field" value={editAdForm.budget} onChange={e => setEditAdForm({...editAdForm, budget: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Target Audience</label>
                <input className="input-field" value={editAdForm.targetAudience} onChange={e => setEditAdForm({...editAdForm, targetAudience: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Banner / Creative Requirements *</label>
                <textarea className="input-field" rows="3" value={editAdForm.bannerRequirements} onChange={e => setEditAdForm({...editAdForm, bannerRequirements: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Call to Action</label>
                <input className="input-field" value={editAdForm.callToAction} onChange={e => setEditAdForm({...editAdForm, callToAction: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setEditingAd(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editAdSubmitting}>
                  {editAdSubmitting ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT QUOTATION MODAL ── */}
      {editingQuote && (
        <div className="modal-overlay" onClick={() => setEditingQuote(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Edit Quotation</h3>
              <button className="modal-close" onClick={() => setEditingQuote(null)}>✕</button>
            </div>
            <div className="modal-event-info">
              <p>📌 <strong>{editingQuote.eventId?.title || 'Event'}</strong></p>
              <p>🏛️ {editingQuote.collegeId?.name || 'College'}</p>
            </div>
            <form onSubmit={handleUpdateQuote} className="modal-form">
              <div className="form-group">
                <label>Service Type *</label>
                <select className="input-field" value={editQuoteForm.serviceType} onChange={e => setEditQuoteForm({...editQuoteForm, serviceType: e.target.value})} required>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Total Quoted Price (₹) *</label>
                <input type="number" min="0" className="input-field" value={editQuoteForm.proposedPrice} onChange={e => setEditQuoteForm({...editQuoteForm, proposedPrice: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Itemized Charges <span className="optional-tag">(optional)</span></label>
                {editQuoteCharges.map((charge, i) => (
                  <div key={i} className="charge-input-row">
                    <input type="text" className="input-field" placeholder="Item" value={charge.item} onChange={e => { const u=[...editQuoteCharges]; u[i].item=e.target.value; setEditQuoteCharges(u); }} />
                    <input type="number" className="input-field charge-cost" placeholder="₹ Cost" min="0" value={charge.cost} onChange={e => { const u=[...editQuoteCharges]; u[i].cost=e.target.value; setEditQuoteCharges(u); }} />
                    {editQuoteCharges.length > 1 && <button type="button" className="remove-charge-btn" onClick={() => setEditQuoteCharges(editQuoteCharges.filter((_,idx)=>idx!==i))}>✕</button>}
                  </div>
                ))}
                <button type="button" className="add-charge-btn" onClick={() => setEditQuoteCharges([...editQuoteCharges, { item: '', cost: '' }])}>+ Add Item</button>
              </div>
              <div className="form-group">
                <label>Planning Details</label>
                <textarea className="input-field" rows="3" value={editQuoteForm.planningDetails} onChange={e => setEditQuoteForm({...editQuoteForm, planningDetails: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Cover Message / Pitch *</label>
                <textarea className="input-field" rows="3" value={editQuoteForm.message} onChange={e => setEditQuoteForm({...editQuoteForm, message: e.target.value})} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={() => setEditingQuote(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editQuoteSubmitting}>
                  {editQuoteSubmitting ? 'Saving...' : '💾 Update Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
