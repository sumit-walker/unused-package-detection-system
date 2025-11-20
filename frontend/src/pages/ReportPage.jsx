import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ReportPage.css';

function ReportPage() {
  const navigate = useNavigate();

  const reportData = {
    projectName: 'my-awesome-project',
    generatedDate: new Date().toLocaleDateString(),
    analyzationTime: '2m 34s',
    totalPackages: 45,
    unusedPackages: 13,
    vulnerablePackages: 5,
    storageSaved: '125 MB',
  };

  const handleDownload = (format) => {
    // TODO: Implement actual download logic
    console.log(`Downloading report as ${format}`);
    alert(`Report downloaded as ${format}`);
  };

  return (
    <div className="report-page">
      <h1>Analysis Report</h1>

      <div className="report-header">
        <h2>Unused Package Detection Report</h2>
        <p><strong>Project:</strong> {reportData.projectName}</p>
        <p><strong>Generated:</strong> {reportData.generatedDate}</p>
        <p><strong>Analysis Time:</strong> {reportData.analyzationTime}</p>
      </div>

      <div className="executive-summary">
        <h2>Executive Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Packages</h3>
            <p className="summary-value">{reportData.totalPackages}</p>
          </div>
          <div className="summary-card">
            <h3>Unused Found</h3>
            <p className="summary-value">{reportData.unusedPackages}</p>
          </div>
          <div className="summary-card">
            <h3>Vulnerable</h3>
            <p className="summary-value">{reportData.vulnerablePackages}</p>
          </div>
          <div className="summary-card">
            <h3>Storage Saved</h3>
            <p className="summary-value">{reportData.storageSaved}</p>
          </div>
        </div>
      </div>

      <div className="detailed-findings">
        <h2>Detailed Findings</h2>
        <p>Review the dashboard for detailed package information and security vulnerabilities.</p>
      </div>

      <div className="download-section">
        <h2>Download Report</h2>
        <div className="download-buttons">
          <button onClick={() => handleDownload('PDF')} className="btn btn-download">
            📄 Download as PDF
          </button>
          <button onClick={() => handleDownload('JSON')} className="btn btn-download">
            📋 Download as JSON
          </button>
          <button onClick={() => handleDownload('CSV')} className="btn btn-download">
            📊 Download as CSV
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          New Analysis
        </button>
      </div>
    </div>
  );
}

export default ReportPage;
