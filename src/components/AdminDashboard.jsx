// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    equipment: '',
    groupHead: '',
    status: '',
    phone: '',
    complainantName: '',
    hospitalName: '',
  });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }

    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/fetchAllComplaint', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch complaints');
      const data = await res.json();

      const merged = data.complaints.map(c => {
        const user = data.users?.find(u => u.phone_number === c.phone_number) || {};
        return {
          ...c,
          complainant_name: user.complainant_name || 'Unknown',
          hospital_name: user.hospital_name || 'Unknown',
          hospital_contact: user.hospital_contact || 'N/A',
        };
      });

      setComplaints(merged);
      setFilteredComplaints(merged);

      // Build notifications: last 10 submitted complaints
      const notifs = merged
        .filter(c => c.status === 'submitted')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          complainant_name: c.complainant_name,
          equipment: c.equipment,
          createdAt: c.created_at,
          isActive: c.admin_notification === 1,
        }));

      setNotifications(notifs);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load complaints. Please try again.');
    }
  };

  // Reset admin notification for a specific complaint
  const markNotificationAsRead = async (complaintId) => {
    try {
      await fetch(`https://api.holoapp.tech:3000/api/resetAdminNotificationById/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      // Update UI: mark as inactive
      setNotifications(prev =>
        prev.map(n => (n.id === complaintId ? { ...n, isActive: false } : n))
      );
    } catch (err) {
      console.error('Failed to reset admin notification:', err);
      alert('Could not mark as read. Please try again.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      equipment: '',
      groupHead: '',
      status: '',
      phone: '',
      complainantName: '',
      hospitalName: '',
    });
    setFilteredComplaints(complaints);
  };

  useEffect(() => {
    let result = complaints;

    if (filters.equipment) result = result.filter(c => c.equipment === filters.equipment);
    if (filters.groupHead) result = result.filter(c => c.group_head === filters.groupHead);
    if (filters.status) result = result.filter(c => c.status === filters.status);
    if (filters.phone) result = result.filter(c => c.phone_number.includes(filters.phone));
    if (filters.complainantName) result = result.filter(c =>
      c.complainant_name.toLowerCase().includes(filters.complainantName.toLowerCase())
    );
    if (filters.hospitalName) result = result.filter(c =>
      c.hospital_name.toLowerCase().includes(filters.hospitalName.toLowerCase())
    );

    setFilteredComplaints(result);
  }, [filters, complaints]);

  // ✅ Format date in Bangladesh time (UTC+6)
  const formatTime = (isoString) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Dhaka',
      hour12: true,
    }).format(new Date(isoString));
  };

  return (
    <section id="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Notifications Panel */}
      {notifications.length > 0 && (
        <section
          style={{
            marginTop: '20px',
            border: '1px solid #bee5eb',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: '#d1ecf1',
          }}
        >
          <h4>🔔 New Complaints</h4>
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
                  <strong>New complaint arrived: #{n.id}</strong>
                  <br />
                  <small style={{ color: '#666' }}>
                    {n.complainant_name} • {n.equipment} • {formatTime(n.createdAt)}
                  </small>
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

      {/* Filters */}
      <div className="analytics-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '20px', marginTop: '30px' }}>
        <div className="form-group">
          <label>Complainant Name</label>
          <input type="text" name="complainantName" value={filters.complainantName} onChange={handleFilterChange} placeholder="Search" />
        </div>
        <div className="form-group">
          <label>Organization Name</label>
          <input type="text" name="hospitalName" value={filters.hospitalName} onChange={handleFilterChange} placeholder="Search" />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" name="phone" value={filters.phone} onChange={handleFilterChange} placeholder="Search" />
        </div>
        <div className="form-group">
          <label>Equipment</label>
          <select name="equipment" value={filters.equipment} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="CT">CT</option>
            <option value="MRI">MRI</option>
            <option value="X-Ray">X-Ray</option>
            <option value="CR">CR</option>
            <option value="FPD">FPD</option>
            <option value="Printer">Printer</option>
            <option value="BMD">BMD</option>
            <option value="Ultrasound">Ultrasound</option>
          </select>
        </div>
        <div className="form-group">
          <label>Group Head</label>
          <select name="groupHead" value={filters.groupHead} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="CT">CT Group Head</option>
            <option value="MRI">MRI Group Head</option>
            <option value="CR">CR Group Head</option>
            <option value="USG">USG Group Head</option>
          </select>
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="submitted">Submitted</option>
            <option value="viewed">Viewed</option>
            <option value="pending">Pending</option>
            <option value="solved">Solved</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={handleReset} style={{ padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <h3>All Complaints</h3>
      <div className="complaints-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#005566', color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Complainant</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Organization</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Org Contact</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Equipment</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Group Head</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Submitted At</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Delay Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{c.id}</td>
                <td style={{ padding: '10px' }}>{c.complainant_name}</td>
                <td style={{ padding: '10px' }}>{c.phone_number}</td>
                <td style={{ padding: '10px' }}>{c.hospital_name}</td>
                <td style={{ padding: '10px' }}>{c.hospital_contact}</td>
                <td style={{ padding: '10px' }}>{c.equipment}</td>
                <td style={{ padding: '10px' }}>{c.complaint}</td>
                <td style={{ padding: '10px' }}>{c.group_head}</td>
                <td style={{ padding: '10px' }}>{formatTime(c.created_at)}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {c.status === 'submitted' && <div style={{ background: '#e2e3e5', borderRadius: '4px', padding: '6px' }}>Submitted</div>}
                  {c.status === 'viewed' && (
                    <div style={{ background: '#d1ecf1', borderRadius: '4px', padding: '6px' }}>
                      Viewed
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{formatTime(c.viewed_at)}</div>
                    </div>
                  )}
                  {c.status === 'pending' && (
                    <div style={{ background: '#f8d7da', color: '#721c24', borderRadius: '4px', padding: '6px' }}>
                      Pending
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{formatTime(c.pending_at)}</div>
                    </div>
                  )}
                  {c.status === 'solved' && (
                    <div style={{ background: '#d4edda', color: '#155724', borderRadius: '4px', padding: '6px' }}>
                      Solved
                      <div style={{ fontSize: '12px', marginTop: '4px' }}>{formatTime(c.solved_at)}</div>
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px', color: c.pending_reason ? 'black' : '#666' }}>
                  {c.pending_reason || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminDashboard;