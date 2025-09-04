// components/GroupHeadDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GroupHeadDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    equipment: '',
    status: '',
    phone: '',
    complainantName: '',
    hospitalName: '',
  });
  const [delayModal, setDelayModal] = useState(null); // { id, pending_reason }
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Get group head from localStorage
  const group = localStorage.getItem('groupHeadLoggedIn');
  if (!group) navigate('/group-head-login');

  const GROUP_NAMES = {
    'CT': 'CT Group Head',
    'MRI': 'MRI Group Head',
    'CR': 'CR Group Head',
    'USG': 'USG Group Head'
  };

  const EQUIPMENT_TO_GROUP = {
    'CT': 'CT', 'BMD': 'CT',
    'MRI': 'MRI',
    'X-Ray': 'CR', 'CR': 'CR', 'FPD': 'CR', 'Printer': 'CR',
    'Ultrasound': 'USG'
  };

  const GROUP_EQUIPMENTS = {
    'CT': ['CT', 'BMD'],
    'MRI': ['MRI'],
    'CR': ['X-Ray', 'CR', 'FPD', 'Printer'],
    'USG': ['Ultrasound']
  };

  useEffect(() => {
    fetchComplaints();
  }, [group]);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/fetchAllComplaint', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch complaints');
      const data = await res.json();

      // Merge user data
      const merged = data.complaints.map(c => {
        const user = data.users?.find(u => u.phone_number === c.phone_number) || {};
        return {
          ...c,
          complainant_name: user.complainant_name || 'Unknown',
          hospital_name: user.hospital_name || 'Unknown',
          hospital_contact: user.hospital_contact || 'N/A',
        };
      });

      // Filter by group head
      const groupHeadComplaints = merged.filter(c => {
        const assignedGroup = EQUIPMENT_TO_GROUP[c.equipment];
        return assignedGroup === group;
      });

      setComplaints(groupHeadComplaints);
      setFilteredComplaints(groupHeadComplaints);

      // ✅ Build notifications: last 10 submitted complaints for this group head
      const notifs = groupHeadComplaints
        .filter(c => c.status === 'submitted')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(c => ({
          id: c.id,
          complainant_name: c.complainant_name,
          equipment: c.equipment,
          createdAt: c.created_at,
          isActive: c.group_head_notification === 1,
        }));

      setNotifications(notifs);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to load complaints.');
    }
  };

  // ✅ Reset group head notification
  const markNotificationAsRead = async (complaintId) => {
    try {
      await fetch(`https://api.holoapp.tech:3000/api/resetGroupHeadNotificationById/${complaintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      // Update UI: mark as inactive
      setNotifications(prev =>
        prev.map(n => (n.id === complaintId ? { ...n, isActive: false } : n))
      );
    } catch (err) {
      console.error('Failed to reset group head notification:', err);
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

  // ✅ Format date in UTC+6 (Bangladesh Time)
  const formatTimeUTC6 = (isoString) => {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Dhaka',
      hour12: true
    }).format(new Date(isoString));
  };

  // Mark as viewed
  const markAsViewed = async (id) => {
    if (!window.confirm("Mark this complaint as viewed?")) return;

    try {
      const res = await fetch(`https://api.holoapp.tech:3000/api/updateComplaintViewed/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to mark as viewed');
      }

      await fetchComplaints(); // ✅ Refresh from server
      alert('✅ Complaint marked as viewed. Client notified.');
    } catch (error) {
      console.error('View error:', error);
      alert('❌ Failed to mark as viewed: ' + error.message);
    }
  };

  // Mark as solved
