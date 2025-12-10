import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import SubmitPropertyPage from './pages/SubmitPropertyPage';
import ContactPage from './pages/ContactPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import MortgagePage from './pages/MortgagePage';
import LoginPage from './pages/LoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEditPage from './pages/AdminEditPage';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative shadow-2xl">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/list" component={ListingPage} />
          <Route path="/property/:id" component={PropertyDetailPage} />
          <Route path="/submit" component={SubmitPropertyPage} />
          <Route path="/mortgage" component={MortgagePage} />
          <Route path="/contact" component={ContactPage} />
          
          <Route path="/login" component={LoginPage} />
          
          {/* Protected Admin Routes */}
          <ProtectedRoute exact path="/admin" component={AdminDashboardPage} />
          <ProtectedRoute path="/admin/add" component={AdminEditPage} />
          <ProtectedRoute path="/admin/edit/:id" component={AdminEditPage} />
        </Switch>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;