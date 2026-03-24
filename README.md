# Nextrade

Nextrade is a Flask + React (ESM-in-browser) digital asset trading app with:
- Public landing experience
- Authenticated dashboard on `/`
- Wallet-backed buy/sell APIs
- Simulated live market pricing

## Core Features

- User auth: register, login, logout
- Wallet balance per user (`users.balance`, default `$10,000.00`)
- Asset trading APIs:
  - Buy subtracts from wallet
  - Sell adds to wallet
- Dashboard APIs:
  - Holdings (`/api/user-assets`)
  - Summary (`/api/dashboard-summary`)
  - Market assets (`/api/market-assets`)
- Live price simulation on every `/explore` request (±0.2%)
- Shared Jinja base template (`templates/layout.html`) for server-rendered pages
- React dashboard UI with:
  - `DashboardHeader` stats bar
  - holdings grid
  - quick trade sidebar

## Tech Stack

- Backend: Flask, SQLite (local), optional PostgreSQL via `DATABASE_URL`
- Frontend: React 18 ESM modules, Tailwind via CDN
- Styling: custom dark theme + glassmorphism

## Project Structure

- `app.py` - Flask app, DB init/migrations, auth, APIs
- `templates/index.html` - React app mount page
- `templates/layout.html` - shared server-rendered shell
- `templates/*.html` - server-rendered pages (explore/portfolio/login/etc)
- `static/js/nextrade/main.js` - frontend app entry
- `static/js/nextrade/components/dashboardView.js` - logged-in dashboard
- `static/js/nextrade/components/dashboardHeader.js` - runtime header component
- `static/js/nextrade/components/DashboardHeader.jsx` - JSX version with mock stats
- `static/css/nextrade-theme.css` - shared Jinja page theme
- `static/css/nextrade-react.css` - React page styles

## Setup

From project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run

```powershell
python app.py
```

Open:
- `http://127.0.0.1:5000/`

## Environment Variables

- `SECRET_KEY` - Flask secret key
- `DATABASE_URL` - set to PostgreSQL URL to use Postgres in deployment
- `PORT` - optional port override

## Main Routes

- `/` - landing page (or logged-in dashboard)
- `/explore`
- `/how-it-works`
- `/portfolio` (login required)
- `/buy-crypto` (login required)
- `/sell-points` (login required)
- `/nft-marketplace` (login required)
- `/login`, `/register`, `/logout`

## API Endpoints

- `POST /api/buy-asset`
  - body: `{ "asset_id": <int>, "quantity": <number> }`
  - returns `400` for malformed JSON or insufficient wallet balance
- `POST /api/sell-asset`
  - body: `{ "asset_id": <int>, "quantity": <number> }`
- `GET /api/user-assets`
- `GET /api/market-assets`
- `GET /api/dashboard-summary`

## Notes

- Frontend React/Tailwind assets are loaded via CDN, so internet access is required.
- DB init/migration runs automatically at app startup/import (`init_db()`), including balance column checks and SQLite ID backfill.
