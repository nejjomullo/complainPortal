// components/AdminHeader.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine role
  const isAdmin = location.pathname.startsWith('/admin') && localStorage.getItem('adminLoggedIn') === 'true';
  const isGroupHead = location.pathname.startsWith('/group-head') && localStorage.getItem('groupHeadLoggedIn');
  const isLoggedIn = isAdmin || isGroupHead;

const handleLogout = () => {
  if (window.confirm("Are you sure you want to log out?")) {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('groupHeadLoggedIn');

    if (isAdmin) {
      navigate('/admin-login');
    } else if (isGroupHead) {
      navigate('/group-head-login');
    } else {
      navigate('/'); // fallback if neither
    }
  }
};


  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Admin / Group Head Portal</h1>
        <p>Medionics Imaging Limited / Meditel Private Limited</p>
      </div>

      <div className="header-right">
        <div className="header-contact">
          <a
            href="https://wa.me/+8801234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            Helpline: +8801234567890
          </a>
          <p className="helpline-note">
            Available: 09:00 AM – 05:00 PM. Message us outside hours.
          </p>
        </div>

        {/* Desktop Menu */}
        {isLoggedIn && (
          <nav className="user-menu desktop-menu">
            <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0 }}>
              {isAdmin && (
                <>
                  <li><button onClick={() => navigate('/admin')}>📋 Complaints</button></li>
                  <li><button onClick={() => navigate('/admin/users')}>👥 Users</button></li>
                </>
              )}
              <li><button onClick={handleLogout} className="logout-btn">🔐 Logout</button></li>
            </ul>
          </nav>
        )}

        {/* Hamburger Toggle */}
        {isLoggedIn && (
          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isLoggedIn && menuOpen && (
        <nav className="user-menu mobile-menu open">
          <ul>
            {isAdmin && (
              <>
                <li onClick={() => { navigate('/admin'); setMenuOpen(false); }}>
                  <span>📋 Complaints</span>
                </li>
                <li onClick={() => { navigate('/admin/users'); setMenuOpen(false); }}>
                  <span>👥 Users</span>
                </li>
              </>
            )}
            <li onClick={handleLogout}>
              <span>🔐 Logout</span>
            </li>
          </ul>
        </nav>
      )}

      {/* Overlay */}
      {menuOpen && (
        <div className="menu-overlay active" onClick={toggleMenu}></div>
      )}
    </header>
  );
}

export default AdminHeader;