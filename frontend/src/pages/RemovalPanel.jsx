import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RemovalPanel.css';

function RemovalPanel() {
  const [selectedPackages, setSelectedPackages] = useState({});
  const [logs, setLogs] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);
  const navigate = useNavigate();

  const packages = [
    { id: 1, name: 'lodash-unused', version: '4.17.21', status: 'Unused', vulnerable: true },
    { id: 2, name: 'old-lib', version: '1.0.0', status: 'Unused', vulnerable: false },
    { id: 3, name: 'test-package', version: '2.1.0', status: 'Unused', vulnerable: true },
  ];

  const handleSelectPackage = (id) => {
    setSelectedPackages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = packages.reduce((acc, pkg) => ({ ...acc, [pkg.id]: true }), {});
    setSelectedPackages(allSelected);
  };

  const handleRemove = () => {
    setIsRemoving(true);
    const newLogs = [
      '[INFO] Starting removal process...',
      ...Object.entries(selectedPackages)
        .filter(([, selected]) => selected)
        .map(([id]) => {
          const pkg = packages.find((p) => p.id === parseInt(id));
          return `[SUCCESS] Removed: ${pkg.name} ${pkg.version}`;
        }),
      '[INFO] Removal complete.',
    ];
    setLogs(newLogs);
    setTimeout(() => setIsRemoving(false), 2000);
  };

  const selectedCount = Object.values(selectedPackages).filter(Boolean).length;

  return (
    <div className="removal-panel">
      <h1>Removal Panel</h1>

      <div className="package-selection">
        <h2>Select Packages to Remove</h2>
        <button onClick={handleSelectAll} className="btn btn-secondary">
          Select All
        </button>
        <div className="package-list">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-item">
              <input
                type="checkbox"
                checked={selectedPackages[pkg.id] || false}
                onChange={() => handleSelectPackage(pkg.id)}
              />
              <span className="package-name">{pkg.name} v{pkg.version}</span>
              <span className={`status-badge ${pkg.status.toLowerCase()}`}>{pkg.status}</span>
              {pkg.vulnerable && <span className="vulnerable-badge">🔒 Vulnerable</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="output-logs">
        <h2>Removal Logs</h2>
        <div className="log-console">
          {logs.length === 0 ? (
            <p className="log-placeholder">Logs will appear here...</p>
          ) : (
            logs.map((log, idx) => (
              <p key={idx} className={`log-line ${log.includes('[SUCCESS]') ? 'success' : log.includes('[ERROR]') ? 'error' : 'info'}`}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
        <button onClick={handleRemove} disabled={selectedCount === 0 || isRemoving} className="btn btn-primary">
          {isRemoving ? 'Removing...' : `Remove Selected (${selectedCount})`}
        </button>
        <button onClick={() => navigate('/report')} className="btn btn-primary">
          View Report
        </button>
      </div>
    </div>
  );
}

export default RemovalPanel;
