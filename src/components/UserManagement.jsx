// components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/fetchAllComplaint');
      if (!res.ok) throw new Error('Failed to fetch users');

      const data = await res.json();

      // Extract unique users from complaints or use data.users
      const uniqueUsers = Array.from(
        new Map(
          (data.users || data.complaints).map(u => [u.phone_number, u])
        ).values()
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Fetch users error:', error);
      alert('Failed to load user data.');
    }
  };

  // Format date in UTC+6 with readable format
const formatDateTimeUTC6 = (isoString) => {
  if (!isoString) return '—';

  // Create a date from ISO string (assumes UTC if 'Z' is present)
  const date = new Date(isoString);

  // Format in Dhaka (UTC+6) timezone
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Dhaka', // ✅ Force Bangladesh time
    hour12: true
  }).format(date);
};

  return (
    <section id="user-management">
      <h2>User Management</h2>
      <p>Manage all registered clients.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#005566', color: 'white' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Phone</th>
            <th style={{ padding: '10px' }}>Hospital</th>
            <th style={{ padding: '10px' }}>Email</th>
            <th style={{ padding: '10px' }}>Address</th>
            <th style={{ padding: '10px' }}>Hospital Contact</th>
            <th style={{ padding: '10px' }}>Joined (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr key={u.phone_number} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{u.complainant_name}</td>
                <td style={{ padding: '10px' }}>{u.phone_number}</td>
                <td style={{ padding: '10px' }}>{u.hospital_name}</td>
                <td style={{ padding: '10px' }}>{u.email || '—'}</td>
                <td style={{ padding: '10px' }}>
                  {u.address_house}, {u.address_area}, {u.address_district}, {u.postal_code}
                </td>
                <td style={{ padding: '10px' }}>{u.hospital_contact}</td>
                <td style={{ padding: '10px' }}>{formatDateTimeUTC6(u.created_at)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default UserManagement;