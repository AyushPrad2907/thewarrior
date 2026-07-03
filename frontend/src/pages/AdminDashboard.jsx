import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p className="dashboard-subtitle">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{analytics?.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{analytics?.totalBooks || 0}</h3>
            <p>Total Books</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>₹{analytics?.totalRevenue || 0}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{analytics?.pendingPayments || 0}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="payment-stats glass">
        <h2 className="section-title">Payment Overview</h2>
        <div className="payment-stats-grid">
          <div className="payment-stat">
            <span className="stat-label">Approved</span>
            <span className="stat-value success">{analytics?.approvedPayments || 0}</span>
          </div>
          <div className="payment-stat">
            <span className="stat-label">Pending</span>
            <span className="stat-value warning">{analytics?.pendingPayments || 0}</span>
          </div>
          <div className="payment-stat">
            <span className="stat-label">Rejected</span>
            <span className="stat-value error">{analytics?.rejectedPayments || 0}</span>
          </div>
          <div className="payment-stat">
            <span className="stat-label">Total</span>
            <span className="stat-value">{analytics?.totalPayments || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/admin/users" className="action-card glass">
            <div className="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View and manage all users</p>
          </Link>
          <Link to="/admin/books" className="action-card glass">
            <div className="action-icon">📚</div>
            <h3>Manage Books</h3>
            <p>Upload and manage ebooks</p>
          </Link>
          <Link to="/admin/payments" className="action-card glass">
            <div className="action-icon">💰</div>
            <h3>Verify Payments</h3>
            <p>Review and verify payments</p>
          </Link>
          <Link to="/admin/network" className="action-card glass">
            <div className="action-icon">🌳</div>
            <h3>Referral Tree</h3>
            <p>View entire referral network</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-section glass">
          <h2 className="section-title">Recent Users</h2>
          {analytics?.recentUsers?.length > 0 ? (
            <div className="activity-list">
              {analytics.recentUsers.map((user, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>
                  <span className="activity-date">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent users</p>
          )}
        </div>

        <div className="activity-section glass">
          <h2 className="section-title">Recent Payments</h2>
          {analytics?.recentPayments?.length > 0 ? (
            <div className="activity-list">
              {analytics.recentPayments.map((payment, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <h4>{payment.user?.name || 'Unknown'}</h4>
                    <p>{payment.book?.title || 'Unknown Book'}</p>
                  </div>
                  <div className="activity-details">
                    <span className="activity-amount">₹{payment.amount}</span>
                    <span className={`activity-status ${payment.status}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-activity">No recent payments</p>
          )}
        </div>
      </div>

      {/* Top Books */}
      <div className="top-books glass">
        <h2 className="section-title">Top Performing Books</h2>
        {analytics?.topBooks?.length > 0 ? (
          <div className="top-books-list">
            {analytics.topBooks.map((book, index) => (
              <div key={book._id} className="top-book-item">
                <span className="book-rank">#{index + 1}</span>
                <div className="book-info">
                  <h4>{book.title}</h4>
                  <p>by {book.author}</p>
                </div>
                <span className="book-purchases">
                  {book.totalPurchases} purchases
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-activity">No books available</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
