import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { booksAPI, getBackendAssetUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id, user]);

  const fetchBookDetails = async () => {
    try {
      const response = await booksAPI.getById(id);
      setBook(response.data.book);
      
      // Check if user has purchased this book
      if (user && user.purchasedBooks) {
        setIsPurchased(user.purchasedBooks.some(purchasedBook => {
          if (typeof purchasedBook === 'object' && purchasedBook !== null) {
            return (purchasedBook._id || purchasedBook.id) === id;
          }
          return purchasedBook === id;
        }));
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadPreview = () => {
    navigate(`/reader/${id}/preview`);
  };

  const handleReadFull = () => {
    navigate(`/reader/${id}/full`);
  };

  const handlePurchase = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/payment/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!book) {
    return (
      <div className="book-details-container">
        <div className="error-message">Book not found</div>
      </div>
    );
  }

  return (
    <div className="book-details-container">
      <div className="book-details glass">
        <div className="book-cover-section">
          <div className="detail-cover-frame">
          <img 
            src={getBackendAssetUrl(book.coverImage)} 
            alt={book.title}
            className="detail-cover"
          />
          </div>
        </div>

        <div className="book-info-section">
          <div className="detail-kicker">Your next breakthrough starts here</div>
          <h1 className="detail-title">{book.title}</h1>
          <p className="detail-author">by {book.author === 'Ayush Pradhan' ? 'KN Jha' : book.author}</p>
          <div className="detail-meta">
            <span className="detail-category">{book.category}</span>
            <span className="detail-price">₹{book.price}</span>
          </div>

          <p className="detail-description">{book.description}</p>

          <div className="detail-benefits glass">
            <h3>What you get</h3>
            <ul>
              <li>Preview the book before you commit</li>
              <li>Unlock the full read after payment approval</li>
              <li>Read on a clean, distraction-free experience</li>
            </ul>
          </div>

          <div className="detail-actions">
            <button onClick={handleReadPreview} className="btn btn-secondary">
              Read Preview
            </button>
            
            {isPurchased ? (
              <button onClick={handleReadFull} className="btn btn-primary">
                Read Full Book
              </button>
            ) : (
              <button onClick={handlePurchase} className="btn btn-primary">
                Purchase for ₹{book.price}
              </button>
            )}
          </div>

          {isPurchased && (
            <div className="purchased-badge">
              ✓ Purchased
            </div>
          )}

          {!isPurchased && (
            <p className="detail-cta-note">
              One purchase unlocks the full book for your account after verification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
