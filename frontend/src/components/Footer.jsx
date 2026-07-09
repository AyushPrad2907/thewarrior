import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/referrals">Referrals</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Support</h4>
          <ul className="footer-links">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><a href="mailto:support@warrior.com">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><a href="mailto:support@warrior.com?subject=Privacy%20Policy">Privacy Policy</a></li>
            <li><a href="mailto:support@warrior.com?subject=Terms%20of%20Service">Terms of Service</a></li>
            <li><a href="mailto:support@warrior.com?subject=Refund%20Policy">Refund Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 THE WARRIOR IN YOU. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
