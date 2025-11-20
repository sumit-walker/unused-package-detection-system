import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import '../styles/Navbar.css';

function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🔍 Unused Package Detector
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/security" className="nav-link">Security</Link>
          </li>
          <li className="nav-item">
            <Link to="/report" className="nav-link">Report</Link>
          </li>
          <li className="nav-item">
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle theme">
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
