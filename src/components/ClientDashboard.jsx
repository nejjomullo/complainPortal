// components/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ClientDashboard() {
  const [userData, setUserData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const phone = localStorage.getItem('clientPhone');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('clientLoggedIn') === 'true';
    if (!isLoggedIn || !phone) {
      navigate('/');
      return;
    }

    fetchUserData();
  }, [navigate, phone]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`https://api.holoapp.tech:3000/api/fetchUserComplaints/${phone}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();

      const user = data.user;
      const complaints = Array.isArray(data.complaints) ? data.complaints : [];

      // Save full user data
      localStorage.setItem('complaintUser', JSON.stringify(user));

      setUserData(user);
      setComplaints(complaints);

      // Build notifications based on rules
      const notifs = complaints
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .filter(c => {
          // ✅ Only show if status is NOT submitted OR client_notification = 1
          return c.status !== 'submitted' || c.client_notification === 1;
        })
        .map(c => {
          let message = '';
          if (c.status === 'viewed') {
            message = 'Your complaint has been viewed.';
          } else if (c.status === 'pending') {
            message = `Your complaint is delayed: ${c.pending_reason || 'No reason provided.'}`;
          } else if (c.status === 'solved') {
            message = 'Your issue has been resolved.';
          }

          return {
            id: c.id,
            message,
            status: c.status,
            equipment: c.equipment,
            createdAt: c.created_at,
            isActive: c.client_notification === 1,
          };
        });

      setNotifications(notifs);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load your data. Please try again.');
      navigate('/');
    }
  };

  // Reset notification for a specific complaint
  const markNotificationAsRead = async (complaintId) => {
    try {
      await fetch(`https://api.holoapp.tech:3000/api/resetClientNotification/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      // Update UI: mark as inactive
      setNotifications(prev =>
        prev.map(n => (n.id === complaintId ? { ...n, isActive: false } : n))
      );
    } catch (err) {
      console.error('Failed to reset notification:', err);
      alert('Could not mark notification as read. Please try again.');
    }
  };

  const handleNewComplaint = () => navigate('/complaint');

  const formatTime = (isoString) => {
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka',
    }).format(new Date(isoString));
  };

  return (
    <section id="client-dashboard">
      <h2>Client Dashboard</h2>
      <h3>Welcome, {userData?.complainant_name || 'User'}</h3>
      <button onClick={handleNewComplaint} className="submit-btn">
        Submit New Complaint
      </button>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <section
          style={{
            marginTop: '30px',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#d1ecf1',
          }}
        >
          <h4>🔔 Notifications</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((n) => (
              <li
                key={n.id}
                style={{
                  background: n.isActive ? '#fff3cd' : '#fff', // yellow if active
                  margin: '6px 0',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  border: n.isActive ? '1px solid #ffeaa7' : '1px solid #ddd',
                }}
              >
                <div>
                  <strong>{n.equipment}</strong>: {n.message}
                  <br />
                  <small style={{ color: '#666' }}>{formatTime(n.createdAt)}</small>
                </div>
                {n.isActive && (
                  <button
                    onClick={() => markNotificationAsRead(n.id)}
                    style={{
                      padding: '4px 8px',
                      background: '#d9534f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginLeft: '10px',
                      marginTop: '2px',
                    }}
                  >
                    Mark Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Complaint History */}
      <h4>Your Complaint History</h4>
      {complaints.length > 0 ? (
        <table
          className="complaints-table"
          style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}
        >
          <thead>
            <tr style={{ backgroundColor: '#005566', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Equipment</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Group Head</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{c.id}</td>
                <td style={{ padding: '10px' }}>{c.equipment}</td>
                <td style={{ padding: '10px' }}>{c.complaint}</td>
                <td style={{ padding: '10px' }}>{c.group_head}</td>
                <td style={{ padding: '10px' }}>
                  {c.status === 'submitted' && (
                    <span style={{ background: '#e2e3e5', padding: '4px', borderRadius: '4px' }}>
                      Submitted
                    </span>
                  )}
                  {c.status === 'viewed' && (
                    <span style={{ background: '#d1ecf1', padding: '4px', borderRadius: '4px' }}>
                      Viewed
                    </span>
                  )}
                  {c.status === 'pending' && (
                    <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px', borderRadius: '4px' }}>
                      Pending
                    </span>
                  )}
                  {c.status === 'solved' && (
                    <span style={{ background: '#d4edda', color: '#155724', padding: '4px', borderRadius: '4px' }}>
                      Solved
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px' }}>{formatTime(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No complaints submitted yet.</p>
      )}
    </section>
  );
}

export default ClientDashboard;