# QA Sprint 1 Report

**Date:** 2026-06-28  
**Tester:** QA Engineer (Nebula Agent)  
**Project:** ADB Fleet Manager

---

## Summary

**PASS** — All 9 acceptance criteria verified against committed code. Backend starts and all three API endpoints return correct responses. Frontend builds successfully. Two minor setup/environment issues noted; neither blocks Phase F.

---

## Acceptance Criteria Results

| # | Criteria | Status | Notes |
|---|---|---|---|
| 1 | backend/src/index.js — Express, port 3001, Socket.IO mounted, tracker.start() called | PASS | `socket.init(server)` called before listen; `tracker.start()` called inside listen callback. PORT defaults to 3001 via env var. |
| 2 | backend/src/socket.js — exports init(server) and getIO(); no inline setup | PASS | Module exports exactly `init` and `getIO`; Socket.IO Server only instantiated inside `init()`. |
| 3 | backend/src/adb/tracker.js — adbkit tracker with add/remove/change handlers, emits Socket.IO events, handles errors without crashing | PASS | All three handlers registered; each wrapped in try/catch; `tracker.on('error')` registered; startup failure caught gracefully. |
| 4 | backend/src/adb/deviceInfo.js — fetches model, manufacturer, androidVersion, batteryLevel | PASS | Uses `getprop` for model/manufacturer/androidVersion; `dumpsys battery` with regex `/level:\s*(\d+)/` for battery; returns nulls on failure. |
| 5 | backend/src/routes/devices.js — GET /api/devices, GET /:serial, GET /:serial/users, POST /scan | PASS | All four routes defined. POST /scan calls `tracker.refresh()` and returns `{status:'scanning'}`. |
| 6 | frontend/src/store/deviceStore.js — Zustand store with setDevices, upsertDevice, removeDevice | PASS | All three actions implemented with correct logic. |
| 7 | frontend/src/hooks/useDevices.js — fetches GET /api/devices, Socket.IO, device:connected/updated/disconnected | PASS | All three events handled. Note: `device:disconnected` upserts device as OFFLINE rather than calling `removeDevice` — intentional design choice to keep offline devices visible. |
| 8 | frontend/src/components/DeviceCard.jsx — serial truncated, model/manufacturer, status badge, battery bar, Android version, user count | PASS | Serial truncated at 12 chars with ellipsis; status badge uses green/red/yellow bg classes; battery bar colored red <20%, yellow <50%, green ≥50%; all fields rendered. |
| 9 | frontend/src/pages/Dashboard.jsx — useDevices hook, grid-cols-1 sm:grid-cols-2 lg:grid-cols-3, empty state, Scan button | PASS | Grid classes exact match; empty state message when devices.length === 0; Scan button calls POST /scan with loading state. |

---

## Backend Startup Test

**Status: PASS**

Started backend with `PORT=3002` (port 3001 occupied by Nebula host app in this environment). Server output:

```
Server running on port 3002
Failed to start ADB tracker (is adb running?): spawn adb ENOENT
```

- Server started without crashing.
- ADB tracker startup failure handled gracefully — error logged, no uncaught exception.
- In production with ADB installed, tracker will initialize normally.

---

## API Endpoint Tests

**Status: PASS** (tested on port 3002 with `DATABASE_URL=file:./dev.db`)

| Endpoint | Expected | Actual | Result |
|---|---|---|---|
| `GET /api/health` | 200 `{status:'ok'}` | `{"status":"ok"}` | PASS |
| `GET /api/devices` | 200 `[]` | `[]` | PASS |
| `POST /api/devices/scan` | 200 `{status:'scanning'}` | `{"status":"scanning"}` | PASS |

**Note on DATABASE_URL:** The `.env` file contains `DATABASE_URL=file:./dev.db` (correct — Prisma resolves relative to `prisma/schema.prisma`). In this test environment, dotenv did not auto-load the `.env` file when the process was launched via bash subshell. The env var was supplied manually (`DATABASE_URL=file:./dev.db`) and all endpoints responded correctly. The code and `.env` file are correct; this is a shell/environment launch concern.

---

## Frontend Build Test

**Status: PASS** (after dependency fix)

Initial build failed:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react'
```

`@vitejs/plugin-react` was listed in `devDependencies` in `package.json` but not present in `node_modules`. Running `npm install @vitejs/plugin-react` resolved the issue.

Build output after fix:
```
vite v8.1.0 building client environment for production...
✓ 52 modules transformed.
dist/index.html                  0.45 kB │ gzip:  0.29 kB
dist/assets/index-nqMpL4T3.css  1.78 kB │ gzip:  0.81 kB
dist/assets/index-CCotmS_O.js  236.72 kB │ gzip: 74.33 kB
✓ built in 183ms
```

---

## Issues Found

1. **Missing devDependency in node_modules** (Minor)  
   `@vitejs/plugin-react` is in `package.json` devDependencies but not installed in `node_modules`. Requires `npm install` to be run before first build. Likely a fresh-clone setup step that was missed.  
   **Fix:** Run `npm install` in `/frontend` before deploying or ensure CI runs `npm ci`.

2. **dotenv not auto-loading in bash subshell** (Minor/Environmental)  
   When node is launched without the backend directory as cwd, `dotenv.config()` cannot find `.env` and `DATABASE_URL` is unset. Code and `.env` are both correct; this is a launch-environment concern.  
   **Fix:** Ensure the backend process is always started from the `backend/` directory (e.g. `cd backend && node src/index.js`), or use an absolute path in `.env`.

3. **`removeDevice` not used in useDevices hook** (Design note, not a defect)  
   `device:disconnected` event marks the device OFFLINE via `upsertDevice` rather than removing it from the store. This is valid UX (offline devices remain visible). No action required unless spec requires devices to disappear on disconnect.

---

## Recommendation

**Ready for Phase F deploy.**

Both issues are environmental/setup concerns that do not affect code correctness. All acceptance criteria pass. Backend endpoints respond correctly. Frontend builds cleanly. Pre-deploy checklist for Phase F:

- [ ] Run `npm install` in `/frontend` on the target host
- [ ] Ensure backend process is launched from the `backend/` directory (or set `DATABASE_URL` explicitly in the deployment environment)
- [ ] Confirm ADB daemon is running on the host before starting backend
