# Unused Package Detection System — Frontend

React dashboard for the Unused Package Detection System. It talks to the **Express backend** (default `http://localhost:3001`) for scans, auto-removal, and optional Gemini-powered AI panels.

## Prerequisites

- Node.js 18+ recommended (aligned with backend `fetch` usage)
- npm, yarn, or pnpm

## Install

```bash
cd frontend
npm install
```

## Environment variables

Create `frontend/.env` (see `.gitignore` at repo root — do not commit secrets):

```bash
# Backend origin (no trailing slash). Must match where the API runs.
REACT_APP_API_BASE_URL=http://localhost:3001

# Optional legacy / other tooling
REACT_APP_ENV=development
```

After changing `.env`, restart `npm start`.

`src/config.js` reads `REACT_APP_API_BASE_URL` and builds URLs such as `/api/analysis/scan` and `/api/ai/predict-risk`.

## Development

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Ensure the backend is running (`npm start` from the **repository root** runs `backend/server.js` on port 3001 by default).

## Production build

```bash
npm run build
```

Output is under `frontend/build/`. Serve static files behind HTTPS and point `REACT_APP_API_BASE_URL` at your production API (or inject at build time for CRA).

## Project structure (actual)

```
frontend/
├── public/
├── src/
│   ├── App.js              # Tabs: Scan ↔ Dashboard
│   ├── config.js           # API_BASE / apiUrl()
│   ├── components/
│   │   ├── Scanner.js      # Project path + language → POST /api/analysis/scan
│   │   ├── Dashboard.js  # Charts, remove unused, AI insights
│   │   ├── AiInsights.js # Gemini: risk + alternative (uses scan results)
│   │   ├── VulnerabilityList.js
│   │   └── Header.js
│   ├── hooks/
│   └── index.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Features

- **Scan**: Absolute project path and optional language; results drive the dashboard.
- **Dashboard**: Summary cards, usage charts, vulnerabilities, unused table, storage impact.
- **Remove unused**: Confirmation modal; for **Node.js** projects, choose **npm**, **yarn**, or **pnpm** before confirming. Calls `POST /api/analysis/auto-remove` with `language` and `packageManager`.
- **AI insights (Gemini)**: After a scan, pick a package (or type a name) and call **AI risk prediction** / **AI smart alternative**. Requires backend `GEMINI_API_KEY` and working model id; otherwise the UI still loads and may show fallback messaging from the API.

## Deployment notes

- **Vercel / Netlify / static host**: Build with the correct `REACT_APP_API_BASE_URL` for your API; enable CORS on the backend for your frontend origin.
- **Same-origin**: If the API is reverse-proxied under the same host as `/api`, set `REACT_APP_API_BASE_URL` to that origin (or empty string + proxy — CRA proxy in `package.json` is optional).

## Related docs

Repository root `README.md` describes the full stack, CLI, CI workflow, and backend env vars.
