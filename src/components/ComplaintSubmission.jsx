// components/ComplaintSubmission.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ComplaintSubmission({ registrationData, setRegistrationData }) {
  const [formData, setFormData] = useState({
    equipment: '',
    complaintDescription: '',
  });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = registrationData || JSON.parse(localStorage.getItem('complaintUser') || 'null');
    if (!savedUser) {
      alert('Please log in first.');
      navigate('/');
    } else {
      setUserData(savedUser);
    }
  }, [registrationData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Determine Group Head based on Equipment
  const getGroupHead = (equipment) => {
    if (!equipment) return '';
    const map = {
      CT: 'CT',
      BMD: 'CT',
      MRI: 'MRI',
      'X-Ray': 'CR',
      CR: 'CR',
      FPD: 'CR',
      Printer: 'CR',
      Ultrasound: 'USG'
    };
    return map[equipment] || 'Unknown';
  };

  const groupHead = getGroupHead(formData.equipment);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData || !formData.equipment || !formData.complaintDescription.trim()) {
      alert('Please fill all required fields.');
      return;
    }

    if (loading) return; // ✅ Prevent double submit

    setLoading(true);

    const payload = {
      phone_number: userData.phone_number,
      equipment: formData.equipment,
      complaint: formData.complaintDescription.trim(),
      group_head: groupHead,
    };

    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/saveComplaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      // ✅ Create new complaint object
      const newComplaint = {
        id: data.complaintId,
        phone_number: payload.phone_number,
        equipment: payload.equipment,
        complaint: payload.complaint,
        group_head: payload.group_head,
        created_at: new Date().toISOString(),
        status: 'submitted',
        viewed_at: null,
        pending_at: null,
        pending_reason: null,
        solved_at: null,
        client_notification: 1, // ✅ Client notified
        group_head_notification: 1, // ✅ Group head notified
        admin_notification: 1, // ✅ Admin notified
      };

      // ✅ Read from localStorage safely
      const savedUserStr = localStorage.getItem('complaintUser');
      let updatedUser;

      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          // ✅ Ensure complaints is an array
          const complaints = Array.isArray(savedUser.complaints) ? savedUser.complaints : [];
          updatedUser = {
            ...savedUser,
            complaints: [newComplaint, ...complaints]
          };
          localStorage.setItem('complaintUser', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Failed to parse user data:', err);
          // Fallback: create new user with only new complaint
          updatedUser = { ...userData, complaints: [newComplaint] };
          localStorage.setItem('complaintUser', JSON.stringify(updatedUser));
        }
      } else {
        updatedUser = { ...userData, complaints: [newComplaint] };
        localStorage.setItem('complaintUser', JSON.stringify(updatedUser));
      }

      // ✅ Update React context
      if (setRegistrationData) {
        setRegistrationData(updatedUser);
      }

      alert(`✅ Complaint submitted successfully! ID: #${data.complaintId}\n\nThank you! Your complaint has been received.`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p>Loading user data...</p>;

  return (
    <section id="complaint-submission">
      <h2>Complaint Submission</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name of Complainant *</label>
          <input value={userData.complainant_name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Contact Number *</label>
          <input value={userData.phone_number || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Hospital/Clinic Name *</label>
          <input value={userData.hospital_name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Full Address *</label>
          <input
            value={[
              userData.address_house,
              userData.address_area,
              userData.address_district,
              userData.postal_code
            ]
              .filter(Boolean)
              .join(', ') || 'Not provided'}
            readOnly
          />
        </div>
        <div className="form-group">
          <label>Hospital Contact Number *</label>
          <input value={userData.hospital_contact || ''} readOnly />
        </div>

        <div className="form-group">
          <label htmlFor="equipment">Equipment *</label>
          <select
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleChange}
            required
          >
            <option value="">Select Equipment</option>
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

        {formData.equipment && (
          <div className="form-group">
            <label>Group Head</label>
            <input
              value={groupHead}
              readOnly
              style={{ background: '#f0f0f0', fontWeight: 'bold' }}
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="complaintDescription">Complaint Description *</label>
          <textarea
            id="complaintDescription"
            name="complaintDescription"
            value={formData.complaintDescription}
            onChange={handleChange}
            required
            placeholder="Describe the issue in detail..."
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </section>
  );
}

export default ComplaintSubmission;