import { Link } from 'react-router-dom';
import { getBackendAssetUrl } from '../services/api';
import './BookCard.css';

const BookCard = ({ book }) => {
  return (
    <div className="book-card card fade-in">
      <div className="book-cover">
        <img 
          src={getBackendAssetUrl(book.coverImage)} 
          alt={book.title}
          className="cover-image"
        />
        <div className="book-overlay">
          <Link to={`/book/${book._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <p className="book-description">{book.description}</p>
        <div className="book-footer">
          <span className="book-price">₹{book.price}</span>
          <span className="book-category">{book.category}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
