import React, { useState } from 'react';
import axios from 'axios';

function Scanner({ onScanComplete }) {
  const [projectPath, setProjectPath] = useState('');
  const [language, setLanguage] = useState('nodejs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/analysis/scan', {
        projectPath,
        language: language || null // null means auto-detect
      });

      if (response.data.success) {
        onScanComplete(response.data.data);
      } else {
        setError(response.data.error || 'Scan failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to scan project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Scan Your Project
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectPath" className="block text-sm font-medium text-gray-700 mb-2">
              Project Path
            </label>
            <input
              type="text"
              id="projectPath"
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the absolute path to your project directory
            </p>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Project Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Auto-detect</option>
              <option value="nodejs">Node.js</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Leave as "Auto-detect" to automatically identify the project language
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning...
              </span>
            ) : (
              'Start Scan'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Detect unused dependencies across Node.js, Python, and Java projects
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Security vulnerability scanning with npm audit, pip-audit, and OWASP Dependency Check
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Storage impact analysis and recommendations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Scanner;