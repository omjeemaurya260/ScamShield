# ScamShield Production Deployment Plan

## Goal

Prepare ScamShield as a single production service for Render. FastAPI will serve the built React/Vite frontend and retain API behavior under `/api/*`.

## Scope

- Update FastAPI to serve `frontend/dist` when it exists.
- Add SPA fallback only for non-API browser routes; unknown API routes must continue to return JSON 404 responses.
- Use Render's `PORT` and bind Uvicorn to `0.0.0.0`.
- Make the frontend use same-origin relative API paths in production while retaining the local Vite proxy workflow.
- Add a multi-stage production Dockerfile, `.dockerignore`, `render.yaml`, and a safe production environment example.
- Update deployment and local validation documentation.

## Files to create

- `Dockerfile` — Node build stage followed by Python runtime stage.
- `.dockerignore` — excludes local dependencies, secrets, caches, and runtime data.
- `render.yaml` — Render web service definition using the Dockerfile and non-secret environment defaults.
- `.env.production.example` — production configuration template containing no credentials.
- `.github/modernize/deployment/progress.md` — execution tracking.
- `.github/modernize/deployment/summary.md` — completion summary.

## Files to update

- `backend/app/main.py` — static frontend mounting, SPA fallback, API-safe 404 handling, and production path configuration.
- `frontend/src/services/api.ts` — same-origin relative API default.
- `README.md` — Render/Docker deployment instructions and validation commands.

## Deployment type

Single-service container deployment on Render. The container runs one Uvicorn process serving both the FastAPI API and the frontend static assets. MongoDB and external AI/notification services remain configurable dependencies and are not provisioned by this change.

## Runtime configuration

- `PORT` is supplied by Render; default `8000` supports local execution.
- `HOST` defaults to `0.0.0.0`.
- `CORS_ORIGINS` should be set to the deployed origin only when cross-origin clients are needed; same-origin frontend requests do not require CORS.
- API keys, database URLs, and notification credentials must be supplied through Render environment/secrets and never committed.

## Execution and validation steps

1. Implement the FastAPI static serving and fallback without changing existing API routers.
2. Change the frontend API default to `/api`.
3. Add container and Render configuration plus production environment documentation.
4. Build the frontend with `npm ci` and `npm run build`.
5. Install backend dependencies and run Uvicorn using `HOST`/`PORT`.
6. Verify `/`, a frontend deep-link, `/api/health`, and an unknown `/api/*` path. Confirm API 404 is JSON and frontend routes return the SPA.
7. Review changed files for secrets and summarize results.
