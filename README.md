# Unused Package Detection System

A cross-language CLI + dashboard tool that analyzes project folders to detect, visualize, and safely remove unused dependencies. Supports Node.js, Python, and Java projects. Helps developers reduce dependency bloat, save storage, improve build times, and enhance security. Optional **Google Gemini** integration adds AI risk scoring and dependency alternatives in the API and dashboard.



## Install as npm Package

### Global installation (recommended for CLI)

```bash
npm install -g unused-package-detector
```

```bash
unused-packages scan /path/to/your/project
cd /path/to/your/project && unused-packages scan .
```

The tool analyzes **whatever project path you pass** (Node.js, Python, or Java).

### Local installation

```bash
npm install unused-package-detector
```

```bash
npx unused-packages scan /path/to/project
```

Add scripts in your app’s `package.json`:

```json
{
  "scripts": {
    "check-unused": "unused-packages scan .",
    "prune-unused": "unused-packages remove -y --pm npm ."
  }
}
```

## Features

- **Multi-language support**: Node.js, Python, and Java
- **CLI**: Scan, JSON output, and **non-interactive removal** (`remove -y --pm`)
- **Web dashboard**: React UI with charts, unused list, **npm/yarn/pnpm** removal, and **Gemini AI** panel
- **Security**: npm audit, pip-audit / safety, OWASP-style flows where configured
- **Storage impact**: Estimated savings from removing unused packages
- **AI (optional)**: Risk prediction and smart alternatives via Gemini (`/api/ai/*`)
- **CI**: GitHub Actions workflow + `CI=true` guards so prompts never hang in automation
- **Auto-detection**: Language from `package.json`, `requirements.txt`, `pom.xml`, etc.

## Architecture

```
unused-package-detection-system/
├── backend/                 # Express API
│   ├── routes/              # analysis.js, ai.js
│   ├── controllers/       # analysisController, aiController
│   ├── services/            # analyzer, security, geminiRiskAnalyzer, geminiRecommendationService, …
│   ├── parsers/             # nodejs, python, java
│   ├── analyzers/
│   └── .env                 # local secrets (gitignored); see Environment
├── frontend/                # React (CRA-style) dashboard
│   └── src/
│       ├── components/      # Scanner, Dashboard, AiInsights, …
│       └── config.js        # API base URL
├── cli/                     # Commander CLI (scan, remove)
├── .github/workflows/       # e.g. remove-unused-dependencies.yml
└── example-project/
```

## Quick start

### As a global CLI

```bash
npm install -g unused-package-detector
unused-packages scan /path/to/your/project
```

### Development (clone this repo)

```bash
git clone https://github.com/sumit-walker/unused-package-detector.git
cd unused-package-detector
npm install
cd frontend && npm install && cd ..
```

**Backend**

```bash
npm start
```

Runs at `http://localhost:3001` (override with `PORT`).

**Frontend**

```bash
npm run frontend
```

Runs at `http://localhost:3000`. Set `REACT_APP_API_BASE_URL` in `frontend/.env` if the API is not on port 3001.

**CLI from repo root**

```bash
npm run cli -- scan .
npm run cli -- remove --help
```

## CLI usage

### Scan

```bash
unused-packages scan /path/to/project
unused-packages scan . --language python
unused-packages scan . --json
```

**Remove during scan** (interactive prompts; **do not use in CI** without TTY):

```bash
unused-packages scan /path/to/project --remove-unused
unused-packages scan /path/to/project --remove-unused --pm pnpm
```

### Remove (dedicated command)

Scans then uninstalls all unused dependencies for that project.

```bash
# Interactive (confirm + package manager for Node)
unused-packages remove /path/to/project

# CI / automation: no prompts (Node defaults to npm if --pm omitted)
unused-packages remove -y --pm npm /path/to/project
unused-packages remove -y --pm yarn .
unused-packages remove -y -j .
```

From this repository:

```bash
npm run remove-unused -- --help
npm run ci:remove-unused
```

If `CI=true` and `--yes` is missing, `remove` exits with an error message instead of hanging on prompts. The same applies to `scan --remove-unused` in CI (use `remove -y` instead).

## REST API

Base URL: `http://localhost:3001` (or your deployed host).

### Analysis

**POST `/api/analysis/scan`**

```json
{ "projectPath": "/absolute/path/to/project", "language": "nodejs" }
```

`language` may be omitted for auto-detect. Response: `{ "success": true, "data": { ... } }`.

