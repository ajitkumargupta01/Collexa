import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Ticket } from 'lucide-react';

const StudentDashboard = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTickets = useCallback(async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/tickets/my`, {
        headers: { 'user-id': user.id }
      });
      setTickets(data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  return (
    <div className="dash-section glass animate-slide-up delay-100">
      <div className="flex items-center gap-1 mb-2">
        <div className="icon-wrapper" style={{marginBottom: 0}}><Ticket size={24} /></div>
        <h2>My Event Passes</h2>
      </div>

      {loading ? (
        <p>Loading passes...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center p-3">
          <p className="text-muted mb-2">You haven't purchased any event passes yet.</p>
          <a href="/events" className="btn btn-primary">Browse City Events</a>
        </div>
      ) : (
        <div className="events-list mt-2">
          {tickets.map(t => (
            <div key={t._id} className="event-item mb-1 p-2 rounded flex justify-between items-center">
              <div>
                <h3 className="font-display text-primary">{t.eventId?.title || 'Unknown Event'}</h3>
                <p className="text-sm text-muted">Purchased: {new Date(t.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className={`status-badge ${t.status}`}>{t.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
