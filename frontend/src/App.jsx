import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BookDetails from './pages/BookDetails';
import Reader from './pages/Reader';
import Payment from './pages/Payment';
import Success from './pages/Success';
import UserDashboard from './pages/UserDashboard';
import ReferralDashboard from './pages/ReferralDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import BookUpload from './pages/BookUpload';
import PaymentVerification from './pages/PaymentVerification';
import NetworkVisualization from './pages/NetworkVisualization';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || user.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/book/:id" element={<BookDetails />} />
              
              {/* Protected Routes */}
              <Route path="/reader/:id/:type" element={
                <ProtectedRoute>
                  <Reader />
                </ProtectedRoute>
              } />
              <Route path="/payment/:bookId" element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } />
              <Route path="/success" element={
                <ProtectedRoute>
                  <Success />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/referrals" element={
                <ProtectedRoute>
                  <ReferralDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              <Route path="/admin/books" element={
                <AdminRoute>
                  <BookUpload />
                </AdminRoute>
              } />
              <Route path="/admin/payments" element={
                <AdminRoute>
                  <PaymentVerification />
                </AdminRoute>
              } />
              <Route path="/admin/network" element={
                <AdminRoute>
                  <NetworkVisualization />
                </AdminRoute>
              } />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
