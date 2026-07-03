import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Landing.css';

const Landing = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const impactStats = [
    { value: 'Instant', label: 'Preview access before you buy' },
    { value: 'Secure', label: 'Manual approval with verified unlocks' },
    { value: 'Lifetime', label: 'Keep the book after purchase' }
  ];

  const readerPillars = [
    'Curated books that reward your time',
    'Clean reading flow with previews and full access',
    'A premium platform designed to make buying feel worth it'
  ];

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
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">Read smarter. Buy confidently. Grow faster.</div>
          <h1 className="hero-title">
            Turn every page into a <span className="gold-text">better version of you</span>
          </h1>
          <p className="hero-subtitle">
            Discover premium ebooks designed to teach, motivate, and keep you moving forward. Preview first, buy with confidence, and unlock the full experience when you are ready.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-cta">
              Start Reading Today
            </Link>
            <Link to="/login" className="btn btn-secondary hero-cta">
              I Already Have an Account
            </Link>
          </div>
          <div className="hero-pillars">
            {readerPillars.map((pillar) => (
              <div key={pillar} className="hero-pillar glass">
                {pillar}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-stats glass">
          <h2>Why readers buy here</h2>
          <div className="impact-stats">
            {impactStats.map((stat) => (
              <div key={stat.label} className="impact-stat">
                <span className="impact-value">{stat.value}</span>
                <span className="impact-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-note">
            Every book is presented to help the reader feel progress before, during, and after the purchase.
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Why readers choose THE WARRIOR</h2>
        <p className="section-subtitle">
          The platform is built to reduce hesitation and increase trust so the user feels the value before they buy.
        </p>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">📚</div>
            <h3>Premium Ebooks</h3>
            <p>Access exclusive books that feel worth owning, not just worth skimming.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">🔗</div>
            <h3>Referral Network</h3>
            <p>Buy once, share value, and build a network that grows with every recommendation.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">📖</div>
            <h3>Free Preview</h3>
            <p>Read preview chapters first so the purchase feels informed, not impulsive.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">💎</div>
            <h3>Premium Experience</h3>
            <p>Enjoy a polished reading journey that makes the full book feel like an upgrade.</p>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="books-section">
        <div className="books-heading">
          <h2 className="section-title">Featured Books</h2>
          <p className="section-subtitle">Choose a title that moves you forward and unlock the full experience when you are ready.</p>
        </div>
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
        <h2 className="cta-title">If you are serious about growth, start here.</h2>
        <p className="cta-subtitle">Pick a book, read the preview, and buy the one that feels like the next step in your journey.</p>
        <Link to="/signup" className="btn btn-primary cta-button">
          Buy Your First Book
        </Link>
      </section>
    </div>
  );
};

export default Landing;
