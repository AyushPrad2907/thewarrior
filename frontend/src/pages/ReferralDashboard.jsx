import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { referralsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ReferralDashboard.css';

const ReferralDashboard = () => {
  const { user } = useAuth();
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const response = await referralsAPI.getMyNetwork();
      setNetworkData(response.data);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(user?.referralLink || '');
    alert('Referral link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="referral-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Referral Network</h1>
        <p className="dashboard-subtitle">Build and manage your referral network</p>
      </div>

      {/* Referral Stats */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{networkData?.stats?.directCount || 0}</h3>
            <p>Direct Referrals</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">🌳</div>
          <div className="stat-info">
            <h3>{networkData?.stats?.secondLevelCount || 0}</h3>
            <p>Second Level</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{networkData?.stats?.totalNetwork || 0}</h3>
            <p>Total Network</p>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon">🔗</div>
          <div className="stat-info">
            <h3>{user?.referralCode}</h3>
            <p>Your Code</p>
          </div>
        </div>
        <div className="stat-card glass highlight-card">
          <div className="stat-icon">₹</div>
          <div className="stat-info">
            <h3>₹{networkData?.stats?.weeklyCommission?.toFixed(2) || '0.00'}</h3>
            <p>Weekly Commission</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="referral-section glass">
        <h3>Your Referral Link</h3>
        <p className="referral-description">
          Share this link with others to grow your network. When they sign up using your link, 
          they become your direct referral.
        </p>
        <div className="referral-link-box">
          <input 
            type="text" 
            value={user?.referralLink || ''} 
            readOnly 
            className="referral-input"
          />
          <button onClick={copyReferralLink} className="btn btn-primary copy-btn">
            Copy Link
          </button>
        </div>
      </div>

      {/* Weekly Commission */}
      <div className="commission-section glass">
        <div className="commission-header">
          <div>
            <h2 className="section-title">Weekly Commission</h2>
            <p className="commission-subtitle">
              Earnings from approved purchases made by your direct referrals in the last 7 days.
            </p>
          </div>
          <div className="commission-total">
            <span>Total</span>
            <strong>₹{networkData?.stats?.weeklyCommission?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>

        <div className="commission-summary-grid">
          <div className="commission-summary-card">
            <span>Weekly Sales</span>
            <strong>₹{networkData?.stats?.weeklySales?.toFixed(2) || '0.00'}</strong>
          </div>
          <div className="commission-summary-card">
            <span>Commission Rate</span>
            <strong>{Math.round((networkData?.stats?.weeklyCommissionRate || 0) * 100)}%</strong>
          </div>
          <div className="commission-summary-card">
            <span>Paid Purchases</span>
            <strong>{networkData?.stats?.weeklyCommissionCount || 0}</strong>
          </div>
        </div>

        {networkData?.weeklyCommissionEntries?.length > 0 ? (
          <div className="commission-list">
            {networkData.weeklyCommissionEntries.map((entry) => (
              <div key={entry.paymentId} className="commission-item">
                <div className="commission-item-main">
                  <h4>{entry.referralName}</h4>
                  <p>{entry.bookTitle}</p>
                </div>
                <div className="commission-item-meta">
                  <span>Sale: ₹{entry.saleAmount}</span>
                  <span>Your share: ₹{entry.commission.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <p>No weekly commission yet. It will appear once your referrals complete approved purchases.</p>
          </div>
        )}
      </div>

      {/* Direct Referrals */}
      <div className="referrals-section">
        <h2 className="section-title">Direct Referrals ({networkData?.directReferrals?.length || 0})</h2>
        {networkData?.directReferrals?.length > 0 ? (
          <div className="referrals-list">
            {networkData.directReferrals.map((referral, index) => (
              <div key={referral._id} className="referral-card glass">
                <div className="referral-header">
                  <div className="referral-avatar">
                    {referral.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="referral-info">
                    <h4>{referral.name}</h4>
                    <p>{referral.email}</p>
                  </div>
                  <div className="referral-badge direct">
                    Level 1
                  </div>
                </div>
                <div className="referral-details">
                  <div className="detail-item">
                    <span>Referral Code:</span>
                    <span className="code">{referral.referralCode}</span>
                  </div>
                  <div className="detail-item">
                    <span>Joined:</span>
                    <span>{new Date(referral.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Purchases:</span>
                    <span className="purchases">{referral.totalPurchases || 0} books</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No direct referrals yet. Start sharing your referral link!</p>
          </div>
        )}
      </div>

      {/* Second Level Referrals */}
      <div className="referrals-section">
        <h2 className="section-title">Second Level Referrals ({networkData?.secondLevelReferrals?.length || 0})</h2>
        {networkData?.secondLevelReferrals?.length > 0 ? (
          <div className="referrals-list">
            {networkData.secondLevelReferrals.map((referral, index) => (
              <div key={referral._id} className="referral-card glass">
                <div className="referral-header">
                  <div className="referral-avatar second">
                    {referral.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="referral-info">
                    <h4>{referral.name}</h4>
                    <p>{referral.email}</p>
                  </div>
                  <div className="referral-badge second">
                    Level 2
                  </div>
                </div>
                <div className="referral-details">
                  <div className="detail-item">
                    <span>Referral Code:</span>
                    <span className="code">{referral.referralCode}</span>
                  </div>
                  <div className="detail-item">
                    <span>Joined:</span>
                    <span>{new Date(referral.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span>Purchases:</span>
                    <span className="purchases">{referral.totalPurchases || 0} books</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No second level referrals yet.</p>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="how-it-works glass">
        <h2 className="section-title">How Referral System Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Share Your Link</h4>
            <p>Share your unique referral link with friends, family, or on social media</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h4>They Sign Up</h4>
            <p>When someone signs up using your link, they become your direct referral</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Build Network</h4>
            <p>Your referrals can also refer others, building your second-level network</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h4>Track Growth</h4>
            <p>Monitor your network growth and referral activity from this dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
