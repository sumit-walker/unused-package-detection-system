# Unused Package Detection System - Frontend

## Setup

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in the browser.

### Build for Production

```bash
npm run build
```

## Deployment to Vercel / Firebase Hosting

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Auto-deploy on push to main branch

### Firebase Hosting
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
# Update package.json with "homepage": "https://username.github.io/repo"
npm run build
npm run deploy
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── SecurityView.jsx
│   │   ├── RemovalPanel.jsx
│   │   └── ReportPage.jsx
│   ├── styles/
│   │   ├── App.css
│   │   ├── Navbar.css
│   │   ├── HomePage.css
│   │   ├── Dashboard.css
│   │   ├── SecurityView.css
│   │   ├── RemovalPanel.css
│   │   └── ReportPage.css
│   ├── App.jsx
│   └── index.jsx
├── public/
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://your-backend-url/api
REACT_APP_ENV=production
```

## Features

- ✅ Home page with project upload
- ✅ Dashboard with package overview
- ✅ Security view with vulnerabilities
- ✅ Removal panel with logs
- ✅ Report generation and download

## TODO

- [ ] Connect to actual backend API
- [ ] Add dark/light theme toggle
- [ ] Implement real-time logs
- [ ] Add data export functionality
- [ ] Enhance mobile responsiveness
