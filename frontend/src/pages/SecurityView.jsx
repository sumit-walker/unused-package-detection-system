import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SecurityView.css';

function SecurityView() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Fetch vulnerabilities from backend API
    const mockVulnerabilities = [
      { id: 'CVE-2023-1234', package: 'lodash', severity: 'Critical', score: 9.2, description: 'Prototype pollution vulnerability', affected: '< 4.17.21' },
      { id: 'CVE-2023-5678', package: 'axios', severity: 'High', score: 7.5, description: 'SSRF vulnerability', affected: '< 1.4.0' },
      { id: 'CVE-2023-9012', package: 'moment', severity: 'Medium', score: 5.3, description: 'ReDoS vulnerability', affected: '< 2.29.4' },
    ];
    setVulnerabilities(mockVulnerabilities);
    setRiskScore(72); // Mock risk score
  }, []);

  const getRiskColor = (score) => {
    if (score <= 20) return '#0b7a3b';
    if (score <= 50) return '#f57c00';
    if (score <= 80) return '#ff6f00';
    return '#d32f2f';
  };

  const getSeverityBadgeClass = (severity) => {
    return `severity-${severity.toLowerCase()}`;
  };

  return (
    <div className="security-view">
      <h1>Security View</h1>

      <div className="risk-score-section">
        <h2>Overall Risk Score</h2>
        <div className="risk-score-card" style={{ borderColor: getRiskColor(riskScore) }}>
          <div className="risk-score-circle" style={{ backgroundColor: getRiskColor(riskScore) }}>
            <span className="risk-score-value">{riskScore}</span>
          </div>
          <p className="risk-assessment">
            {riskScore <= 20 ? 'Safe' : riskScore <= 50 ? 'Caution' : riskScore <= 80 ? 'Warning' : 'Critical'}
          </p>
        </div>
      </div>

      <div className="vulnerability-list">
        <h2>Vulnerabilities</h2>
        {vulnerabilities.map((vuln) => (
          <div key={vuln.id} className="vulnerability-card">
            <div className="vuln-header">
              <h3>{vuln.package}</h3>
              <span className={`severity-badge ${getSeverityBadgeClass(vuln.severity)}`}>
                {vuln.severity}
              </span>
            </div>
            <p className="vuln-id">CVE: {vuln.id}</p>
            <p className="vuln-description">{vuln.description}</p>
            <p className="vuln-affected">Affected: {vuln.affected}</p>
            <p className="vuln-score">CVSS Score: {vuln.score}/10</p>
            <button className="btn-details">View CVE Details</button>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
        <button onClick={() => navigate('/removal')} className="btn btn-primary">
          Remediate Vulnerabilities
        </button>
      </div>
    </div>
  );
}

export default SecurityView;
