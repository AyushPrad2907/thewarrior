import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚔️</span>
          <span className="logo-text">THE WARRIOR</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/referrals" className="nav-link">Referrals</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link admin-link">Admin Panel</Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="btn btn-primary nav-cta">Join Now</Link>
            </>
          )}
        </div>

        <button className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
