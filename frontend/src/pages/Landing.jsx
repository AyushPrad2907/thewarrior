import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI, getBackendAssetUrl } from '../services/api';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageSlider from '../components/ImageSlider';
import './Landing.css';

const Landing = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const impactStats = [
    { value: '1 Book', label: 'One focused journey, no distractions' },
    { value: 'Preview', label: ' ', hindi: 'जीवन जीत की प्यास है। बाधाओं के सामने झुको मत। अपने पौरुष को पहचानो। कालजयी बनो।' },
    { value: 'Unlock', label: '  ', hindi: 'यह पुस्तक आपके विद्यमान अनंत शक्ति को जाग्रत करने के लिए है। आप अपनी क्षमता को पहचानो। असंख्य  संभावनाएं आपके कदमों को अपने धरातल पर आकर्षित करेंगे। उन कदमों को मत रोको। उन्हें बढ़ने दो। उन्हें पूर्णता की ओर जाने दो।' }
  ];

  const readerPillars = [
    'A single book chosen to move you forward',
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
          <div className="hero-hindi-text">
            <p className="hindi-line">आपके जीवन में क्रांतिकारी बदलाव लाने वाली एक मात्र पुस्तक।</p>
            <p className="hindi-line">आपके समक्ष आने वाली हर चुनौतियों को पराजित करने की क्षमता उत्पन्न करने वाली एक मात्र पुस्तक।</p>
            <p className="hindi-line">आपके जीवन दर्शन को सबसे मजबूत करने वाली एक मात्र पुस्तक।</p>
          </div>
          <div className="hero-back-cover-wrap">
            <img src="/book-back-cover.jpg" alt="The Warrior In You book back cover" className="hero-book-cover" />
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
            <img src="/book-cover.jpg" alt="The Warrior In You book cover" className="hero-book-cover" />
          </div>
          <h2>Why this book matters</h2>
          <div className="impact-stats">
            {impactStats.map((stat) => (
              <div key={stat.label} className="impact-stat">
                <span className="impact-value">{stat.value}</span>
                <span className="impact-label">{stat.label}</span>
                {stat.hindi && <span className="impact-hindi">{stat.hindi}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Slider */}
      <ImageSlider />

      {/* Features Section */}
      <section className="features" data-reveal>
        <h2 className="section-title">Why readers choose THE WARRIOR IN YOU</h2>
        <p className="section-subtitle">
          आपके जीवन में बदलाव लाने वाली एक प्रसिद्ध पुस्तक जो मष्तिष्क में आशा की भावना को जन्म देती है सकारात्मक सोच से आप अपने जीवन बदलने की संकल्प लेती हैं । आप यह मानते हैं की इतिहास के प्रवाह में प्रवाहित नहीं बल्कि इतिहास की दिशा बदलने की शक्ति उत्पन्न करती हैं ।
        </p>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">🏆</div>
            <h3>Leader of the Week</h3>
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
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          (() => {
            const featuredBook = books[0];
            const coverImage = featuredBook?.coverImage ? getBackendAssetUrl(featuredBook.coverImage) : '/book-cover.jpg';
            const displayTitle = featuredBook?.title || 'The Warrior In You';
            const displayAuthor = featuredBook?.author === 'Ayush Pradhan' ? 'KN Jha' : (featuredBook?.author || 'KN Jha');
            const displayDescription = featuredBook?.description || 'प्रत्येक मनुष्य अपने भाग्य का निर्माता खुद है। अपने जीवन रूपी सागर के मंथन के लिए मनुष्य को अपने अंदर स्थित महान योद्धा को जानना ही होगा जो असीमित शक्ति से युक्त है।';
            const linkTarget = featuredBook ? `/book/${featuredBook._id}` : '/signup';

            return (
              <div className="book-spotlight glass">
                <img src={coverImage} alt={`${displayTitle} book cover`} className="book-spotlight-cover" />
                <div className="book-spotlight-copy">
                  <span className="spotlight-label">Featured title</span>
                  <h3 className="spotlight-title">{displayTitle}</h3>
                  <p className="spotlight-author">by {displayAuthor}</p>
                  <p className="spotlight-text">{displayDescription}</p>
                  <Link to={linkTarget} className="btn btn-primary">
                    {featuredBook ? 'View Details' : 'Get the Book'}
                  </Link>
                </div>
              </div>
            );
          })()
        )}
      </section>

      {/* Referral Info Box */}
      <div className="referral-info-box glass" data-reveal>
        <div className="referral-info-header">
          <span className="referral-info-icon">🔗</span>
          <h3>How Our Referral System Works</h3>
        </div>
        <p className="referral-info-text">
          Share your unique referral link with friends and family. When they sign up and purchase
          the book through your link, you earn rewards for every successful referral. Your referrals
          also get special discounts. You can track your entire referral network and commission from
          your personal dashboard.
        </p>
        <div className="referral-info-steps">
          <div className="referral-info-step">
            <span className="step-num">1</span>
            <span>Sign up and get your unique referral link</span>
          </div>
          <div className="referral-info-step">
            <span className="step-num">2</span>
            <span>Share it with others on social media, WhatsApp, or in person</span>
          </div>
          <div className="referral-info-step">
            <span className="step-num">3</span>
            <span>Earn rewards when they purchase the book through your link</span>
          </div>
        </div>
      </div>

      {/* Referral Section */}
      <section className="referral-section glass" data-reveal>
        <div className="referral-icon">🎁</div>
        <h2 className="referral-title">Share & Earn with Our Referral Program</h2>
        <p className="referral-description">
          Love "The Warrior In You"? Share it with your friends and family! When someone purchases the book through your unique referral link, both you and your friend receive exclusive rewards. Build your network, inspire others, and earn benefits together.
        </p>
        <div className="referral-benefits">
          <div className="referral-benefit">
            <span className="benefit-icon">💰</span>
            <span className="benefit-text">Earn rewards for every successful referral</span>
          </div>
          <div className="referral-benefit">
            <span className="benefit-icon">🌟</span>
            <span className="benefit-text">Your referrals get special discounts</span>
          </div>
          <div className="referral-benefit">
            <span className="benefit-icon">📊</span>
            <span className="benefit-text">Track your referrals in your dashboard</span>
          </div>
        </div>
        <Link to="/signup" className="btn btn-primary referral-button">
          Start Referring Now
        </Link>
      </section>

      {/* CTA Section */}
      <section className="cta-section glass" data-reveal>
        <h2 className="cta-title">If you are serious about growth, start here.</h2>
        <p className="cta-subtitle">
          आप जीवन के किसी भी क्षेत्र में क्यों शिखर पर पहुँचने की क्षमता रखते हो यह पुस्तक को अवश्य पढ़ें और कर्तव्य पर डटे। आपका उज्जवल भविष्य का आधार ही वर्तमान का निर्णय है। आगे बढ़ें और जीवन की सार्थकता को स्पष्ट करें।
        </p>
        <Link to="/signup" className="btn btn-primary cta-button">
          Buy Your First Book
        </Link>
      </section>
    </div>
  );
};

export default Landing;
