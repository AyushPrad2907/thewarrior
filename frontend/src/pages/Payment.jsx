import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Payment.css';

const Payment = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    utrNumber: '',
    paymentScreenshot: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookDetails();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const response = await booksAPI.getById(bookId);
      setBook(response.data.book);
    } catch (error) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, paymentScreenshot: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.utrNumber.trim()) {
      setError('Please enter UTR number');
      return;
    }

    if (!formData.paymentScreenshot) {
      setError('Please upload payment screenshot');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('bookId', bookId);
      formDataToSend.append('utrNumber', formData.utrNumber);
      formDataToSend.append('paymentScreenshot', formData.paymentScreenshot);

      const response = await paymentsAPI.submit(formDataToSend);
      navigate('/success');
    } catch (error) {
      setError(error.response?.data?.message || 'Payment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !book) {
    return (
      <div className="payment-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!book) {
    return <LoadingSpinner />;
  }

  return (
    <div className="payment-container">
      <div className="payment-card glass">
        <h1 className="payment-title">Complete Your Purchase</h1>
        
        <div className="book-summary">
          <h2>{book.title}</h2>
          <p className="book-author">by {book.author}</p>
          <p className="book-price">Amount: ₹{book.price}</p>
        </div>

        <div className="payment-instructions">
          <h3>Payment Instructions</h3>
          <div className="qr-section">
            <div className="qr-placeholder">
              <div className="qr-code">
                <svg viewBox="0 0 100 100" className="qr-svg">
                  <rect x="10" y="10" width="30" height="30" fill="#d4af37"/>
                  <rect x="60" y="10" width="30" height="30" fill="#d4af37"/>
                  <rect x="10" y="60" width="30" height="30" fill="#d4af37"/>
                  <rect x="45" y="45" width="10" height="10" fill="#d4af37"/>
                  <rect x="45" y="45" width="10" height="10" fill="#d4af37"/>
                  <rect x="20" y="20" width="10" height="10" fill="#1a1a1a"/>
                  <rect x="70" y="20" width="10" height="10" fill="#1a1a1a"/>
                  <rect x="20" y="70" width="10" height="10" fill="#1a1a1a"/>
                </svg>
              </div>
              <p>Scan QR Code to Pay</p>
            </div>
          </div>
          
          <div className="upi-details">
            <p><strong>UPI ID:</strong> 7859088239@okbizaxis</p>
            <p><strong>Amount:</strong> ₹{book.price}</p>
          </div>

          <div className="payment-steps">
            <ol>
              <li>Scan the QR code or use the UPI ID to make payment</li>
              <li>After payment, note down the UTR/Reference number</li>
              <li>Take a screenshot of the payment confirmation</li>
              <li>Upload the screenshot and enter UTR number below</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="utrNumber">UTR / Reference Number *</label>
            <input
              type="text"
              id="utrNumber"
              name="utrNumber"
              value={formData.utrNumber}
              onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
              required
              placeholder="Enter 12-digit UTR number"
              maxLength={12}
            />
          </div>

          <div className="form-group">
            <label htmlFor="paymentScreenshot">Payment Screenshot *</label>
            <input
              type="file"
              id="paymentScreenshot"
              name="paymentScreenshot"
              onChange={handleFileChange}
              required
              accept="image/*"
              className="file-input"
            />
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Payment screenshot preview" />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary payment-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
        </form>

        <button onClick={() => navigate(-1)} className="btn btn-secondary cancel-button">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Payment;
