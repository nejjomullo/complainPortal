// components/ClientRegistration.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function ClientRegistration({ setRegistrationData }) {
  const [formData, setFormData] = useState({
    complainantName: '',
    phoneNumber: '',
    whatsappLink: false,
    email: '',
    hospitalName: '',
    houseRoad: '',
    areaThana: '',
    district: '',
    postalCode: '',
    hospitalContact: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));

    if (name === 'password' || name === 'confirmPassword') {
      const temp = { ...formData, [name]: value };
      setPasswordMatch(
        temp.password && temp.confirmPassword
          ? temp.password === temp.confirmPassword
          : null
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      setPasswordMatch(false);
      return;
    }

    const payload = {
      complainant_name: formData.complainantName,
      phone_number: formData.phoneNumber,
      whatsapp_linked: formData.whatsappLink ? 1 : 0,
      email: formData.email || '',
      hospital_name: formData.hospitalName,
      address_house: formData.houseRoad,
      address_area: formData.areaThana,
      address_district: formData.district,
      postal_code: formData.postalCode,
      hospital_contact: formData.hospitalContact || '',
      password: formData.password,
    };

    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/complainUserRegistration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (setRegistrationData) setRegistrationData(payload);
      localStorage.setItem('complaintUser', JSON.stringify(data.user || payload));
      alert('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      alert('Error: ' + error.message);
      console.error('Registration error:', error);
    }
  };

  return (
    <section id="clientregistration">
      <h2>Client Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="formgroup">
          <label htmlFor="complainantname">Name *</label>
          <input
            type="text"
            id="complainantname"
            name="complainantName"
            value={formData.complainantName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="phonenumber">Phone Number *</label>
          <input
            type="tel"
            id="phonenumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          <div className="whatsapp-checkbox-grid">
            <input
              type="checkbox"
              id="whatsapplink"
              name="whatsappLink"
              checked={formData.whatsappLink}
              onChange={handleChange}
            />
            <label htmlFor="whatsapplink">Link to WhatsApp</label>
          </div>
        </div>
        <div className="formgroup">
          <label htmlFor="email">Email (Optional)</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="formgroup">
          <label htmlFor="hospitalname">Name of Hospital/Clinic *</label>
          <input
            type="text"
            id="hospitalname"
            name="hospitalName"
            value={formData.hospitalName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="houseroad">House/Road/Block/Sector *</label>
          <input
            type="text"
            id="houseroad"
            name="houseRoad"
            placeholder="House/Road/Block/Sector"
            value={formData.houseRoad}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="areathana">Area/Thana/Upazila *</label>
          <input
            type="text"
            id="areathana"
            name="areaThana"
            placeholder="Area/Thana/Upazila"
            value={formData.areaThana}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="district">District *</label>
          <input
            type="text"
            id="district"
            name="district"
            placeholder="District"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="postalcode">Postal Code *</label>
          <input
            type="text"
            id="postalcode"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="hospitalcontact">Hospital Contact Number *</label>
          <input
            type="tel"
            id="hospitalcontact"
            name="hospitalContact"
            value={formData.hospitalContact}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="formgroup">
          <label htmlFor="confirmpassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmpassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {passwordMatch !== null && (
            <span className={`passwordmatchindicator ${passwordMatch ? 'match' : 'nomatch'}`}>
              {passwordMatch ? '✅ Passwords match' : '❌ Passwords do not match'}
            </span>
          )}
        </div>
        <button type="submit" className="submit-btn">Register</button>
      </form>
      <Link to="/" className="navlink">Already have an account? Login here</Link>
    </section>
  );
}

export default ClientRegistration;