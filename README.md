# Schemantics — API Contract Drift Detector

Detects when a monitored API's response *shape* silently changes - renamed
fields, changed types, dropped fields, altered nesting - the kind of
breaking change that still returns `200 OK` and slips past uptime monitors.

Full spec: `api-contract-drift-detector-spec.md`
Build plan: `build-plan.md`

## Repo layout

```
schemantics/
├── server/          Node/Express API - CRUD, auth, scheduler, notifications
├── diff-service/    Python (FastAPI) schema-diffing microservice
└── client/          React (Vite) dashboard frontend
```

## Status: Day 1 complete

- [x] Repo structure
- [x] Express app skeleton (`server/`)
- [x] `.env` config
- [x] MongoDB connection module (non-blocking on failure)
- [x] Core middleware: cors, JSON body parsing, 404 handler, error handler
- [x] Health check route: `GET /api/health`

See `server/README-day1.md` for exact run/test instructions for this day.
