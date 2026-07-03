import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Landing.css';

const Landing = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero glass">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="gold-text">THE WARRIOR</span>
          </h1>
          <p className="hero-subtitle">
            Premium Ebook Platform with Exclusive Content & Powerful Referral Networking
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-cta">
              Join Now
            </Link>
            <Link to="/login" className="btn btn-secondary hero-cta">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why Choose THE WARRIOR?</h2>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">📚</div>
            <h3>Premium Ebooks</h3>
            <p>Access exclusive, high-quality ebooks from renowned authors</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">🔗</div>
            <h3>Referral Network</h3>
            <p>Build your network and earn through our powerful referral system</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📖</div>
            <h3>Free Preview</h3>
            <p>Read preview chapters before purchasing the full book</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">💎</div>
            <h3>Premium Experience</h3>
            <p>Enjoy a luxurious reading experience with our premium platform</p>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="books-section">
        <h2 className="section-title">Featured Books</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="books-grid">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
        {books.length === 0 && !loading && (
          <p className="no-books">No books available at the moment</p>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section glass">
        <h2 className="cta-title">Ready to Start Your Journey?</h2>
        <p className="cta-subtitle">Join thousands of readers and build your network today</p>
        <Link to="/signup" className="btn btn-primary cta-button">
          Get Started Now
        </Link>
      </section>
    </div>
  );
};

export default Landing;
