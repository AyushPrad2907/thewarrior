import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, paymentsAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Payment.css';

const UPI_ID = '7859088239@okbizaxis';
const UPI_NAME = 'Implex Cart International';

const Payment = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    utrNumber: '',
    paymentScreenshot: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  // Dynamic UPI link — auto-updates when book.price changes
  const upiLink = useMemo(() => {
    if (!book) return '';
    return `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${book.price}&cu=INR&tn=${encodeURIComponent(`Purchase: ${book.title}`)}`;
  }, [book]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = UPI_ID;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      navigate('/success', {
        state: {
          payment: response.data.payment,
          bookTitle: book.title,
          bookAuthor: book.author === 'Ayush Pradhan' ? 'KN Jha' : book.author,
          bookPrice: book.price,
          userName: user?.name || 'User',
        }
      });
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
          <p className="book-author">by {book.author === 'Ayush Pradhan' ? 'KN Jha' : book.author}</p>
          <p className="book-price">Amount: ₹{book.price}</p>
        </div>

        <div className="payment-instructions">
          <h3>Payment Instructions</h3>

          {/* Dynamic QR Code */}
          <div className="qr-section">
            <div className="qr-placeholder">
              <div className="dynamic-qr-wrapper">
                <QRCodeSVG
                  value={upiLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="H"
                  includeMargin={true}
                />
                <div className="qr-amount-badge">₹{book.price}</div>
              </div>
              <p className="qr-label">Scan QR Code to Pay</p>
              <p className="qr-auto-note">Amount is pre-filled • Auto-synced with book price</p>
            </div>
          </div>

          {/* Pay via UPI Button (deep link for mobile) */}
          <a href={upiLink} className="upi-pay-button">
            <span className="upi-pay-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </span>
            Pay ₹{book.price} via UPI App
          </a>

          <div className="upi-details">
            <div className="upi-id-row">
              <p><strong>UPI ID:</strong> {UPI_ID}</p>
              <button 
                type="button"
                className="copy-upi-btn" 
                onClick={handleCopyUPI}
                title="Copy UPI ID"
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p><strong>Payee:</strong> {UPI_NAME}</p>
            <p><strong>Amount:</strong> ₹{book.price}</p>
          </div>

          <div className="payment-steps">
            <ol>
              <li>Scan the QR code <strong>or</strong> tap the <em>"Pay via UPI App"</em> button above</li>
              <li>Complete the payment — amount is pre-filled for you</li>
              <li>Note down the <strong>UTR / Reference number</strong> from the confirmation</li>
              <li>Take a <strong>screenshot</strong> of the payment confirmation</li>
              <li>Upload the screenshot and enter the UTR number below</li>
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
