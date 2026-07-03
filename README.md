# THE WARRIOR

A premium ebook selling platform combined with a referral networking system. Built with MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### User Features
- User registration and authentication
- Browse and purchase ebooks
- Read free preview chapters
- Unlock full ebooks after payment approval
- Build and manage referral network
- View referral tree and network statistics
- Personal dashboard with analytics

### Admin Features
- User management
- Book upload and management
- Payment verification and approval
- Book unlock management
- View entire referral tree
- Platform analytics and dashboard

### Key Features
- JWT-based authentication
- Role-based access control
- EPUB.js for ebook reading
- Manual UPI payment system with screenshot verification
- Multi-level referral system
- Premium black and gold theme UI
- Responsive design with glassmorphism effects

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- EPUB.js
- CSS3 (Custom styling)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcrypt
- Multer (file uploads)
- dotenv
- CORS

## Project Structure

```
TheWarrior/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── README.md
└── .gitignore
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd TheWarrior
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/THE_WARRIOR
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/THE_WARRIOR

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. **Run Setup Script**
```bash
cd backend
npm run setup
```
This will create the necessary upload directories and a `.env` file with default configuration.

6. **Configure Environment Variables**

Edit the `.env` file in the `backend` directory with your configuration:

## Running the Application

### Start MongoDB
If using local MongoDB:
```bash
mongod
```

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Database Setup

The application uses MongoDB with the following collections:

- **users**: User accounts, referral codes, purchased books
- **books**: Ebook details, cover images, EPUB files
- **payments**: Payment records, verification status
- **admins**: Admin accounts

Collections are automatically created by Mongoose on first use.

## Default Admin Account

After running the application, create an admin account through the API or directly in MongoDB:

```javascript
{
  "name": "Admin",
  "email": "admin@warrior.com",
  "password": "hashed_password", // Use bcrypt to hash
  "role": "admin"
}
```

Or use the admin signup endpoint (if enabled).

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book details protected
- `GET /api/books/:id/preview` - Get preview EPUB protected
- `GET /api/books/:id/full` - Get full EPUB protected
- `POST /api/books` - Upload book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Payments
- `POST /api/payments` - Submit payment
- `GET /api/payments` - Get user payments protected
- `GET /api/payments/:id` - Get payment details protected
- `PUT /api/payments/:id/approve` - Approve payment (Admin only)
- `PUT /api/payments/:id/reject` - Reject payment (Admin only)
- `GET /api/payments/all` - Get all payments (Admin only)

### Referrals
- `GET /api/referrals/my-network` - Get user's referral network protected
- `GET /api/referrals/tree` - Get full referral tree (Admin only)
- `GET /api/referrals/stats` - Get referral statistics protected

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/analytics` - Get platform analytics (Admin only)
- `PUT /api/admin/users/:id` - Update user (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

## Payment System

The platform uses manual UPI payment:

1. User selects a book to purchase
2. QR code and UPI ID are displayed
3. User makes payment via UPI
4. User enters UTR number and uploads payment screenshot
5. Payment status becomes "Pending"
6. Admin reviews and approves/rejects payment
7. On approval, book is automatically unlocked for the user

## Referral System

- Each user receives a unique referral code upon registration
- Referral link format: `https://domain.com/signup?ref=ABC123`
- New users registering through referral become the referrer's child
- Multi-level referral tracking (direct and second-level referrals)
- Admin can view entire referral tree

## Security Features

- JWT-based authentication
- bcrypt password hashing
- Protected API routes
- Role-based access control (User/Admin)
- Secure file upload validation
- Prevention of direct EPUB access
- Duplicate referral code prevention
- CORS configuration

## Deployment

### Backend Deployment (e.g., Render, Heroku)

1. Set environment variables in deployment platform
2. Update `FRONTEND_URL` to production domain
3. Use MongoDB Atlas for production database
4. Build and deploy backend

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update API base URL in frontend services
2. Build the project: `npm run build`
3. Deploy the dist folder

### Environment Variables for Production

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/THE_WARRIOR
JWT_SECRET=your_production_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB Atlas whitelist if using Atlas

### File Upload Issues
- Ensure uploads directories exist
- Check file size limits in Multer configuration
- Verify file type validation

### EPUB Reader Issues
- Ensure EPUB files are valid
- Check CORS configuration
- Verify file paths in backend

### Authentication Issues
- Clear browser cookies/localStorage
- Verify JWT_SECRET in `.env`
- Check token expiration

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries, contact the development team.

---

**THE WARRIOR** - Premium Ebook Platform with Referral Networking
