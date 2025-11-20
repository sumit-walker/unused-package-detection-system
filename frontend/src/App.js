import React, { useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import Header from './components/Header';
import './App.css';

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');

  const handleScanComplete = (results) => {
    setAnalysisResults(results);
    setActiveTab('dashboard');
  };

  const handleRescan = async (projectPath, language) => {
    try {
      const response = await axios.post('http://localhost:3001/api/analysis/scan', {
        projectPath,
        language: language || null
      });

      if (response.data.success) {
        setAnalysisResults(response.data.data);
      }
    } catch (error) {
      console.error('Rescan failed:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('scan')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scan'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scan Project
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              disabled={!analysisResults}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : !analysisResults
                  ? 'border-transparent text-gray-400 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'scan' ? (
          <Scanner onScanComplete={handleScanComplete} />
        ) : (
          <Dashboard 
            results={analysisResults} 
            onRescan={handleRescan}
          />
        )}
      </div>
    </div>
  );
}

export default App;

