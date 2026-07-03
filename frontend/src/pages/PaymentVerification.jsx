import { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './PaymentVerification.css';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll(filter === 'all' ? '' : filter);
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) {
      return;
    }

    try {
      await paymentsAPI.approve(paymentId);
      fetchPayments();
      setSelectedPayment(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleReject = async (paymentId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await paymentsAPI.reject(paymentId, rejectionReason);
      fetchPayments();
      setSelectedPayment(null);
      setRejectionReason('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
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

  return (
    <div className="payment-verification-container">
      <div className="page-header">
        <h1 className="page-title">Payment Verification</h1>
        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending ({payments.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`btn btn-sm ${filter === 'approved' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Approved ({payments.filter(p => p.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`btn btn-sm ${filter === 'rejected' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Rejected ({payments.filter(p => p.status === 'rejected').length})
          </button>
        </div>
      </div>

      <div className="payments-list glass">
        {payments.length > 0 ? (
          <div className="payments-grid">
            {payments.map(payment => (
              <div key={payment._id} className="payment-card">
                <div className="payment-header">
                  <div className="payment-user">
                    <h4>{payment.user?.name || 'Unknown User'}</h4>
                    <p>{payment.user?.email || ''}</p>
                    <p>{payment.user?.phone || ''}</p>
                  </div>
                  <span className={`payment-status ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>

                <div className="payment-book">
                  <h5>{payment.book?.title || 'Unknown Book'}</h5>
                  <p>by {payment.book?.author || 'Unknown'}</p>
                  <p className="payment-amount">₹{payment.amount}</p>
                </div>

                <div className="payment-details">
                  <div className="detail-row">
                    <span>UTR Number:</span>
                    <span className="utr">{payment.utrNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span>Submitted:</span>
                    <span>{new Date(payment.submittedAt).toLocaleString()}</span>
                  </div>
                  {payment.verifiedAt && (
                    <div className="detail-row">
                      <span>Verified:</span>
                      <span>{new Date(payment.verifiedAt).toLocaleString()}</span>
                    </div>
                  )}
                  {payment.rejectionReason && (
                    <div className="detail-row">
                      <span>Reason:</span>
                      <span className="rejection-reason">{payment.rejectionReason}</span>
                    </div>
                  )}
                </div>

                {payment.paymentScreenshot && (
                  <div className="payment-screenshot">
                    <p>Screenshot:</p>
                    <img
                      src={`http://localhost:5000/${payment.paymentScreenshot}`}
                      alt="Payment screenshot"
                      onClick={() => window.open(`http://localhost:5000/${payment.paymentScreenshot}`, '_blank')}
                    />
                  </div>
                )}

                {payment.status === 'pending' && (
                  <div className="payment-actions">
                    <button
                      onClick={() => handleApprove(payment._id)}
                      className="btn btn-success btn-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleViewDetails(payment)}
                      className="btn btn-danger btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No payments found</p>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal glass" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reject Payment</h2>
            <p className="modal-subtitle">
              Rejecting payment for {selectedPayment.book?.title} by {selectedPayment.user?.name}
            </p>
            
            <div className="form-group">
              <label htmlFor="rejectionReason">Rejection Reason *</label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Enter reason for rejection"
                required
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleReject(selectedPayment._id)}
                className="btn btn-danger"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setRejectionReason('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
