import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-icon">⚔️</span>
          <span className="logo-copy">
            <span className="logo-text">THE WARRIOR IN YOU</span>
            <span className="logo-tag">Read. Grow. Rise.</span>
          </span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
              <Link to="/referrals" className="nav-link" onClick={closeMenu}>Referrals</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link admin-link" onClick={closeMenu}>Admin Panel</Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
              <Link to="/signup" className="btn btn-primary nav-cta" onClick={closeMenu}>Join Now</Link>
            </>
          )}
        </div>

        <button
          className={`mobile-menu-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
