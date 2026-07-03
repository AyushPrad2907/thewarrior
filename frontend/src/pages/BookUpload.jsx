import { useState, useEffect } from 'react';
import { booksAPI, adminAPI } from '../services/api';
import { getBackendAssetUrl } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookUpload.css';

const BookUpload = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    price: '',
    category: 'other',
    coverImage: null,
    previewEpub: null,
    fullEpub: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await adminAPI.getAllBooks();
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description || !formData.author || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.coverImage || !formData.previewEpub || !formData.fullEpub) {
      setError('Please upload all required files');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('coverImage', formData.coverImage);
      formDataToSend.append('previewEpub', formData.previewEpub);
      formDataToSend.append('fullEpub', formData.fullEpub);

      await booksAPI.create(formDataToSend);
      setSuccess('Book uploaded successfully!');
      setFormData({
        title: '',
        description: '',
        author: '',
        price: '',
        category: 'other',
        coverImage: null,
        previewEpub: null,
        fullEpub: null
      });
      fetchBooks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload book');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await booksAPI.delete(bookId);
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="book-upload-container">
      <div className="page-header">
        <h1 className="page-title">Book Management</h1>
      </div>

      <div className="upload-section">
        <div className="upload-form glass">
          <h2 className="section-title">Upload New Book</h2>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  placeholder="Enter author name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="fiction">Fiction</option>
                  <option value="non-fiction">Non-Fiction</option>
                  <option value="self-help">Self-Help</option>
                  <option value="business">Business</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Enter book description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="coverImage">Cover Image *</label>
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handleFileChange}
                  required
                  accept="image/*"
                />
              </div>

              <div className="form-group">
                <label htmlFor="previewEpub">Preview EPUB *</label>
                <input
                  type="file"
                  id="previewEpub"
                  name="previewEpub"
                  onChange={handleFileChange}
                  required
                  accept=".epub"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullEpub">Full EPUB *</label>
                <input
                  type="file"
                  id="fullEpub"
                  name="fullEpub"
                  onChange={handleFileChange}
                  required
                  accept=".epub"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Book'}
            </button>
          </form>
        </div>

        <div className="books-list glass">
          <h2 className="section-title">Existing Books ({books.length})</h2>
          
          {books.length > 0 ? (
            <div className="books-grid">
              {books.map(book => (
                <div key={book._id} className="book-item">
                  <div className="book-cover">
                    <img 
                      src={getBackendAssetUrl(book.coverImage)} 
                      alt={book.title}
                    />
                  </div>
                  <div className="book-details">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <p className="book-price">₹{book.price}</p>
                    <p className="book-purchases">{book.totalPurchases} purchases</p>
                    <span className={`book-status ${book.isActive ? 'active' : 'inactive'}`}>
                      {book.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(book._id)}
                    className="btn btn-danger btn-sm delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No books uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookUpload;
