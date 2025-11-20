import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const handleSubmit = () => {
    if (file) {
      // TODO: Send file to backend API
      console.log('Uploading file:', file.name);
      navigate('/dashboard');
    } else {
      alert('Please select a project folder');
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Unused Package Detection System</h1>
        <p className="subtitle">Identify and remove unused dependencies effortlessly</p>

        <div className="upload-section">
          <label htmlFor="file-input" className="upload-btn">
            📁 Upload Project
          </label>
          <input
            id="file-input"
            type="file"
            webkitdirectory="true"
            onChange={handleFileUpload}
            className="file-input"
          />
          {file && <p className="file-name">Selected: {file.name}</p>}
          <button onClick={handleSubmit} className="submit-btn">
            Analyze Project
          </button>
        </div>

        <div className="quick-tips">
          <h2>Quick Tips</h2>
          <ul>
            <li>💡 Tip 1: Upload your project folder to scan for unused packages</li>
            <li>📊 Tip 2: Review the dashboard for detailed analysis</li>
            <li>🔒 Tip 3: Check security vulnerabilities before removal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
