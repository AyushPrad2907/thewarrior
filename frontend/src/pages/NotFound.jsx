import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content glass">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