const markAsSolved = async (id) => {
  if (!window.confirm("Mark this complaint as solved?")) return;

  try {
    const res = await fetch(`https://api.holoapp.tech:3000/api/updateComplaintSolved/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // ✅ No body needed — server handles status and timestamp
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to mark as solved');
    }

    await fetchComplaints(); // ✅ Refresh from server
    alert('✅ Complaint marked as solved. Client notified.');
  } catch (error) {
    console.error('Solve error:', error);
    alert('❌ Failed to mark as solved: ' + error.message);
  }
};

  // Open delay modal
  const openDelayModal = (id, currentReason = '') => {
    setDelayModal({ id, pending_reason: currentReason });
  };

  // Save delay reason
const saveDelayReason = async () => {
  const { id, pending_reason } = delayModal;
  if (!pending_reason || pending_reason.trim() === '') {
    alert('Please enter a delay reason.');
    return;
  }
  if (!window.confirm("Save this delay reason?")) return;

  try {
    const res = await fetch(`https://api.holoapp.tech:3000/api/updateComplaintPending/${id}`, {
      method: 'PUT', // ✅ Use PUT
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pending_reason }) // ✅ Only send reason
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to save delay');
    }

    await fetchComplaints();
    setDelayModal(null);
    alert('✅ Delay reason saved. Client notified.');
  } catch (error) {
    console.error('Delay error:', error);
    alert('❌ Failed to save delay reason: ' + error.message);
  }
};

  // Get equipment options for current group
  const equipmentOptions = GROUP_EQUIPMENTS[group] || [];

  return (
    <section id="group-head-dashboard">
      <h2>{GROUP_NAMES[group]} Dashboard</h2>

      {/* ✅ Notifications Panel */}
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
                    {n.complainant_name} • {n.equipment} • {formatTimeUTC6(n.createdAt)}
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
            {equipmentOptions.map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
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
          <button onClick={handleReset} style={{ padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <h3>Your Complaints</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#005566', color: 'white' }}>
              <th style={{ minWidth: '120px' }}>Complainant</th>
              <th style={{ minWidth: '120px' }}>Phone</th>
              <th style={{ minWidth: '150px' }}>Organization</th>
              <th style={{ minWidth: '100px' }}>Equipment</th>
              <th style={{ minWidth: '200px' }}>Description</th>
              <th style={{ minWidth: '150px' }}>Submitted At</th>
              <th style={{ minWidth: '120px' }}>Status</th>
              <th style={{ minWidth: '150px' }}>Delay Reason</th>
              <th style={{ minWidth: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{c.complainant_name}</td>
                <td style={{ padding: '10px' }}>{c.phone_number}</td>
                <td style={{ padding: '10px' }}>{c.hospital_name}</td>
                <td style={{ padding: '10px' }}>{c.equipment}</td>
                <td style={{ padding: '10px' }}>{c.complaint}</td>
                <td style={{ padding: '10px' }}>{formatTimeUTC6(c.created_at)}</td>
                <td style={{ textAlign: 'center', padding: '10px' }}>
                  {c.status === 'submitted' && (
                    <div style={{ background: '#e2e3e5', padding: '6px', borderRadius: '4px' }}>Submitted</div>
                  )}
                  {c.status === 'viewed' && (
                    <div style={{ background: '#d1ecf1', padding: '6px', borderRadius: '4px' }}>
                      Viewed<br />
                      <small>{formatTimeUTC6(c.viewed_at)}</small>
                    </div>
                  )}
                  {c.status === 'pending' && (
                    <div style={{ background: '#f8d7da', color: '#721c24', padding: '6px', borderRadius: '4px' }}>
                      Pending<br />
                      <small>{formatTimeUTC6(c.pending_at)}</small>
                    </div>
                  )}
                  {c.status === 'solved' && (
                    <div style={{ background: '#d4edda', color: '#155724', padding: '6px', borderRadius: '4px' }}>
                      Solved<br />
                      <small>{formatTimeUTC6(c.solved_at)}</small>
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px' }}>{c.pending_reason || '—'}</td>
                <td style={{ padding: '10px' }}>
                  {c.status === 'submitted' && (
                    <>
                      <button onClick={() => markAsViewed(c.id)} style={{ margin: '4px' }}>👁 View</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>⏸ Delay</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>✅ Solved</button>
                    </>
                  )}
                  {c.status === 'viewed' && (
                    <>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>👁 View</button>
                      <button onClick={() => openDelayModal(c.id, c.pending_reason)} style={{ margin: '4px' }}>⏸ Delay</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>✅ Solved</button>
                    </>
                  )}
                  {c.status === 'pending' && (
                    <>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>👁 View</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>⏸ Delay</button>
                      <button onClick={() => markAsSolved(c.id)} style={{ margin: '4px' }}>✅ Solved</button>
                    </>
                  )}
                  {c.status === 'solved' && (
                    <>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>👁 View</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>⏸ Delay</button>
                      <button disabled style={{ margin: '4px', opacity: 0.5, cursor: 'not-allowed' }}>✅ Solved</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delay Modal */}
      {delayModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Enter Delay Reason</h3>
            <textarea
              value={delayModal.pending_reason}
              onChange={e => setDelayModal({ ...delayModal, pending_reason: e.target.value })}
              placeholder="Enter reason..."
              style={{ width: '100%', height: '100px' }}
            />
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#555' }}>
              <p><strong>Pre-written:</strong></p>
              <ul>
                <li onClick={() => setDelayModal({ ...delayModal, pending_reason: "Quotation submitted and yet to be confirmed by the client" })} style={{ cursor: 'pointer' }}>Quotation submitted...</li>
                <li onClick={() => setDelayModal({ ...delayModal, pending_reason: "Replacement is yet to arrive" })} style={{ cursor: 'pointer' }}>Replacement is yet to arrive</li>
                <li onClick={() => setDelayModal({ ...delayModal, pending_reason: "Pending client’s approval" })} style={{ cursor: 'pointer' }}>Pending client’s approval</li>
              </ul>
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button onClick={() => setDelayModal(null)} style={{ marginRight: '10px' }}>Cancel</button>
              <button onClick={saveDelayReason}>Save</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GroupHeadDashboard;