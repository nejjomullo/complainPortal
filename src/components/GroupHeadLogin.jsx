// components/GroupHeadLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Group Head credentials
const GROUP_HEADS = {
  'CT': { username: 'CTHead', password: 'ct123' },
  'MRI': { username: 'MRIHead', password: 'mri123' },
  'CR': { username: 'CRHead', password: 'cr123' },
  'USG': { username: 'USGHead', password: 'usg123' }
};

// Equipment → Group Head mapping
const EQUIPMENT_TO_GROUP = {
  'CT': 'CT', 'BMD': 'CT',
  'MRI': 'MRI',
  'X-Ray': 'CR', 'CR': 'CR', 'FPD': 'CR', 'Printer': 'CR',
  'Ultrasound': 'USG'
};

function GroupHeadLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = formData;

    const group = Object.keys(GROUP_HEADS).find(
      g => GROUP_HEADS[g].username === username && GROUP_HEADS[g].password === password
    );

    if (group) {
      alert(`✅ ${group} Group Head login successful!`);
      localStorage.setItem('groupHeadLoggedIn', group);
      navigate('/group-head-dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <section id="group-head-login">
      <h2>Group Head Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
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
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>

{/*      <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>
        <h4>Group Head Credentials:</h4>
        <ul>
          <li><strong>CT Group Head:</strong> CTHead / ct123</li>
          <li><strong>MRI Group Head:</strong> MRIHead / mri123</li>
          <li><strong>CR Group Head:</strong> CRHead / cr123</li>
          <li><strong>USG Group Head:</strong> USGHead / usg123</li>
        </ul>
      </div>
*/}    </section>
  );
}

export default GroupHeadLogin;