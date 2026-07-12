import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, paymentsAPI, authAPI, getBackendAssetUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState(() => JSON.parse(localStorage.getItem('dismissedApprovalNotifs') || '[]'));

  // UPI IDs States
  const [newUpi, setNewUpi] = useState('');
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [upiSuccess, setUpiSuccess] = useState('');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(user?.referralLink || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = user?.referralLink || '';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join TheWarrior!',
      text: `Hey! Check out TheWarrior — use my referral link to sign up and we both benefit! 🚀`,
      url: user?.referralLink || '',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share — no action needed
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      // Fallback: copy the link for browsers that don't support Web Share API
      handleCopyLink();
    }
  };

  const handleAddUpi = async (e) => {
    e.preventDefault();
    setUpiError('');
    setUpiSuccess('');

    if (!newUpi || !newUpi.trim()) {
      setUpiError('Please enter a valid UPI ID');
      return;
    }

    setUpiSubmitting(true);

    try {
      const response = await authAPI.addUpiId(newUpi);
      const updatedUser = { ...user, upiIds: response.data.upiIds };
      updateUser(updatedUser);
      setNewUpi('');
      setUpiSuccess('UPI ID added successfully!');
      setTimeout(() => setUpiSuccess(''), 3000);
    } catch (err) {
      setUpiError(err.response?.data?.message || 'Failed to add UPI ID');
    } finally {
      setUpiSubmitting(false);
    }
  };

  const handleDeleteUpi = async (upiIdToDelete) => {
    if (!window.confirm(`Are you sure you want to delete ${upiIdToDelete}?`)) {
      return;
    }

    setUpiError('');
    setUpiSuccess('');

    try {
      const response = await authAPI.deleteUpiId(upiIdToDelete);
      const updatedUser = { ...user, upiIds: response.data.upiIds };
      updateUser(updatedUser);
      setUpiSuccess('UPI ID deleted successfully!');
      setTimeout(() => setUpiSuccess(''), 3000);
    } catch (err) {
      setUpiError(err.response?.data?.message || 'Failed to delete UPI ID');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, paymentsRes] = await Promise.all([
        booksAPI.getAll(),
        paymentsAPI.getUserPayments()
      ]);
      setBooks(booksRes.data.books);
      setPayments(paymentsRes.data.payments);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return '';
    }
  };

  const handleDismissNotif = (paymentId) => {
    const updated = [...dismissedNotifs, paymentId];
    setDismissedNotifs(updated);
    localStorage.setItem('dismissedApprovalNotifs', JSON.stringify(updated));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const newlyApprovedPayments = payments.filter(p => 
    p.status === 'approved' && !dismissedNotifs.includes(p._id)
  );

  const rejectedPaymentsNotDismissed = payments.filter(p => 
    p.status === 'rejected' && !dismissedNotifs.includes(p._id)
  );

  const purchasedBooks = books.filter(book => 
    user?.purchasedBooks?.some(purchased => {
      if (typeof purchased === 'object' && purchased !== null) {
        return (purchased._id || purchased.id) === book._id;
      }
      return purchased === book._id;
    })
  );

  const unpurchasedBooks = books.filter(book => 
    !user?.purchasedBooks?.some(purchased => {
      if (typeof purchased === 'object' && purchased !== null) {
        return (purchased._id || purchased.id) === book._id;
      }
      return purchased === book._id;
    })
  );

  const getBookPaymentStatus = (bookId) => {
    const bookPayments = payments.filter(p => {
      const pBookId = typeof p.book === 'object' && p.book !== null ? (p.book._id || p.book.id) : p.book;
      return pBookId === bookId;
    });
    
    if (bookPayments.length === 0) return null;
    
    const pendingPayment = bookPayments.find(p => p.status === 'pending');
    if (pendingPayment) return 'pending';
    
    const sorted = [...bookPayments].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return sorted[0].status;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">Manage your ebooks and track your purchases</p>
      </div>

      {/* Approval Notification Banners */}
      {newlyApprovedPayments.length > 0 && (
        <div className="approval-banners">
          {newlyApprovedPayments.map(payment => (
            <div key={payment._id} className="approval-banner glass">
              <div className="approval-banner-icon">🎉</div>
              <div className="approval-banner-content">
                <h4>Payment Approved!</h4>
                <p>Your payment for <strong>{payment.book?.title || 'your book'}</strong> has been approved. The book is now unlocked in your library!</p>
              </div>
              <button 
                onClick={() => handleDismissNotif(payment._id)}
                className="approval-banner-dismiss"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Notification Banners */}
      {rejectedPaymentsNotDismissed.length > 0 && (
        <div className="approval-banners">
          {rejectedPaymentsNotDismissed.map(payment => (
            <div key={payment._id} className="rejection-banner glass">
              <div className="approval-banner-icon">❌</div>
              <div className="approval-banner-content">
                <h4>Payment Rejected</h4>
                <p>Your payment for <strong>{payment.book?.title || 'a book'}</strong> was not approved. You can retry the purchase.</p>
              </div>
              <button 
                onClick={() => handleDismissNotif(payment._id)}
                className="approval-banner-dismiss"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{purchasedBooks.length}</h3>
            <p>Purchased Books</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{payments.filter(p => p.status === 'approved').length}</h3>
            <p>Approved Payments</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{payments.filter(p => p.status === 'pending').length}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">🔗</div>
          <div className="stat-info">
            <h3>{user?.referralCode}</h3>
            <p>Referral Code</p>
          </div>
        </div>
      </div>

      {/* Promotion / Purchase Banner */}
      {unpurchasedBooks.length > 0 && (() => {
        const featuredUnpurchased = unpurchasedBooks[0];
        const status = getBookPaymentStatus(featuredUnpurchased._id);
        const coverUrl = featuredUnpurchased.coverImage 
          ? getBackendAssetUrl(featuredUnpurchased.coverImage) 
          : '/book-cover.jpg';
          
        return (
          <div className="buy-book-banner glass">
            <img 
              src={coverUrl} 
              alt={featuredUnpurchased.title} 
              className="buy-book-banner-cover" 
            />
            <div className="buy-book-banner-content">
              <span className="buy-book-banner-tag">Unlock Premium Ebook</span>
              <h2 className="buy-book-banner-title">{featuredUnpurchased.title}</h2>
              <p className="buy-book-banner-author">
                by {featuredUnpurchased.author === 'Ayush Pradhan' ? 'KN Jha' : featuredUnpurchased.author}
              </p>
              <p className="buy-book-banner-description">{featuredUnpurchased.description}</p>
              
              <div className="buy-book-banner-actions">
                <span className="buy-book-banner-price">₹{featuredUnpurchased.price}</span>
                
                {status === 'pending' ? (
                  <div className="buy-book-status-badge">
                    ⏳ Payment Verification Pending
                  </div>
                ) : status === 'rejected' ? (
                  <>
                    <button 
                      onClick={() => navigate(`/payment/${featuredUnpurchased._id}`)} 
                      className="btn btn-primary buy-book-banner-btn"
                    >
                      Retry Purchase
                    </button>
                    <div className="buy-book-status-badge rejected">
                      ❌ Previous Payment Rejected
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => navigate(`/payment/${featuredUnpurchased._id}`)} 
                    className="btn btn-primary buy-book-banner-btn"
                  >
                    Buy the Book
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Referral Link */}
      <div className="referral-section glass">
        <h3>Your Referral Link</h3>
        <div className="referral-link-box">
          <input 
            type="text" 
            value={user?.referralLink || ''} 
            readOnly 
            className="referral-input"
          />
          <button 
            onClick={handleCopyLink}
            className={`btn btn-primary copy-btn ${copied ? 'copied' : ''}`}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
          <button 
            onClick={handleShare}
            className="btn share-btn"
          >
            <svg className="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share
          </button>
        </div>
        <p className="referral-note">Share this link to earn referrals! Spread the word via WhatsApp, Facebook, or any app 🚀</p>
      </div>

      {/* UPI IDs Management */}
      <div className="dashboard-section glass upi-management-section">
        <h2>My UPI IDs</h2>
        <p className="upi-management-subtitle">Manage your UPI IDs for referral payouts (minimum 1, maximum 3)</p>
        
        <div className="upi-list">
          {user?.upiIds && user.upiIds.length > 0 ? (
            user.upiIds.map((upi, index) => (
              <div key={upi} className="upi-item glass">
                <div className="upi-item-content">
                  <span className="upi-badge-number">#{index + 1}</span>
                  <span className="upi-text">{upi}</span>
                </div>
                {user.upiIds.length > 1 ? (
                  <button 
                    onClick={() => handleDeleteUpi(upi)} 
                    className="btn-delete-upi"
                    title="Delete UPI ID"
                  >
                    🗑️
                  </button>
                ) : (
                  <span className="upi-primary-badge">Primary</span>
                )}
              </div>
            ))
          ) : (
            <p className="upi-empty-text">No UPI IDs found. Please add at least one.</p>
          )}
        </div>

        {(!user?.upiIds || user.upiIds.length < 3) && (
          <form onSubmit={handleAddUpi} className="add-upi-form">
            <input 
              type="text" 
              placeholder="Enter new UPI ID (e.g. name@bank)" 
              value={newUpi}
              onChange={(e) => setNewUpi(e.target.value)}
              required
              className="upi-input"
            />
            <button type="submit" className="btn btn-primary add-upi-btn" disabled={upiSubmitting}>
              {upiSubmitting ? 'Adding...' : 'Add UPI ID'}
            </button>
          </form>
        )}
        
        {upiError && <div className="upi-message error">{upiError}</div>}
        {upiSuccess && <div className="upi-message success">{upiSuccess}</div>}
      </div>

      {/* Purchased Books */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>My Library</h2>
          <Link to="/" className="btn btn-secondary browse-btn">
            Browse Books
          </Link>
        </div>
        {purchasedBooks.length > 0 ? (
          <div className="books-grid">
            {purchasedBooks.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't purchased any books yet.</p>
            <Link to="/" className="btn btn-primary">
              Browse Books
            </Link>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="dashboard-section">
        <h2>Payment History</h2>
        {payments.length > 0 ? (
          <div className="payments-list">
            {payments.map(payment => (
              <div key={payment._id} className="payment-item glass">
                <div className="payment-info">
                  <h4>{payment.book?.title || 'Unknown Book'}</h4>
                  <p>₹{payment.amount}</p>
                  <p className="payment-date">
                    {new Date(payment.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`payment-status ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No payment history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
