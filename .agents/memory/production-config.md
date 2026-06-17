---
name: Production config
description: Production-readiness settings for Karma AI Express server
---

# Production Configuration

## PORT
`const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;`
**Why:** Autoscale/reserved VM deployments inject PORT via env. Hardcoding 5000 causes EADDRINUSE in production.

## CORS Middleware
Must be placed BEFORE `express.json()` and all route handlers in server.ts.
Pattern: reflect `req.headers.origin` back (supports credentials), handle OPTIONS preflight with 204.

## Firebase
Config at `firebase-applet-config.json` in project root. Uses `experimentalForceLongPolling: true` and a named Firestore database (`firestoreDatabaseId` field).
All Firestore calls are wrapped with a 2500ms timeout and fall back to in-memory cache — server never crashes on Firebase timeout.

## Build / Run
- Build: `npm run build` → `dist/` (Vite SPA) + `dist/server.cjs` (esbuild bundle)
- Run: `node dist/server.cjs` with `NODE_ENV=production`
- Static assets served from `dist/` in production, Vite middleware in dev
