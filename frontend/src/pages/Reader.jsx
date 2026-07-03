import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI, getBackendBaseUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Reader.css';

const Reader = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const [epubUrl, setEpubUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const viewerRef = useRef(null);

  useEffect(() => {
    loadEpub();
  }, [id, type]);

  const loadEpub = async () => {
    try {
      setLoading(true);
      let response;
      
      if (type === 'preview') {
        response = await booksAPI.getPreview(id);
      } else if (type === 'full') {
        response = await booksAPI.getFull(id);
      } else {
        throw new Error('Invalid reader type');
      }

      if (response.data.success) {
        const backendBaseUrl = getBackendBaseUrl();
        const epubPath = response.data.epubUrl || '';
        setEpubUrl(/^https?:\/\//i.test(epubPath) ? epubPath : `${backendBaseUrl}${epubPath}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load ebook');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="reader-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="reader-container">
        <div className="reader-error glass">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleClose} className="btn btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-container">
      <div className="reader-header glass">
        <button onClick={handleClose} className="btn btn-secondary">
          ← Back
        </button>
        <h2>{type === 'preview' ? 'Preview Mode' : 'Full Book'}</h2>
        <div></div>
      </div>

      <div className="reader-content">
        {epubUrl ? (
          <iframe
            ref={viewerRef}
            src={`/epub-viewer.html?book=${encodeURIComponent(epubUrl)}`}
            className="epub-iframe"
            title="EPUB Reader"
          />
        ) : (
          <div className="reader-error glass">
            <p>Failed to load EPUB file</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reader;
