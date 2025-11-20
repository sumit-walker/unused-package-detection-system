import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch data from backend API
    const mockData = {
      totalPackages: 45,
      usedPackages: 32,
      unusedPackages: 13,
      vulnerablePackages: 5,
    };
    setData(mockData);

    const mockPackages = [
      { id: 1, name: 'react', version: '18.2.0', status: 'Used', severity: 'None', lastUpdated: '2024-01-10' },
      { id: 2, name: 'lodash-unused', version: '4.17.21', status: 'Unused', severity: 'High', lastUpdated: '2023-06-15' },
      { id: 3, name: 'axios', version: '1.4.0', status: 'Used', severity: 'Low', lastUpdated: '2024-01-05' },
    ];
    setPackages(mockPackages);
  }, []);

  const chartData = data ? [
    { name: 'Used', value: data.usedPackages, fill: '#0b7a3b' },
    { name: 'Unused', value: data.unusedPackages, fill: '#d32f2f' },
  ] : [];

  const getSeverityColor = (severity) => {
    const colors = { None: '#0b7a3b', Low: '#f57c00', Medium: '#ff6f00', High: '#d32f2f', Critical: '#b71c1c' };
    return colors[severity] || '#757575';
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {data && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Packages</h3>
            <p className="metric-value">{data.totalPackages}</p>
          </div>
          <div className="metric-card">
            <h3>Used</h3>
            <p className="metric-value" style={{ color: '#0b7a3b' }}>{data.usedPackages}</p>
          </div>
          <div className="metric-card">
            <h3>Unused</h3>
            <p className="metric-value" style={{ color: '#d32f2f' }}>{data.unusedPackages}</p>
          </div>
          <div className="metric-card">
            <h3>Vulnerable</h3>
            <p className="metric-value" style={{ color: '#f57c00' }}>{data.vulnerablePackages}</p>
          </div>
        </div>
      )}

      <div className="chart-section">
        <h2>Package Usage Summary</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} fill="#8884d8" dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="table-section">
        <h2>All Dependencies</h2>
        <table className="packages-table">
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Version</th>
              <th>Status</th>
              <th>Severity</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>{pkg.version}</td>
                <td><span className={`status-badge ${pkg.status.toLowerCase()}`}>{pkg.status}</span></td>
                <td>
                  <span className="severity-badge" style={{ backgroundColor: getSeverityColor(pkg.severity) }}>
                    {pkg.severity}
                  </span>
                </td>
                <td>{pkg.lastUpdated}</td>
                <td>
                  <button className="action-btn">View</button>
                  <button className="action-btn remove">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/security')} className="btn btn-primary">
          View Security Details
        </button>
        <button onClick={() => navigate('/removal')} className="btn btn-primary">
          Remove Packages
        </button>
        <button onClick={() => navigate('/report')} className="btn btn-primary">
          Generate Report
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
