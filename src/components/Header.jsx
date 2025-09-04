// components/Header/Header.js
import './Header.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hideMenu = location.pathname.startsWith('/admin');

  useEffect(() => {
    const loggedIn = localStorage.getItem('clientLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('clientLoggedIn');
      localStorage.removeItem('clientPhone');
      localStorage.removeItem('complaintUser');
      setIsLoggedIn(false);
      setMenuOpen(false);
      navigate('/');
    }
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Complaint Management Portal</h1>
        <p>Medionics Imaging Limited / Meditel Private Limited</p>
      </div>

      {/* Desktop Menu */}
      {!hideMenu && isLoggedIn && (
        <nav className="user-menu desktop-menu">
          <ul>
            <li><button onClick={() => navigate('/dashboard')}>📊 Dashboard</button></li>
            <li><button onClick={() => navigate('/complaint')}>📝 Submit Complaint</button></li>
            <li><button onClick={handleLogout} className="logout-btn">🔐 Logout</button></li>
          </ul>
        </nav>
      )}

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

        {!hideMenu && isLoggedIn && (
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
      {!hideMenu && isLoggedIn && menuOpen && (
        <nav className="user-menu mobile-menu open">
          <ul>
            <li onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
              <span>📊 Dashboard</span>
            </li>
            <li onClick={() => { navigate('/complaint'); setMenuOpen(false); }}>
              <span>📝 Submit Complaint</span>
            </li>
            <li onClick={handleLogout}>
              <span>🔐 Logout</span>
            </li>
          </ul>
        </nav>
      )}

      {!hideMenu && menuOpen && (
        <div className="menu-overlay active" onClick={toggleMenu}></div>
      )}
    </header>
  );
}

export default Header;