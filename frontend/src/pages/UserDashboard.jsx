import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BookCard from '../components/BookCard';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  const purchasedBooks = books.filter(book => 
    user?.purchasedBooks?.some(purchased => {
      if (typeof purchased === 'object' && purchased !== null) {
        return (purchased._id || purchased.id) === book._id;
      }
      return purchased === book._id;
    })
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">Manage your ebooks and track your purchases</p>
      </div>

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
            onClick={() => navigator.clipboard.writeText(user?.referralLink || '')}
            className="btn btn-primary copy-btn"
          >
            Copy Link
          </button>
        </div>
        <p className="referral-note">Share this link to earn referrals!</p>
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
