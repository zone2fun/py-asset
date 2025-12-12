import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import SubmitPropertyPage from './pages/SubmitPropertyPage';
import ContactPage from './pages/ContactPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import MortgagePage from './pages/MortgagePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEditPage from './pages/AdminEditPage';
import SetupPage from './pages/SetupPage';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 relative font-sans text-slate-900">
        <Navigation />
        
        {/* Main Content Area: Padding Top for Desktop Nav, Padding Bottom for Mobile Nav */}
        <main className="pt-0 md:pt-16 pb-20 md:pb-0 min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<ListingPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/submit" element={<SubmitPropertyPage />} />
            <Route path="/mortgage" element={<MortgagePage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup" element={<SetupPage />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/add" 
              element={
                <ProtectedRoute>
                  <AdminEditPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit/:id" 
              element={
                <ProtectedRoute>
                  <AdminEditPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;