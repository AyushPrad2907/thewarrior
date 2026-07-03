import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Success.css';

const Success = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Update user data to reflect new purchase status
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getMe();
        updateUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [updateUser]);

  return (
    <div className="success-container">
      <div className="success-card glass">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Payment Submitted Successfully!</h1>
        <p className="success-message">
          Your payment has been submitted and is pending verification. 
          You will be able to access the book once the payment is approved by our admin team.
        </p>

        <div className="success-info">
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <div className="info-text">
              <strong>Verification Time</strong>
              <p>Usually within 24 hours</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📧</span>
            <div className="info-text">
              <strong>Notification</strong>
              <p>You'll receive an email when approved</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📖</span>
            <div className="info-text">
              <strong>Access</strong>
              <p>Book will unlock automatically</p>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/referrals" className="btn btn-secondary">
            View Referrals
          </Link>
        </div>

        <p className="success-note">
          Need help? Contact us at <a href="mailto:support@warrior.com">support@warrior.com</a>
        </p>
      </div>
    </div>
  );
};

export default Success;
