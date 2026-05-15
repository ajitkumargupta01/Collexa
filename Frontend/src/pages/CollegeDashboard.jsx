import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import './CollegeDashboard.css';

const CollegeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('events');

  // State
  const [events, setEvents] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [ads, setAds] = useState([]);
  const [allColleges, setAllColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Validate state
  const [scanResult, setScanResult] = useState(null);
  const [scanInput, setScanInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef(null);
  // BUG FIX: Use a ref to always have the latest validateTicket function
  // so the scanner callback (which is a closure) doesn't capture stale state.
  const validateFnRef = useRef(null);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  // BUG FIX: Stop scanner when switching away from the validate tab
  useEffect(() => {
    if (activeTab !== 'validate') {
      setIsScanning(false);
      stopScanner();
    }
  }, [activeTab]);

  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      // Ensure the element exists before initializing
      const container = document.getElementById('qr-reader');
      if (!container) return;

      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
          },
          (decodedText) => {
            if (!isMounted) return;
            setScanInput(decodedText);
            setIsScanning(false);
            stopScanner();
            if (validateFnRef.current) {
              validateFnRef.current(null, decodedText);
            }
          },
          () => {
            // Silence silent scan errors
          }
        );
      } catch (err) {
        console.error('Camera start error:', err);
        if (isMounted) setIsScanning(false);
      }
    };

    if (isScanning) {
      // Small timeout to ensure DOM is ready after React render
      const timer = setTimeout(() => {
        if (isMounted) startCamera();
      }, 300);
      return () => {
        isMounted = false;
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isScanning]);

  // Event features state
  const [editingEvent, setEditingEvent] = useState(null);

  // Event Form State — now with pass prices + free-pass colleges
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    ticketPrice: 0,
    vipPrice: 0,
    earlyBirdPrice: 0,
    enableVip: false,
    enableEarlyBird: false,
  });
  const [selectedFreeColleges, setSelectedFreeColleges] = useState([]);
  const [freePassMode, setFreePassMode] = useState('none'); // 'none' | 'select' | 'all'

  // Access restriction state
  const [accessMode, setAccessMode] = useState('all'); // 'all' | 'select' | 'mine'
  const [selectedAllowedColleges, setSelectedAllowedColleges] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'college') {
        navigate('/login');
      } else {
        setUser(parsedUser);
        const collegeIdToUse = parsedUser._id || parsedUser.id;
        fetchAllData(collegeIdToUse);
        fetchColleges();
      }
    }
  }, [navigate]);

  const fetchColleges = async () => {
    try {
      // Fetch all registered college names from backend
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/colleges`);
      if (res.data.success) {
        const names = res.data.data.map((c) => c.name);
        setAllColleges([...new Set(names)]);
      } else {
        setAllColleges([]);
      }
    } catch (err) {
      console.error(err);
      setAllColleges([]);
    }
  };

  const fetchAllData = async (collegeId) => {
    try {
      setLoading(true);
      const evRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
      const allEvents = evRes.data.data || [];
      setEvents(
        allEvents.filter((evt) => {
          const evCollegeId = evt.collegeId?._id || evt.collegeId;
          return String(evCollegeId) === String(collegeId);
        })
      );

      const qRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/quotations/college`, {
        headers: { 'user-id': collegeId },
      });
      setQuotations(qRes.data.data || []);

      const adRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/ads/college`, {
        headers: { 'user-id': collegeId },
      });
      setAds(adRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS: EVENTS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleFreeCollege = (collegeName) => {
    setSelectedFreeColleges((prev) =>
      prev.includes(collegeName) ? prev.filter((c) => c !== collegeName) : [...prev, collegeName]
    );
  };

  const toggleAllowedCollege = (collegeName) => {
    setSelectedAllowedColleges((prev) =>
      prev.includes(collegeName) ? prev.filter((c) => c !== collegeName) : [...prev, collegeName]
    );
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const collegeIdToUse = user._id || user.id;

      // Build free-pass colleges list
      let freePassColleges = [];
      if (freePassMode === 'select') {
        freePassColleges = selectedFreeColleges;
      } else if (freePassMode === 'all') {
        freePassColleges = allColleges;
      }

      // Build allowed colleges list
      let allowedColleges = [];
      if (accessMode === 'select') {
        allowedColleges = selectedAllowedColleges;
      } else if (accessMode === 'mine') {
        allowedColleges = [user.name];
      }
      // 'all' => empty array (open to everyone)

      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        ticketPrice: Number(formData.ticketPrice),
        freePassColleges,
        allowedColleges,
        collegeId: collegeIdToUse,
        // Store VIP / early-bird prices in an extras object if enabled
        ...(formData.enableVip && { vipPrice: Number(formData.vipPrice) }),
        ...(formData.enableEarlyBird && { earlyBirdPrice: Number(formData.earlyBirdPrice) }),
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/events`, payload);
      if (data.success) {
        setEvents([...events, { ...data.data, collegeId: { _id: collegeIdToUse } }]);
        setFormData({
          title: '',
          description: '',
          date: '',
          location: '',
          ticketPrice: 0,
          vipPrice: 0,
          earlyBirdPrice: 0,
          enableVip: false,
          enableEarlyBird: false,
        });
        setSelectedFreeColleges([]);
        setFreePassMode('none');
        setAccessMode('all');
        setSelectedAllowedColleges([]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create event. Please check inputs.');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event? All associated tickets will also be deleted.')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/events/${id}`);
      setEvents(events.filter((evt) => evt._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete event.');
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      // Free pass logic
      let freePassColleges = [];
      if (freePassMode === 'select') {
        freePassColleges = selectedFreeColleges;
      } else if (freePassMode === 'all') {
        freePassColleges = allColleges;
      }

      // Build allowed colleges
      let allowedColleges = [];
      if (accessMode === 'select') {
        allowedColleges = selectedAllowedColleges;
      } else if (accessMode === 'mine') {
        allowedColleges = [user.name];
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        ticketPrice: Number(formData.ticketPrice),
        freePassColleges,
        allowedColleges,
        ...(formData.enableVip && { vipPrice: Number(formData.vipPrice) }),
        ...(formData.enableEarlyBird && { earlyBirdPrice: Number(formData.earlyBirdPrice) }),
      };

      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${editingEvent._id}`, payload);
      if (data.success) {
        setEvents(events.map(evt => evt._id === editingEvent._id ? { ...data.data, ticketsCount: evt.ticketsCount } : evt));
        setEditingEvent(null);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update event.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', date: '', location: '', ticketPrice: 0,
      vipPrice: 0, earlyBirdPrice: 0, enableVip: false, enableEarlyBird: false
    });
    setSelectedFreeColleges([]);
    setFreePassMode('none');
    setAccessMode('all');
    setSelectedAllowedColleges([]);
  };

  const handleEditClick = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      date: evt.date.split('T')[0],
      location: evt.location,
      ticketPrice: evt.ticketPrice || 0,
      vipPrice: evt.vipPrice || 0,
      earlyBirdPrice: evt.earlyBirdPrice || 0,
      enableVip: evt.vipPrice > 0,
      enableEarlyBird: evt.earlyBirdPrice > 0,
    });
    if (evt.freePassColleges?.length > 0) {
      const isAll = allColleges.length > 0 && evt.freePassColleges.length === allColleges.length;
      if (isAll) setFreePassMode('all');
      else { setFreePassMode('select'); setSelectedFreeColleges(evt.freePassColleges); }
    } else {
      setFreePassMode('none');
      setSelectedFreeColleges([]);
    }

    // Restore access restriction mode
    if (!evt.allowedColleges || evt.allowedColleges.length === 0) {
      setAccessMode('all');
      setSelectedAllowedColleges([]);
    } else if (evt.allowedColleges.length === 1 && evt.allowedColleges[0] === user?.name) {
      setAccessMode('mine');
      setSelectedAllowedColleges([]);
    } else {
      setAccessMode('select');
      setSelectedAllowedColleges(evt.allowedColleges);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/events/${id}`, { status: newStatus });
      if (data.success) {
        setEvents(events.map(evt => evt._id === id ? { ...data.data, ticketsCount: evt.ticketsCount } : evt));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  // --- ACTIONS: QUOTATIONS ---
  const handleQuotationStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/quotations/${id}`, { status });
      if (data.success) {
        setQuotations(quotations.map((q) => (q._id === id ? { ...q, status: data.data.status } : q)));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update quotation.');
    }
  };

  // --- ACTIONS: ADS ---
  const handleAdStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/ads/${id}`, { status });
      if (data.success) {
        setAds(ads.map((ad) => (ad._id === id ? { ...ad, status: data.data.status } : ad)));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update ad request.');
    }
  };

  // --- ACTIONS: VALIDATE QR ---
  const handleValidateScan = useCallback(async (e, scannedCode = null) => {
    if (e) e.preventDefault();
    const codeToValidate = scannedCode || scanInput.trim();
    if (!codeToValidate) return;
    // BUG FIX: Clear previous result before starting new validation
    setScanResult(null);
    setIsValidating(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/tickets/validate`, { ticketCode: codeToValidate });
      setScanResult(data);
      setScanCount(prev => prev + 1);
      if (!scannedCode) setScanInput('');
    } catch (err) {
      console.error(err);
      setScanResult({ valid: false, message: err.response?.data?.error || 'Error validating ticket.' });
    } finally {
      setIsValidating(false);
    }
  }, [scanInput]);

  // BUG FIX: Keep the ref updated so the scanner closure always calls the latest version
  useEffect(() => {
    validateFnRef.current = handleValidateScan;
  }, [handleValidateScan]);

  if (!user) return null;

  return (
    <div className="college-dashboard-container container page-transition theme-college">
      {/* College Role Banner */}
      <div
        className="role-banner-strip"
        style={{
          background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(14,165,233,0.04))',
          borderColor: 'rgba(14,165,233,0.3)',
        }}
      >
        <span className="rbs-icon">🏙️</span>
        <span className="rbs-label" style={{ color: '#0ea5e9' }}>
          College Administration Portal
        </span>
      </div>
      <div className="dash-header text-center">
        <h1>
          College <span className="text-gradient">Admin Panel</span>
        </h1>
        <p
          className="role-badge mx-auto mt-2"
          style={{
            display: 'inline-block',
            background: 'rgba(14,165,233,0.12)',
            color: '#0ea5e9',
            border: '1px solid rgba(14,165,233,0.3)',
            borderRadius: '9999px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          Manage events, vendor quotations &amp; sponsorships
        </p>
      </div>

      <div className="dashboard-tabs mt-4">
        <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
          📅 Events
        </button>
        <button
          className={`tab-btn ${activeTab === 'quotations' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotations')}
        >
          📋 Quotations ({quotations.filter((q) => q.status === 'pending').length})
        </button>
        <button className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
          📢 Advertisements ({ads.filter((a) => a.status === 'pending').length})
        </button>
        <button className={`tab-btn ${activeTab === 'validate' ? 'active' : ''}`} onClick={() => setActiveTab('validate')}>
          ✅ Validate QR
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-center">Loading portal data...</p>
        ) : (
          <>
            {/* EVENTS TAB */}
            {activeTab === 'events' && (
              <div className="college-grid">
                {/* ── Create / Edit Event Form ── */}
                <div className="dash-section glass animate-slide-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>{editingEvent ? '✏️ Edit Event' : 'Create New Event'}</h2>
                    {editingEvent && (
                      <button onClick={() => { setEditingEvent(null); resetForm(); }} className="btn btn-cancel text-sm py-1 px-3">
                        Cancel Edit
                      </button>
                    )}
                  </div>
                  <form className="event-form mt-4" onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                    {/* Title */}
                    <div className="form-group">
                      <label>Event Title</label>
                      <input
                        type="text"
                        name="title"
                        className="input-field"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        className="input-field"
                        rows="2"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Date + Location */}
                    <div className="form-group row">
                      <div className="col">
                        <label>Date</label>
                        <input
                          type="date"
                          name="date"
                          className="input-field"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col">
                        <label>Location</label>
                        <input
                          type="text"
                          name="location"
                          className="input-field"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {/* ── Pass Pricing Section ── */}
                    <div
                      style={{
                        background: 'rgba(14,165,233,0.06)',
                        border: '1px solid rgba(14,165,233,0.2)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#0ea5e9',
                          marginBottom: '0.75rem',
                        }}
                      >
                        🎫 Pass Pricing
                      </p>

                      {/* General / Entry Price */}
                      <div className="form-group">
                        <label>General Entry Price (₹) — set 0 for free</label>
                        <input
                          type="number"
                          name="ticketPrice"
                          className="input-field"
                          min="0"
                          value={formData.ticketPrice}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* VIP Toggle */}
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          id="enableVip"
                          name="enableVip"
                          checked={formData.enableVip}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="enableVip" style={{ cursor: 'pointer', marginBottom: 0 }}>
                          Add VIP / Premium Pass tier
                        </label>
                      </div>
                      {formData.enableVip && (
                        <div className="form-group">
                          <label>VIP Pass Price (₹)</label>
                          <input
                            type="number"
                            name="vipPrice"
                            className="input-field"
                            min="0"
                            value={formData.vipPrice}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}

                      {/* Early Bird Toggle */}
                      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          id="enableEarlyBird"
                          name="enableEarlyBird"
                          checked={formData.enableEarlyBird}
                          onChange={handleInputChange}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="enableEarlyBird" style={{ cursor: 'pointer', marginBottom: 0 }}>
                          Add Early Bird Discounted Pass
                        </label>
                      </div>
                      {formData.enableEarlyBird && (
                        <div className="form-group">
                          <label>Early Bird Price (₹)</label>
                          <input
                            type="number"
                            name="earlyBirdPrice"
                            className="input-field"
                            min="0"
                            value={formData.earlyBirdPrice}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* ── Free Pass Section ── */}
                    <div
                      style={{
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#22c55e',
                          marginBottom: '0.75rem',
                        }}
                      >
                        🆓 Free Pass Colleges
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', marginBottom: '0.75rem' }}>
                        Students from selected colleges will receive complimentary passes.
                      </p>

                      {/* Mode Radio */}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {[
                          { val: 'none', label: '🚫 No Free Passes' },
                          { val: 'select', label: '🎯 Selected Colleges' },
                          { val: 'all', label: '🌐 All Colleges' },
                        ].map(({ val, label }) => (
                          <label
                            key={val}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: freePassMode === val ? 700 : 400,
                              color: freePassMode === val ? '#22c55e' : 'inherit',
                            }}
                          >
                            <input
                              type="radio"
                              name="freePassMode"
                              value={val}
                              checked={freePassMode === val}
                              onChange={() => {
                                setFreePassMode(val);
                                if (val !== 'select') setSelectedFreeColleges([]);
                              }}
                            />
                            {label}
                          </label>
                        ))}
                      </div>

                      {/* College Checkboxes */}
                      {freePassMode === 'select' && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '0.4rem',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '0.5rem',
                            background: 'rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                          }}
                        >
                          {allColleges.map((college) => (
                            <label
                              key={college}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                background: selectedFreeColleges.includes(college)
                                  ? 'rgba(34,197,94,0.15)'
                                  : 'transparent',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedFreeColleges.includes(college)}
                                onChange={() => toggleFreeCollege(college)}
                              />
                              {college}
                            </label>
                          ))}
                        </div>
                      )}

                      {freePassMode === 'select' && selectedFreeColleges.length > 0 && (
                        <p style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '0.5rem' }}>
                          ✅ {selectedFreeColleges.length} college(s) selected for free passes
                        </p>
                      )}
                      {freePassMode === 'all' && (
                        <p style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '0.5rem' }}>
                          ✅ ALL registered colleges will receive free passes
                        </p>
                      )}
                    </div>

                    {/* ── College Access Restriction Section ── */}
                    <div
                      style={{
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '10px',
                        padding: '1rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          color: '#ef4444',
                          marginBottom: '0.4rem',
                        }}
                      >
                        🔒 College Access Restriction
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', marginBottom: '0.75rem' }}>
                        Control which college students can register for this event.
                      </p>

                      {/* Access Mode Radio */}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {[
                          { val: 'all', label: '🌐 Open to All' },
                          { val: 'select', label: '🎯 Specific Colleges' },
                          { val: 'mine', label: '🏛️ Only My College' },
                        ].map(({ val, label }) => (
                          <label
                            key={val}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: accessMode === val ? 700 : 400,
                              color: accessMode === val ? '#ef4444' : 'inherit',
                            }}
                          >
                            <input
                              type="radio"
                              name="accessMode"
                              value={val}
                              checked={accessMode === val}
                              onChange={() => {
                                setAccessMode(val);
                                if (val !== 'select') setSelectedAllowedColleges([]);
                              }}
                            />
                            {label}
                          </label>
                        ))}
                      </div>

                      {/* College picker for 'select' mode */}
                      {accessMode === 'select' && (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                            gap: '0.4rem',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            padding: '0.5rem',
                            background: 'rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                          }}
                        >
                          {allColleges.map((college) => (
                            <label
                              key={college}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                background: selectedAllowedColleges.includes(college)
                                  ? 'rgba(239,68,68,0.15)'
                                  : 'transparent',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAllowedColleges.includes(college)}
                                onChange={() => toggleAllowedCollege(college)}
                              />
                              {college}
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Status messages */}
                      {accessMode === 'all' && (
                        <p style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '0.5rem' }}>✅ All students from any college can register</p>
                      )}
                      {accessMode === 'mine' && (
                        <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.5rem' }}>🔒 Only students from <strong>{user?.name}</strong> can register</p>
                      )}
                      {accessMode === 'select' && selectedAllowedColleges.length > 0 && (
                        <p style={{ fontSize: '0.78rem', color: '#f97316', marginTop: '0.5rem' }}>🎯 {selectedAllowedColleges.length} college(s) allowed to register</p>
                      )}
                      {accessMode === 'select' && selectedAllowedColleges.length === 0 && (
                        <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.5rem' }}>⚠️ Please select at least one college</p>
                      )}
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-2">
                      {editingEvent ? '💾 Save Changes' : '🚀 Publish Event'}
                    </button>
                  </form>
                </div>

                {/* ── Your Events List ── */}
                <div className="dash-section glass animate-slide-up delay-100">
                  <h2>Your Events</h2>
                  {events.length === 0 ? (
                    <p className="text-muted mt-2">No events published yet.</p>
                  ) : (
                    <div className="events-list mt-4">
                      {events.map((evt) => (
                        <div
                          key={evt._id}
                          className="event-item card-hover p-4 rounded mb-2 border-l-4 border-primary"
                        >
                          <div className="flex justify-between items-start">
                            <div style={{ flex: 1 }}>
                              <h3 className="font-display font-bold text-lg">{evt.title}</h3>
                              <p className="text-sm text-muted mt-1">
                                🗓️ {new Date(evt.date).toLocaleDateString()} | 📍 {evt.location}
                              </p>

                              {/* Pass pricing display */}
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                <span
                                  style={{
                                    background:
                                      evt.ticketPrice === 0
                                        ? 'rgba(34,197,94,0.15)'
                                        : 'rgba(14,165,233,0.12)',
                                    color: evt.ticketPrice === 0 ? '#22c55e' : '#0ea5e9',
                                    border: `1px solid ${evt.ticketPrice === 0 ? 'rgba(34,197,94,0.4)' : 'rgba(14,165,233,0.3)'}`,
                                    borderRadius: '9999px',
                                    padding: '0.15rem 0.55rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  {evt.ticketPrice === 0 ? '🆓 Free Entry' : `🎫 ₹${evt.ticketPrice} General`}
                                </span>
                                {evt.vipPrice > 0 && (
                                  <span
                                    style={{
                                      background: 'rgba(168,85,247,0.12)',
                                      color: '#a855f7',
                                      border: '1px solid rgba(168,85,247,0.3)',
                                      borderRadius: '9999px',
                                      padding: '0.15rem 0.55rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    👑 ₹{evt.vipPrice} VIP
                                  </span>
                                )}
                                {evt.earlyBirdPrice > 0 && (
                                  <span
                                    style={{
                                      background: 'rgba(245,158,11,0.12)',
                                      color: '#f59e0b',
                                      border: '1px solid rgba(245,158,11,0.3)',
                                      borderRadius: '9999px',
                                      padding: '0.15rem 0.55rem',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    🐦 ₹{evt.earlyBirdPrice} Early Bird
                                  </span>
                                )}
                              </div>

                              {/* Access Restriction Badge */}
                              {evt.allowedColleges && evt.allowedColleges.length > 0 && (
                                <span
                                  style={{
                                    background: 'rgba(239,68,68,0.12)',
                                    color: '#ef4444',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '9999px',
                                    padding: '0.15rem 0.55rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  🔒 Restricted ({evt.allowedColleges.length === 1 && evt.allowedColleges[0] === user?.name ? 'My College Only' : `${evt.allowedColleges.length} college(s)`})
                                </span>
                              )}
                              {(!evt.allowedColleges || evt.allowedColleges.length === 0) && (
                                <span
                                  style={{
                                    background: 'rgba(34,197,94,0.1)',
                                    color: '#22c55e',
                                    border: '1px solid rgba(34,197,94,0.25)',
                                    borderRadius: '9999px',
                                    padding: '0.15rem 0.55rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  🌐 Open to All
                                </span>
                              )}
                              {evt.freePassColleges && evt.freePassColleges.length > 0 && (
                                <div style={{ marginTop: '0.4rem' }}>
                                  <p
                                    style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: '#22c55e',
                                      marginBottom: '0.2rem',
                                    }}
                                  >
                                    🆓 FREE PASS FOR:
                                  </p>
                                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {evt.freePassColleges.map((c) => (
                                      <span
                                        key={c}
                                        style={{
                                          background: 'rgba(34,197,94,0.1)',
                                          color: '#86efac',
                                          border: '1px solid rgba(34,197,94,0.25)',
                                          borderRadius: '4px',
                                          padding: '0.1rem 0.45rem',
                                          fontSize: '0.7rem',
                                        }}
                                      >
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span
                                  className={`px-2 py-1 text-xs rounded uppercase font-bold text-white ${evt.status === 'upcoming' ? 'bg-blue-500' :
                                      evt.status === 'ongoing' ? 'bg-green-500' :
                                        evt.status === 'completed' ? 'bg-gray-500' : 'bg-red-500'
                                    }`}
                                >
                                  {evt.status || 'upcoming'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span className="text-sm font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                  🎟️ {evt.ticketsCount || 0} Enrolled
                                </span>
                                <button onClick={() => handleEditClick(evt)} className="btn btn-secondary text-sm p-1">
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(evt._id)}
                                  className="btn btn-danger-outline text-sm p-1"
                                >
                                  🗑️
                                </button>
                              </div>
                              <select
                                className="input-field text-sm p-1"
                                value={evt.status || 'upcoming'}
                                onChange={(e) => handleStatusChange(evt._id, e.target.value)}
                                style={{ minWidth: '120px' }}
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <div className="dash-section glass animate-slide-up">
            <h2>Service Provider Quotations</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Review quotations submitted by DJs, decorators, lighting crews and other vendors.
            </p>
            {quotations.length === 0 ? (
              <p className="text-muted mt-2">No quotations received yet.</p>
            ) : (
              <div className="grid gap-2 mt-4">
                {quotations.map((q) => (
                  <div
                    key={q._id}
                    className="p-4 rounded border-l-4 border-secondary card-hover bg-gray-50 dark:bg-gray-800"
                  >
                    <div
                      className="flex justify-between items-start"
                      style={{ flexWrap: 'wrap', gap: '0.75rem' }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 className="font-bold" style={{ marginBottom: '0.25rem' }}>
                          For: {q.eventId?.title || 'Unknown Event'}
                        </h3>
                        <p className="text-sm" style={{ color: 'hsl(var(--secondary))', fontWeight: 600 }}>
                          {q.serviceType}
                        </p>

                        {q.vendorContact && (
                          <div
                            style={{
                              marginTop: '0.6rem',
                              padding: '0.6rem 0.8rem',
                              background: 'rgba(255,255,255,0.04)',
                              borderRadius: '8px',
                              border: '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: 'hsl(var(--text-muted))',
                                fontWeight: 600,
                                marginBottom: '0.4rem',
                              }}
                            >
                              📇 Vendor Contact
                            </p>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
                                gap: '0.3rem 1rem',
                              }}
                            >
                              {q.vendorContact.companyName && (
                                <p className="text-sm">🏢 {q.vendorContact.companyName}</p>
                              )}
                              {q.vendorContact.name && <p className="text-sm">👤 {q.vendorContact.name}</p>}
                              {q.vendorContact.phone && <p className="text-sm">📞 {q.vendorContact.phone}</p>}
                              {q.vendorContact.email && <p className="text-sm">✉️ {q.vendorContact.email}</p>}
                              {q.vendorContact.address && (
                                <p className="text-sm" style={{ gridColumn: '1/-1' }}>
                                  📍 {q.vendorContact.address}
                                </p>
                              )}
                              {q.vendorContact.experience && (
                                <p
                                  className="text-sm"
                                  style={{
                                    gridColumn: '1/-1',
                                    fontStyle: 'italic',
                                    color: 'hsl(var(--text-muted))',
                                  }}
                                >
                                  ⭐ {q.vendorContact.experience}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {q.serviceCharges && q.serviceCharges.length > 0 && (
                          <div style={{ marginTop: '0.6rem' }}>
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: 'hsl(var(--text-muted))',
                                fontWeight: 600,
                                marginBottom: '0.3rem',
                              }}
                            >
                              💰 CHARGES BREAKDOWN
                            </p>
                            {q.serviceCharges.map((c, i) => (
                              <div
                                key={i}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.82rem',
                                  padding: '0.15rem 0',
                                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}
                              >
                                <span>{c.item}</span>
                                <span style={{ fontWeight: 600 }}>₹{Number(c.cost).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.planningDetails && (
                          <p className="text-sm" style={{ marginTop: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                            📝 {q.planningDetails}
                          </p>
                        )}
                        <p className="text-sm mt-1 mb-2 text-muted">💬 "{q.message}"</p>
                        <span
                          className={`px-2 py-1 text-xs rounded uppercase font-bold text-white ${q.status === 'accepted'
                              ? 'bg-green-500'
                              : q.status === 'rejected'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                            }`}
                        >
                          {q.status}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-4"
                        style={{ flexDirection: 'column', alignItems: 'flex-end' }}
                      >
                        <p className="font-bold text-xl" style={{ color: 'hsl(var(--secondary))' }}>
                          ₹{Number(q.proposedPrice).toLocaleString()}
                        </p>
                        {q.status === 'pending' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleQuotationStatus(q._id, 'accepted')}
                              className="btn btn-primary text-sm p-1"
                            >
                              ✅ Accept
                            </button>
                            <button
                              onClick={() => handleQuotationStatus(q._id, 'rejected')}
                              className="btn btn-danger-outline text-sm p-1"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === 'ads' && (
          <div className="dash-section glass animate-slide-up">
            <h2>Sponsor Advertisement Funds</h2>
            {ads.length === 0 ? (
              <p className="text-muted mt-2">No ad requests funded yet.</p>
            ) : (
              <div className="grid gap-2 mt-4">
                {ads.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded border-l-4 border-primary card-hover flex justify-between items-center bg-gray-50 dark:bg-gray-800"
                  >
                    <div>
                      <h3 className="font-bold">For: {a.eventId?.title || 'Unknown Event'}</h3>
                      <p className="text-sm mt-1">Company: {a.companyId?.name}</p>
                      <p className="text-sm mt-1 mb-2 text-muted">Banner Req: "{a.bannerRequirements}"</p>
                      <span
                        className={`px-2 py-1 text-xs rounded uppercase font-bold text-white ${a.status === 'accepted'
                            ? 'bg-green-500'
                            : a.status === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-xl text-green-500">+₹{Number(a.budget).toLocaleString()}</p>
                      {a.status === 'pending' && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleAdStatus(a._id, 'accepted')}
                            className="btn btn-primary text-sm p-1"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAdStatus(a._id, 'rejected')}
                            className="btn btn-danger-outline text-sm p-1"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* VALIDATE QR TAB */}
        {activeTab === 'validate' && (
          <div className="dash-section glass animate-slide-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>📟</span> Ticket Scanner
                </h2>
                <p className="text-muted" style={{ marginTop: '0.35rem', fontSize: '0.88rem' }}>
                  Scan student QR codes at the entry gate. Each ticket validates only once.
                </p>
              </div>
              {scanCount > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.82rem', fontWeight: 700, color: '#818cf8'
                }}>
                  ✅ {scanCount} ticket{scanCount !== 1 ? 's' : ''} scanned today
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="qr-action-row mt-4">
              <button
                className={`qr-camera-btn ${isScanning ? 'qr-camera-btn--active' : ''}`}
                onClick={() => { setScanResult(null); setIsScanning(!isScanning); }}
              >
                <span className="qr-camera-icon">{isScanning ? '⏹' : '📷'}</span>
                <span>{isScanning ? 'Stop Camera' : 'Scan with Camera'}</span>
              </button>
              <div className="qr-divider"><span>OR</span></div>
              <form onSubmit={handleValidateScan} className="qr-manual-form">
                <div className="qr-input-wrap">
                  <span className="qr-input-icon">🎫</span>
                  <input
                    id="college-scan-input"
                    className="qr-input"
                    placeholder="Paste ticket UUID here..."
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <button type="submit" className="btn btn-secondary" disabled={isValidating || !scanInput.trim()}>
                  {isValidating ? <span className="qr-spinner"></span> : '🔍'} {isValidating ? 'Validating...' : 'Validate'}
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => { setScanResult(null); setScanInput(''); }}
                >
                  ✕
                </button>
              </form>
            </div>

            {/* Camera Scanner */}
            {isScanning && (
              <div className="qr-camera-wrap mt-4">
                <div className="qr-camera-header">
                  <span className="qr-cam-live-dot"></span>
                  <span>Camera Active — Point at QR Code</span>
                  <button className="qr-stop-btn" onClick={() => setIsScanning(false)}>✕ Stop</button>
                </div>
                <div className="qr-camera-body">
                  <div id="qr-reader"></div>
                  <div className="qr-frame-overlay">
                    <div className="qr-corner qr-corner--tl"></div>
                    <div className="qr-corner qr-corner--tr"></div>
                    <div className="qr-corner qr-corner--bl"></div>
                    <div className="qr-corner qr-corner--br"></div>
                    <div className="qr-scan-line"></div>
                  </div>
                </div>
                <p className="qr-camera-hint">Align the QR code within the frame</p>
              </div>
            )}

            {/* Validating Loading State */}
            {isValidating && (
              <div className="qr-validating-state mt-4">
                <div className="qr-pulse-ring"></div>
                <p>Validating ticket...</p>
              </div>
            )}

            {/* Scan Result */}
            {!isValidating && scanResult && (
              <div className={`qr-result-card mt-4 ${scanResult.valid ? 'qr-result--valid' : 'qr-result--invalid'}`}>
                <div className="qr-result-icon-wrap">
                  <div className="qr-result-icon">
                    {scanResult.valid ? '✅' : '❌'}
                  </div>
                </div>
                <div className="qr-result-content">
                  <p className="qr-result-status">
                    {scanResult.valid ? 'TICKET VALID — ENTRY GRANTED' : 'TICKET INVALID'}
                  </p>
                  <p className="qr-result-message">{scanResult.message || scanResult.error}</p>

                  {scanResult.ticket && (
                    <div className="qr-result-details">
                      <div className="qr-detail-grid">
                        <div className="qr-detail-item">
                          <span className="qr-detail-label">👤 Student</span>
                          <span className="qr-detail-value">{scanResult.ticket.studentName || '—'}</span>
                        </div>
                        {scanResult.ticket.studentCollege && (
                          <div className="qr-detail-item">
                            <span className="qr-detail-label">🏛️ College</span>
                            <span className="qr-detail-value">{scanResult.ticket.studentCollege}</span>
                          </div>
                        )}
                        <div className="qr-detail-item">
                          <span className="qr-detail-label">🎪 Event</span>
                          <span className="qr-detail-value">{scanResult.ticket.eventTitle || '—'}</span>
                        </div>
                        {scanResult.ticket.pricePaid !== undefined && (
                          <div className="qr-detail-item">
                            <span className="qr-detail-label">💰 Ticket Price</span>
                            <span className="qr-detail-value">
                              {scanResult.ticket.isFreePass
                                ? <span className="qr-free-badge">🆓 FREE PASS</span>
                                : `₹${scanResult.ticket.pricePaid}`
                              }
                            </span>
                          </div>
                        )}
                        {scanResult.ticket.passType && (
                          <div className="qr-detail-item">
                            <span className="qr-detail-label">🎫 Pass Type</span>
                            <span className={`qr-pass-type-badge qr-pass-type-badge--${scanResult.ticket.passType}`}>
                              {scanResult.ticket.passType === 'vip' ? '👑 VIP' :
                               scanResult.ticket.passType === 'earlyBird' ? '🐦 Early Bird' : '🎟️ General'}
                            </span>
                          </div>
                        )}
                        {scanResult.ticket.scannedAt && (
                          <div className="qr-detail-item">
                            <span className="qr-detail-label">🕐 Scanned At</span>
                            <span className="qr-detail-value">{new Date(scanResult.ticket.scannedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button className="qr-result-clear" onClick={() => { setScanResult(null); setScanInput(''); }}>✕ New Scan</button>
              </div>
            )}

            {/* Idle hints */}
            {!isScanning && !scanResult && !isValidating && (
              <div className="qr-idle-hint mt-4">
                <p>📡 Ready to scan</p>
                <p style={{ fontSize: '0.82rem', marginTop: '0.3rem', opacity: 0.6 }}>Press &quot;Scan with Camera&quot; or paste a ticket code above</p>
              </div>
            )}
          </div>
        )}
      </>
        )}
    </div>
    </div >
  );
};

export default CollegeDashboard;
