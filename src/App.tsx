import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import RecordPurchase from './pages/RecordPurchase';
import Attendance from './pages/Attendance';
import { UserRole } from './types';

// Protected route wrapper
const ProtectedRoute = ({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactElement, 
  requiredRole?: UserRole 
}) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Get the base URL from package.json homepage or use /
const getBasename = (): string => {
  const { homepage } = require('../package.json');
  if (!homepage) return '/';
  
  // Extract pathname from homepage
  return new URL(homepage).pathname;
};

function App() {
  return (
    <Router basename={getBasename()}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/students" 
            element={
              <ProtectedRoute requiredRole={UserRole.Admin}>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/students/add" 
            element={
              <ProtectedRoute requiredRole={UserRole.Admin}>
                <Layout>
                  <AddStudent />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/students/edit/:id" 
            element={
              <ProtectedRoute requiredRole={UserRole.Admin}>
                <Layout>
                  <EditStudent />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/purchases/add" 
            element={
              <ProtectedRoute requiredRole={UserRole.Admin}>
                <Layout>
                  <RecordPurchase />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/attendance" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Attendance />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
