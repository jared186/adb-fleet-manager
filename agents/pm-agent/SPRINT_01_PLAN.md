# Sprint 1 Plan — Android Device Fleet Manager: Foundation

**Project:** Instagram Account Autogen (repurposed → Android Device Fleet Manager)
**Sprint Goal:** Greenfield scaffolding + core ADB device detection + fleet dashboard UI
**Approved scope (Option A):** Standalone Android device fleet management tool — no account creation, no fingerprint spoofing, no detection evasion

---

## What We're Building

A web dashboard for managing a fleet of Android phones connected via USB/ADB. Operators see all connected devices in real time, their status (online/offline, battery, model, Android version), and can manage Android user profiles per device.

---

## Sprint 1 Scope

**In scope:**
- Backend: Node.js + Express + Prisma + SQLite
- ADB device detection via `adbkit` npm package
- REST API: device list, device detail, device users
- Socket.IO real-time device status push
- Frontend: React + Vite + Tailwind — device fleet dashboard
- Device cards: name, status indicator, battery %, model, Android version
- Real-time updates (Socket.IO client)

**Out of scope for Sprint 1:**
- scrcpy screen viewing (Sprint 2)
- Device controls / ADB command execution (Sprint 2)
- Authentication / multi-user (Sprint 3)
- PC agent/daemon for remote phone management (Sprint 2)

---

## Tech Stack Decisions

| Layer | Choice | Reason |
|---|---|---|
| Backend runtime | Node.js 20 + Express | Consistent with Nebula platform, adbkit is Node-native |
| ORM | Prisma + SQLite | Simple greenfield, no Docker dependency |
| ADB library | adbkit | Best maintained Node.js ADB client |
| Real-time | Socket.IO | Familiar, bi-directional |
| Frontend | React + Vite + Tailwind | Fast dev, consistent with other projects |
| State | Zustand | Lightweight client state |

---

## DB Schema (Sprint 1)

```prisma
model Device {
  id            String    @id @default(cuid())
  serialNumber  String    @unique
  model         String?
  manufacturer  String?
  androidVersion String?
  status        DeviceStatus @default(OFFLINE)
  batteryLevel  Int?
  lastSeen      DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  users         DeviceUser[]
}

model DeviceUser {
  id          String   @id @default(cuid())
  deviceId    String
  androidUserId Int
  name        String?
  isRunning   Boolean  @default(false)
  device      Device   @relation(fields: [deviceId], references: [id])
  @@unique([deviceId, androidUserId])
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  UNAUTHORIZED
}
```

---

## API Contract

| Method | Path | Description |
|---|---|---|
| GET | /api/devices | List all known devices with status |
| GET | /api/devices/:serial | Single device detail |
| GET | /api/devices/:serial/users | Android users on device |
| POST | /api/devices/scan | Trigger ADB rescan |

**Socket.IO events:**
- `device:updated` — emitted when device status changes
- `device:connected` — new device detected
- `device:disconnected` — device went offline

---

## Phase Sequence

### Phase A — Systems Architect (Gate)
**Task:** Produce gate document confirming: tech stack, DB schema, API contract, Socket.IO event design, adbkit integration pattern.
**Gate must be APPROVED before Phase B starts.**

### Phase B — Project Setup Agent
**Task:** Scaffold repo
- `backend/` — Node.js + Express + Prisma with schema above, basic health endpoint, Socket.IO setup
- `frontend/` — Vite + React + Tailwind, basic routing shell
- Root `package.json` with `dev` script that starts both
- `.gitignore`, `README.md` stub

**Output:** Running `npm run dev` starts both servers with no errors.

### Phase C — Backend Developer
**Task:** Implement ADB device detection and REST API
- `adbkit` tracker that polls device list every 5s
- Upsert devices to DB on connect/disconnect
- Fetch battery level + device props (model, manufacturer, androidVersion) on connect
- Fetch Android user list (`pm list users`) on connect
- REST endpoints per API contract above
- Emit Socket.IO events on device status change

**Files:**
- `backend/src/adb/tracker.js` — adbkit device tracker
- `backend/src/adb/deviceInfo.js` — battery + props fetcher
- `backend/src/routes/devices.js` — REST routes
- `backend/src/socket.js` — Socket.IO setup + event emit

### Phase D — Frontend Developer
**Task:** Device fleet dashboard
- `/` route — grid of device cards
- Device card: serial (truncated), model/manufacturer, status badge (green/red/yellow), battery bar, Android version, user count
- Socket.IO client — live update cards without page refresh
- Empty state when no devices connected
- "Scan" button that calls POST /api/devices/scan

**Files:**
- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/components/DeviceCard.jsx`
- `frontend/src/hooks/useDevices.js` (Socket.IO + REST init)
- `frontend/src/store/deviceStore.js` (Zustand)

### Phase E — QA Engineer
**Task:** Verify Sprint 1 deliverables
- Backend starts without errors
- ADB tracker initializes (even if no devices connected)
- All REST endpoints return correct shape (mock or real devices)
- Frontend dashboard renders, connects to Socket.IO
- Empty state renders correctly
- Device card renders correctly with mocked data

---

## Agents to Spawn

| Agent | Template | Phase |
|---|---|---|
| Systems Architect | systems-architect | A |
| Project Setup Agent | project-setup | B |
| Backend Developer | backend-developer | C |
| Frontend Developer | frontend-developer | D |
| QA Engineer | qa-engineer | E |

---

## DO NOT TOUCH (cross-phase)

- `backend/prisma/schema.prisma` — only Project Setup creates it; Backend may ADD models only
- `frontend/src/main.jsx` — only Project Setup creates it
- `.env` files — only Project Setup creates them

---

---

## GitHub + Deployment (added 2026-06-28)

**GitHub repo:** `jared186/adb-fleet-manager`
- Clone URL: `https://github.com/jared186/adb-fleet-manager.git`
- All agents commit+push at end of their phase

**American Cloud VM:**
- VM ID: `897469de-d552-4db1-9bc2-1d15f94934c1`
- Public IP: `50.117.53.141`
- Region: us-central-0 | Ubuntu 24.04 LTS | 2vCPU 4GB 40GB
- SSH: `ssh root@50.117.53.141` (nebula or claude key)
- cloud-init installs: Node.js 20, nginx, pm2, git, adb
- Monthly cost: $42.50/mo

**Phase F — DevOps (after Phase E QA):**
- Agent: DevOps Agent (`d9de5839`)
- Task: SSH deploy, pm2 start backend, nginx reverse proxy frontend
- Live URL target: `http://50.117.53.141`

---

*Written: 2026-06-28 | PM Agent*
