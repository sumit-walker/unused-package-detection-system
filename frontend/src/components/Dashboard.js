import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import VulnerabilityList from './VulnerabilityList';
import axios from 'axios';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

function Dashboard({ results, onRescan }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeStatus, setRemoveStatus] = useState(null);
  const [rescanning, setRescanning] = useState(false);

  const handleAutoRemove = () => {
    if (results.dependencies.unused.length === 0) {
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmRemove = async () => {
    setShowConfirmModal(false);
    setRemoving(true);
    setRemoveStatus({ type: 'info', message: 'Removing unused packages...' });

    try {
      const response = await axios.post('http://localhost:3001/api/analysis/auto-remove', {
        projectPath: results.projectPath,
        unusedPackages: results.dependencies.unused.map(dep => dep.name)
      });

      if (response.data.success) {
        setRemoveStatus({ 
          type: 'success', 
          message: `Successfully removed ${results.dependencies.unused.length} unused packages! Rescanning project...` 
        });
        
        // Automatically rescan the project after successful removal
        if (onRescan) {
          setRescanning(true);
          try {
            await onRescan(results.projectPath, results.language);
            setRemoveStatus({ 
              type: 'success', 
              message: `Successfully removed packages and updated dashboard!` 
            });
          } catch (rescanError) {
            setRemoveStatus({ 
              type: 'error', 
              message: `Packages removed, but rescan failed: ${rescanError.message}` 
            });
          } finally {
            setRescanning(false);
          }
        }
      } else {
        setRemoveStatus({ 
          type: 'error', 
          message: response.data.error || 'Failed to remove packages' 
        });
      }
    } catch (error) {
      setRemoveStatus({ 
        type: 'error', 
        message: error.response?.data?.error || error.message || 'Failed to remove packages' 
      });
    } finally {
      setRemoving(false);
    }
  };

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analysis data available. Please scan a project first.</p>
      </div>
    );
  }

  const pieData = [
    { name: 'Used', value: results.summary.usedCount, color: COLORS[2] },
    { name: 'Unused', value: results.summary.unusedCount, color: COLORS[1] }
  ];

  const barData = [
    {
      category: 'Total',
      count: results.summary.totalDependencies
    },
    {
      category: 'Used',
      count: results.summary.usedCount
    },
    {
      category: 'Unused',
      count: results.summary.unusedCount
    }
  ];

  const vulnerabilityData = [
    { name: 'Critical', value: results.security.vulnerabilities.filter(v => v.severity === 'critical').length },
    { name: 'High', value: results.security.vulnerabilities.filter(v => v.severity === 'high').length },
    { name: 'Moderate', value: results.security.vulnerabilities.filter(v => v.severity === 'moderate').length },
    { name: 'Low', value: results.security.vulnerabilities.filter(v => v.severity === 'low').length }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Dependencies</p>
              <p className="text-2xl font-bold text-gray-900">{results.summary.totalDependencies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Used Packages</p>
              <p className="text-2xl font-bold text-green-600">{results.summary.usedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unused Packages</p>
              <p className="text-2xl font-bold text-red-600">{results.summary.unusedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vulnerabilities</p>
              <p className="text-2xl font-bold text-purple-600">{results.summary.vulnerabilityCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dependency Usage Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Dependency Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependency Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Storage Impact */}
      {results.dependencies.unused.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Impact</h3>
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Storage Savings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {results.impact.storageSavedMB} MB
                  <span className="text-lg text-gray-500 ml-2">({results.impact.storageSavedGB} GB)</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Packages to Remove</p>
                <p className="text-3xl font-bold text-blue-600">{results.impact.packagesToRemove}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleAutoRemove}
                disabled={removing}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{removing ? 'Removing...' : 'Remove Unused Packages'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Status */}
      {removeStatus && (
        <div className={`rounded-lg p-4 ${
          removeStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
          removeStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
          'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center">
            {rescanning && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{removeStatus.message}</span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Package Removal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove {results.dependencies.unused.length} unused package(s)?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
              <ul className="space-y-1">
                {results.dependencies.unused.slice(0, 10).map((dep, idx) => (
                  <li key={idx} className="text-sm text-gray-700">• {dep.name}</li>
                ))}
                {results.dependencies.unused.length > 10 && (
                  <li className="text-sm text-gray-500">... and {results.dependencies.unused.length - 10} more</li>
                )}
              </ul>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vulnerabilities */}
      <VulnerabilityList vulnerabilities={results.security.vulnerabilities} />

      {/* Unused Packages List */}
      {results.dependencies.unused.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Unused Packages</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.dependencies.unused.slice(0, 20).map((dep, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dep.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dep.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {dep.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.dependencies.unused.length > 20 && (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                ... and {results.dependencies.unused.length - 20} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

