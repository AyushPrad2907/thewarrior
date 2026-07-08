import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageSlider from '../components/ImageSlider';
import './Landing.css';

const Landing = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const impactStats = [
    { value: '1 Book', label: 'One focused journey, no distractions' },
    { value: 'Preview', label: 'Read first, decide with confidence' },
    { value: 'Unlock', label: 'Full access after approval' }
  ];

  const readerPillars = [
    'A single book chosen to move you forward',
    'A cover that sells the promise before the first page',
    'A premium flow that turns interest into action'
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    const hero = document.querySelector('.hero');

    const handleScroll = () => {
      if (!hero) {
        return;
      }

      const offset = Math.min(window.scrollY * 0.16, 96);
      hero.style.setProperty('--hero-shift', `${offset}px`);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const revealTargets = document.querySelectorAll('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );

    revealTargets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [loading, books.length]);

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
      <section className="hero glass" data-reveal>
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">Read smarter. Buy confidently. Grow faster.</div>
          <h1 className="hero-title">
            Turn yourself into a <span className="gold-text">powerful version of you</span>
          </h1>
          <div className="hero-buttons">
            <Link to="/signup" className="btn btn-primary hero-cta">
              Start Reading Today
            </Link>
            <Link to="/login" className="btn btn-secondary hero-cta">
              Sign In/Sign Up
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
          <div className="hero-book-cover-wrap">
            <img src="/book-cover.jpeg" alt="The Warrior In You book cover" className="hero-book-cover" />
          </div>
          <div className="hero-back-cover-wrap">
            <img src="/book-back-cover.jpg" alt="The Warrior In You book back cover" className="hero-book-cover" />
          </div>
          <h2>Why this book matters</h2>
          <div className="impact-stats">
            {impactStats.map((stat) => (
              <div key={stat.label} className="impact-stat">
                <span className="impact-value">{stat.value}</span>
                <span className="impact-label">{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-note">
            यह पेज किताब खरीदने से पहले ही उसके आइडिया को बेचने के लिए बनाया गया है: इसमें एक साफ़ वादा, एक दमदार कवर और किताब खरीदने का आसान तरीका शामिल है।
          </div>
        </div>
      </section>

      {/* Image Slider */}
      <ImageSlider />

      {/* Features Section */}
      <section className="features" data-reveal>
        <h2 className="section-title">Why readers choose THE WARRIOR IN YOU</h2>
        <p className="section-subtitle">
          यह प्लेटफ़ॉर्म झिझक कम करने और भरोसा बढ़ाने के लिए बनाया गया है, ताकि यूज़र कुछ भी खरीदने से पहले ही उसकी वैल्यू को समझ सकें।
        </p>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">🏆</div>
            <h3>Book of the Week</h3>
            <p>Discover our weekly featured book selection curated for maximum impact.</p>
          </div>
          <div className="feature-card glass">
            <div className="feature-icon">⭐</div>
            <h3>Leader of the Month</h3>
            <p>Top readers and community leaders recognized for their engagement.</p>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="books-section" data-reveal>
        <div className="books-heading">
          <h2 className="section-title">Featured Book</h2>
          <p className="section-subtitle">This is the one book the page is built around. It should feel like the obvious choice.</p>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : books.length > 0 ? (
          <div className="books-grid">
            {books.slice(0, 1).map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        ) : (
          <div className="book-spotlight glass">
            <img src="/book-cover.jpg" alt="The Warrior In You book cover" className="book-spotlight-cover" />
            <div className="book-spotlight-copy">
              <span className="spotlight-label">Featured title</span>
              <h3 className="spotlight-title">The Warrior In You</h3>
              <p className="spotlight-text">
                A focused, motivational book experience designed to push the reader into action.
              </p>
              <Link to="/signup" className="btn btn-primary">
                Get the Book
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section glass" data-reveal>
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
