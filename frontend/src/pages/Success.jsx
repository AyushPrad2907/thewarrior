import { useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import html2canvas from 'html2canvas';
import './Success.css';

const Success = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const receiptRef = useRef(null);

  const paymentData = location.state;

  useEffect(() => {
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

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSaveAsImage = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#111111',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `TheWarrior_Receipt_${paymentData?.payment?.utrNumber || 'payment'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to save receipt:', err);
    }
  };

  const handleShareReceipt = async () => {
    const text = paymentData
      ? `🧾 TheWarrior Payment Receipt\n\n📖 Book: ${paymentData.bookTitle}\n✍️ Author: ${paymentData.bookAuthor}\n💰 Amount: ₹${paymentData.bookPrice}\n🔢 UTR: ${paymentData.payment?.utrNumber || 'N/A'}\n👤 Paid By: ${paymentData.userName}\n📅 Date: ${formatDate(paymentData.payment?.submittedAt)}\n📌 Status: Pending Approval`
      : 'I just submitted a payment on TheWarrior! 🚀';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Payment Receipt - TheWarrior', text });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert('Receipt details copied to clipboard!');
      } catch {
        console.error('Copy failed');
      }
    }
  };

  // Fallback if no payment data (direct URL access)
  if (!paymentData) {
    return (
      <div className="success-container">
        <div className="success-card glass">
          <div className="success-checkmark">✓</div>
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
                <p>Check your dashboard for updates</p>
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
  }

  return (
    <div className="success-container">
      <div className="success-card glass">
        <div className="success-checkmark">✓</div>
        <h1 className="success-title">Payment Submitted Successfully!</h1>
        <p className="success-message">
          Your payment is being verified. Here's your receipt:
        </p>

        {/* Receipt Card */}
        <div className="receipt-card" ref={receiptRef}>
          <div className="receipt-header">
            <div className="receipt-logo">🧾</div>
            <div className="receipt-header-text">
              <h2>PAYMENT RECEIPT</h2>
              <span className="receipt-brand">TheWarrior</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-rows">
            <div className="receipt-row">
              <span className="receipt-label">📖 Book</span>
              <span className="receipt-value">{paymentData.bookTitle}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">✍️ Author</span>
              <span className="receipt-value">{paymentData.bookAuthor}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">💰 Amount</span>
              <span className="receipt-value receipt-amount">₹{paymentData.bookPrice}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">🔢 UTR Number</span>
              <span className="receipt-value receipt-utr">{paymentData.payment?.utrNumber || 'N/A'}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">👤 Paid By</span>
              <span className="receipt-value">{paymentData.userName}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">📅 Date & Time</span>
              <span className="receipt-value">{formatDate(paymentData.payment?.submittedAt)}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-status-row">
            <span className="receipt-status-badge">⏳ Pending Approval</span>
          </div>

          <p className="receipt-footer-note">
            This receipt will be updated once your payment is verified by our team.
          </p>
        </div>

        {/* Receipt Actions */}
        <div className="receipt-actions">
          <button onClick={handleSaveAsImage} className="btn receipt-save-btn">
            📥 Save as Image
          </button>
          <button onClick={handleShareReceipt} className="btn receipt-share-btn">
            <svg className="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share Receipt
          </button>
        </div>

        {/* Navigation */}
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
