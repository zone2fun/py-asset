import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import SubmitPropertyPage from './pages/SubmitPropertyPage';
import ContactPage from './pages/ContactPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import MortgagePage from './pages/MortgagePage';
import Navigation from './components/Navigation';

const App: React.FC = () => {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/list" element={<ListingPage />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/submit" element={<SubmitPropertyPage />} />
          <Route path="/mortgage" element={<MortgagePage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;