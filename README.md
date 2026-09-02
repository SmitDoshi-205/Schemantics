# Schemantics

**API Contract Drift Detector** — monitors your API responses for silent structural changes (renamed fields, changed types, dropped data) that still return `200 OK`.

Uptime monitors tell you an API responded. Schemantics tells you whether the response still looks the way your code expects.

---

## The Problem

A field gets renamed. A type changes. Your API still returns `200`. Every uptime dashboard stays green — while your pipeline quietly corrupts data for days before anyone notices. This tool answers **"did the shape of the response change"**, not just "is it up."

---

## How It Works

1. **Register an endpoint** — a URL, method, optional headers, and a check interval.
2. **Baseline capture** — the first successful call becomes the expected schema, automatically.
3. **Every subsequent check** — the scheduler calls the same URL again and diffs the new response's shape against the stored baseline, field by field.
4. **Severity classification** — a removed field or changed type is *breaking*; a new field is a *warning*.
5. **Rename heuristic** — if exactly one field was removed and one added with a matching type in the same check, it's flagged as a "possible rename" instead of two unrelated changes.
6. **Alerts** — email and/or webhook fire the moment a breaking or warning change is detected.
7. **Accept or reject** — "Reset Baseline" lets you accept a detected change as the new normal.

Schemantics never modifies the API being watched — it's a passive observer. Changes happen on the API provider's side (a third-party team ships an update, or your own backend team deploys new code) — completely independent of this tool.

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express, MongoDB (Mongoose), JWT auth, `node-cron` |
| Schema-diff service | Python, FastAPI |
| Frontend | React, Vite, Tailwind CSS v4 |
| Notifications | Email (Resend) + generic webhook (Discord/Slack-compatible) |

---

## Architecture

```
React (Vite) ──► Node/Express API ──► MongoDB
                       │
                       ▼
              Checker module (HTTP)
                       │
                       ▼
         Python FastAPI diff service
   (schema extraction, comparison, severity,
         rename-detection heuristic)
```

---

## Project Structure

```
schemantics/
├── server/          Node/Express API — auth, endpoint CRUD, scheduler, notifications
├── diff-service/    Python FastAPI — schema extraction, comparison, severity
├── client/          React (Vite) dashboard
└── demo-api/        Standalone mock API for live drift demos
```

---

## Core Features

- JWT authentication (register / login / password reset)
- Per-endpoint CRUD with custom headers and configurable check interval
- Automatic baseline capture on registration
- Background scheduler — every endpoint checked independently, forever
- Field-level schema diffing with severity classification (breaking / warning)
- Rename detection heuristic
- Email + webhook notifications on drift
- Dashboard with live status badges, response-time chart, full check history
- Diff detail view — baseline vs. captured response, field-by-field, highlighted
- Reset-baseline flow to accept intentional changes

---

## Local Setup

**Requires:** Node 18+, Python 3.10+, MongoDB running locally.

```bash
#1. Cloning the repository
git clone https://github.com/SmitDoshi-205/Schemantics.git

# 2. Python diff-service
cd diff-service
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# 3. Node backend (new terminal)
cd server
npm install
copy .env.example .env         # fill in real values, see below
npm run dev

# 4. Frontend (new terminal)
cd client
npm install
copy .env.example .env
npm run dev
```

Open **http://localhost:5173**.

### Environment variables — `server/.env`

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/schemantics
JWT_SECRET=replace_with_a_real_secret
DIFF_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Email:
RESEND_API_KEY=re_...
ALERT_FROM_EMAIL=Schemantics <onboarding@resend.dev>

```

### Environment variables — `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## Testing

```bash
cd server && npm test          # Jest + Supertest, real in-memory MongoDB
cd diff-service && pytest      # extraction, comparison, severity, rename heuristic
```

### Manual drift testing with the demo API

```bash
cd demo-api
npm install
npm start
```
Register `http://localhost:4000/item` (any HTTP method) in the dashboard. Once a baseline is captured, break it live:
```bash
curl.exe -X POST http://localhost:4000/break/get
```
Run "Check Now" in the dashboard — a real, live-detected diff appears. Restore with:
```bash
curl.exe -X POST http://localhost:4000/reset/get
```

---

## Deployment

- **Backend + diff-service:** Render 
- **Frontend:** Vercel
- **Database:** MongoDB Atlas 

---
