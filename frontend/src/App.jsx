import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import SecurityView from './pages/SecurityView';
import RemovalPanel from './pages/RemovalPanel';
import ReportPage from './pages/ReportPage';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/security" element={<SecurityView />} />
            <Route path="/removal" element={<RemovalPanel />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