**POST `/api/analysis/auto-remove`**

Removes listed packages in `projectPath`.

```json
{
  "projectPath": "/path/to/project",
  "unusedPackages": ["lodash", "moment"],
  "language": "nodejs",
  "packageManager": "npm"
}
```

- **Node.js**: `packageManager` is `npm`, `yarn`, or `pnpm` (default `npm`).
- **Python**: `language` `python` — runs `pip uninstall -y` (omit `packageManager`).
- **Java**: returns an error; edit Maven/Gradle files manually.

**GET `/api/health`**

### AI (Gemini)

Requires `GEMINI_API_KEY` or `GOOGLE_API_KEY` in `backend/.env`. Optional: `GEMINI_MODEL` (default model id is kept in sync with current Google AI models, e.g. `gemini-2.5-flash`).

**POST `/api/ai/predict-risk`**

```json
{
  "package": "lodash",
  "vulnerabilities": 0,
  "lastUpdated": null,
  "downloads": 0,
  "ageInDays": 0
}
```

**POST `/api/ai/recommend`**

```json
{ "package": "moment" }
```

Responses may include `usedFallback` / `fallbackReason` when the model is unavailable or returns invalid data.

## Web dashboard

1. Start backend (`npm start`) and frontend (`npm run frontend`).
2. Open `http://localhost:3000`.
3. Enter an **absolute** project path and run **Start Scan**.
4. Open the **Dashboard** tab for charts, unused list, **Remove unused packages** (choose package manager for Node), and **AI insights (Gemini)**.

## CI: GitHub Actions

Workflow: **`.github/workflows/remove-unused-dependencies.yml`**

- **Actions → Remove unused dependencies → Run workflow**
- Inputs: path to the folder that contains `package.json`, and `npm` / `yarn` / `pnpm`.
- Installs dependencies, then runs: `node cli/index.js remove -y --pm <manager> <path>`.

The workflow does not commit changes; open a PR with updated `package.json` and lockfiles after review.

## Environment variables

### Backend (`backend/.env`, gitignored)

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3001`) |
| `GEMINI_API_KEY` or `GOOGLE_API_KEY` | Gemini API for `/api/ai/*` |
| `GEMINI_MODEL` | Override model id (optional) |

The server loads `backend/.env` first, then a `.env` in the current working directory.

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_BASE_URL` | Backend origin, e.g. `http://localhost:3001` (no trailing slash) |

Rebuild or restart the dev server after changing frontend env vars.

### Optional / tooling

- `SNYK_API_KEY`, npm audit behavior, etc., may be used by scanners where integrated.

## Output shape (summary)

Scan `data` includes `language`, `projectPath`, `summary`, `dependencies` (`used`, `unused`, `missing`), `security.vulnerabilities`, `outdated`, and `impact` (storage estimates). Use `--json` on the CLI for the full object.

## Testing

```bash
npm test
```

## Language support

### Node.js

- `package.json` dependencies / devDependencies  
- Import detection in `.js`, `.jsx`, `.ts`, `.tsx`  
- npm audit; removal via npm, yarn, or pnpm  

### Python

- `requirements.txt`, `setup.py`, `pyproject.toml`  
- pip-audit / safety when available  
- Removal: `pip uninstall -y` (requirements file may need manual edits)  

### Java

- Maven / Gradle parsing  
- Removal is manual (pom / Gradle edits)  

## Roadmap (high level)

- [x] Node.js, Python, Java detection  
- [x] CLI + dashboard  
- [x] Security scanning hooks  
- [x] AI-powered risk + recommendations (Gemini)  
- [x] CI-friendly removal + GitHub Actions workflow  
- [ ] Docker image / one-click deploy templates  
- [ ] Deeper enterprise / policy features  

## Security notes

- Prefer **environment variables** for API keys; never commit `.env`.
- Review unused lists before removal in production.
- Rotate any API key that was ever committed or pasted into a public channel.

## Acknowledgments

- Express, React, Recharts, Tailwind-oriented UI patterns  
- Google Gemini API for optional AI features  

The system uses industry-standard security practices:
- npm audit for Node.js projects
- Secure dependency parsing
- Validation of all inputs
- Safe package removal with confirmations

## 🙏 Acknowledgments

- Built with Express.js and React
- Charts powered by Recharts
- Security scanning via npm audit
- Styled with Tailwind CSS

## License

MIT — see the `LICENSE` file in the repository.
