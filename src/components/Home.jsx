// components/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      phone_number: formData.phoneNumber,
      password: formData.password,
    };

    try {
      const res = await fetch('https://api.holoapp.tech:3000/api/complainUserLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // ✅ Only store isLoggedIn and phone number
      localStorage.setItem('clientLoggedIn', 'true');
      localStorage.setItem('clientPhone', data.user.phone_number);

      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Invalid phone or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="home">
      <h2>Welcome to the Complaint Management Portal</h2>
      <p>Medionics Imaging Limited / Meditel Private Limited</p>

      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="01712345678"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
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
          <div className="home-buttons">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <a href="/register" className="nav-link">
          Don't have an account? Register here
        </a>
      </div>
    </section>
  );
}

export default Home;