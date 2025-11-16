# Unused Package Detection System

A cross-language CLI + dashboard tool that analyzes project folders to detect, visualize, and safely remove unused dependencies. Supports Node.js, Python, and Java projects. Helps developers reduce dependency bloat, save storage, improve build times, and enhance security.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![npm](https://img.shields.io/badge/npm-unused--package--detector-red)

## 📦 Install as npm Package

### Global Installation (Recommended for CLI)

```bash
npm install -g unused-package-detector
```

After installation, use the CLI command from anywhere:

```bash
# Scan any project - just provide the path!
unused-packages scan /path/to/your/project

# Or scan current directory
cd /path/to/your/project
unused-packages scan .
```

> **💡 Important:** The system analyzes **any project path you provide**, not just a specific example project. You can scan any Node.js, Python, or Java project on your system!

### Local Installation

```bash
npm install unused-package-detector
```

Then use via npx:

```bash
npx unused-packages scan /path/to/project
```

Or add to your project's scripts in `package.json`:

```json
{
  "scripts": {
    "check-unused": "unused-packages scan ."
  }
}
```

## 🎯 Features

- **Multi-language Support**: Detect unused packages in Node.js, Python, and Java projects
- **CLI Interface**: Command-line tool for quick analysis and cleanup
- **Web Dashboard**: Beautiful React-based visualization with charts and insights
- **Security Scanning**: Integration with npm audit, pip-audit, and OWASP Dependency Check
- **Storage Impact**: Quantify storage savings from removing unused packages
- **Safe Auto-removal**: Remove unused packages with confirmation prompts
- **Detailed Reports**: Comprehensive JSON reports with all findings
- **Auto-detection**: Automatically detects project language from dependency files

## 🏗️ Architecture

```
unused-package-detection-system/
├── backend/              # Express.js API server
│   ├── routes/          # API endpoints
│   ├── controllers/     # Request handlers
│   ├── services/        # Core business logic
│   ├── parsers/         # Dependency file parsers
│   └── analyzers/       # Code analysis modules
├── frontend/            # React dashboard
│   └── src/
│       └── components/  # React components
├── cli/                 # Command-line interface
├── tests/               # Test suites
└── example-project/     # Demo project
```

## 🚀 Quick Start

### Using as npm Package (Recommended)

1. **Install globally:**
```bash
npm install -g unused-package-detector
```

2. **Scan a project:**
```bash
unused-packages scan /path/to/your/project
```

3. **With options:**
```bash
# Auto-detect language
unused-packages scan /path/to/project

# Specify language
unused-packages scan /path/to/project --language python

# JSON output
unused-packages scan /path/to/project --json

# Auto-remove unused packages
unused-packages scan /path/to/project --remove-unused
```

### Development Setup

For contributing or running the dashboard locally:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unused-package-detector.git
cd unused-package-detector
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install && cd ..
```

3. (Optional) Copy environment template:
```bash
cp env.example .env
```

### Running the Application

#### Backend Server
```bash
npm start
# or with hot-reload
npm run dev
```

Server will run on `http://localhost:3001`

#### Frontend Dashboard
```bash
npm run frontend
```

Dashboard will run on `http://localhost:3000`

#### CLI Tool (when installed globally)
```bash
unused-packages scan <project-path>
```

#### CLI Tool (local development)
```bash
npm run cli scan <project-path>
```

## 📖 Usage Guide

### CLI Usage

**Basic scan (auto-detect language):**
```bash
unused-packages scan /path/to/project
```

**Specify language:**
```bash
unused-packages scan /path/to/project --language nodejs
unused-packages scan /path/to/project --language python
unused-packages scan /path/to/project --language java
```

**JSON output:**
```bash
unused-packages scan /path/to/project --json
```

**Auto-remove unused packages:**
```bash
unused-packages scan /path/to/project --remove-unused
```

**Open dashboard:**
```bash
unused-packages scan /path/to/project --open-dashboard
```

### API Usage

**Scan a project:**
```bash
curl -X POST http://localhost:3001/api/analysis/scan \
  -H "Content-Type: application/json" \
  -d '{"projectPath": "/path/to/project", "language": "nodejs"}'
```

**Get all reports:**
```bash
curl http://localhost:3001/api/reports
```

### Web Dashboard

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Enter project path and click "Start Scan"
4. View results in the dashboard with interactive charts

## 📊 Output Format

### CLI Output

```
📊 Analysis Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary:
  Total Dependencies: 25
  ✅ Used: 18
  ❌ Unused: 7
  ⚠️  Missing: 0
  🔒 Vulnerabilities: 3

❌ Unused Packages:
  • lodash (^4.17.21)
  • moment (^2.29.4)
  ...

💾 Storage Impact:
  Estimated Savings: 35.00 MB (0.034 GB)
  Packages to Remove: 7
```

### JSON Report

```json
{
  "projectPath": "/path/to/project",
  "summary": {
    "totalDependencies": 25,
    "usedCount": 18,
    "unusedCount": 7,
    "missingCount": 0,
    "vulnerabilityCount": 3
  },
  "dependencies": {
    "used": [...],
    "unused": [
      {
        "name": "lodash",
        "version": "^4.17.21",
        "type": "dependency"
      }
    ],
    "missing": []
  },
  "security": {
    "vulnerabilities": [
      {
        "package": "express",
        "severity": "moderate",
        "title": "Path Traversal vulnerability"
      }
    ],
    "criticalCount": 0,
    "highCount": 1
  },
  "impact": {
    "storageSavedMB": "35.00",
    "storageSavedGB": "0.034",
    "packagesToRemove": 7
  }
}
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `SNYK_API_KEY`: Snyk API key for security scanning (optional)
- `NPM_AUDIT_ENABLED`: Enable npm audit scanning (default: true)

## 🌟 Features by Language

### Node.js ✅
- Parse `package.json` dependencies and devDependencies
- Detect ES6 and CommonJS imports
- npm audit integration
- Support for TypeScript files (.ts, .tsx)
- Support for JavaScript files (.js, .jsx)

### Python ✅
- Parse `requirements.txt`, `setup.py`, and `pyproject.toml`
- Detect Python imports from `.py` files
- pip-audit and safety integration
- Automatic virtual environment detection

### Java ✅
- Parse Maven `pom.xml` files
- Parse Gradle `build.gradle` and `build.gradle.kts` files
- Detect Java imports from `.java` files
- OWASP Dependency Check integration
- Support for Maven and Gradle projects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Roadmap

- [x] Node.js detection module
- [x] CLI interface
- [x] React dashboard
- [x] Security scanning integration
- [x] Python support
- [x] Java support
- [ ] CI/CD integration
- [ ] AI-powered optimization suggestions
- [ ] Enterprise features
- [ ] Docker support
- [ ] GitHub Actions integration

## 🔒 Security

The system uses industry-standard security practices:
- npm audit for Node.js projects
- Secure dependency parsing
- Validation of all inputs
- Safe package removal with confirmations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Express.js and React
- Charts powered by Recharts
- Security scanning via npm audit
- Styled with Tailwind CSS

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Made with ❤️ for developers who care about clean dependencies

