import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Building2, Plus } from 'lucide-react';

const CollegeDashboard = ({ user }) => {
  const [quotes, setQuotes] = useState([]);

  const fetchQuotes = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/quotations/college', {
        headers: { 'user-id': user.id }
      });
      setQuotes(data.data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  return (
    <div className="dash-section glass animate-slide-up delay-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <div className="icon-wrapper" style={{marginBottom: 0}}><Building2 size={24} /></div>
          <h2>College Actions & Management</h2>
        </div>
        <button className="btn btn-primary flex gap-1 items-center">
          <Plus size={18} /> Create Event
        </button>
      </div>

      <div className="grid gap-2">
        <div className="glass p-2 rounded">
          <h3 className="font-display text-secondary mb-1">Incoming Organizer Quotations</h3>
          {quotes.length === 0 ? (
            <p className="text-muted">No organizer quotations received yet.</p>
          ) : (
             <div className="events-list">
               {quotes.map(q => (
                 <div key={q._id} className="event-item p-1 mb-1 rounded">
                   <p className="font-bold">{q.organizerId?.name || 'Unknown Organizer'}</p>
                   <p className="text-sm">For Event: {q.eventId?.title || 'Unknown Event'}</p>
                   <p className="text-sm text-primary font-bold">Proposed: ${q.proposedPrice}</p>
                   <p className="text-xs text-muted mb-1 mt-1">"{q.message}"</p>
                   <div className="flex gap-1">
                     <button className="btn btn-primary text-sm" style={{padding: '0.4rem 0.8rem'}}>Accept</button>
                     <button className="btn btn-secondary text-sm" style={{padding: '0.4rem 0.8rem'}}>Reject</button>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDashboard;
