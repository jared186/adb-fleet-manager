# Sprint 1 Architecture Gate Document
**Project:** Android Device Fleet Manager  
**Sprint:** 1 — Foundation  
**Author:** Systems Architect  
**Date:** 2026-06-28  

---

## Architecture Decisions — Confirmed

### 1. Backend Stack

| Concern | Decision |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express |
| ORM | Prisma |
| Database | SQLite |
| Entry point | `backend/src/index.js` |
| Port | 3001 |

Rationale: Consistent with Nebula platform conventions. SQLite removes Docker dependency for greenfield development. Express is minimal and well-understood. Prisma provides schema-first migrations with type safety.

---

### 2. ADB Library

**Package:** `adbkit` (npm)

Rationale: Best-maintained Node-native ADB client. Supports device tracking, shell execution, and TCP forwarding — sufficient for Sprint 1 device detection and user profile enumeration, and extensible for Sprint 2 scrcpy/command execution.

---

### 3. Real-Time Transport

**Library:** Socket.IO

Rationale: Bi-directional, familiar across the Nebula stack. Handles reconnection and room management automatically. Client library bundles easily with the Vite/React frontend.

---

### 4. Frontend Stack

| Concern | Decision |
|---|---|
| Build tool | Vite |
| UI framework | React 18 |
| Styling | Tailwind CSS |
| Client state | Zustand |
| Dev port | 5173 |

Rationale: Fast HMR via Vite. React 18 concurrent rendering. Tailwind utility classes match rapid dashboard layout. Zustand is lightweight — no Redux boilerplate needed for this scope.

---

### 5. Database Schema

```prisma
model Device {
  id             String       @id @default(cuid())
  serialNumber   String       @unique
  model          String?
  manufacturer   String?
  androidVersion String?
  status         DeviceStatus @default(OFFLINE)
  batteryLevel   Int?
  lastSeen       DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  users          DeviceUser[]
}

model DeviceUser {
  id            String  @id @default(cuid())
  deviceId      String
  androidUserId Int
  name          String?
  isRunning     Boolean @default(false)
  device        Device  @relation(fields: [deviceId], references: [id])
  @@unique([deviceId, androidUserId])
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  UNAUTHORIZED
}
```

Key decisions:
- `serialNumber` is the natural device key; `id` (cuid) is the internal PK to avoid serial-format dependencies.
- `status` enum covers all ADB connection states: authorized online, physically present but USB debugging not approved, and absent.
- `batteryLevel` is nullable — unavailable until device is ONLINE.
- `DeviceUser` composite unique on `[deviceId, androidUserId]` prevents duplicate Android user entries on upsert.

---

### 6. REST API Contract

| Method | Path | Description |
|---|---|---|
| GET | `/api/devices` | List all known devices with current status |
| GET | `/api/devices/:serial` | Single device detail including users |
| GET | `/api/devices/:serial/users` | Android user profiles on the device |
| POST | `/api/devices/scan` | Trigger immediate ADB rescan |

Response conventions:
- All list endpoints return `{ data: [...] }`.
- All single-resource endpoints return `{ data: {...} }`.
- `POST /api/devices/scan` returns `{ ok: true, devicesFound: N }`.
- HTTP 404 when `:serial` not found in DB.

---

### 7. Socket.IO Event Design

| Event | Direction | Payload |
|---|---|---|
| `device:updated` | Server → Client | `{ device: Device }` — any field change |
| `device:connected` | Server → Client | `{ device: Device }` — newly detected device |
| `device:disconnected` | Server → Client | `{ serialNumber: string, status: "OFFLINE" }` |

Rationale: Three targeted events allow the frontend Zustand store to handle upsert (connected/updated) and mark-offline (disconnected) without polling. The client does not need to emit any events in Sprint 1 — all mutations are server-driven.

---

## Cross-Phase Boundaries

| File | Owner | Rule |
|---|---|---|
| `backend/prisma/schema.prisma` | Project Setup | Backend may ADD models only; never rewrite |
| `frontend/src/main.jsx` | Project Setup | Hands-off after scaffold |
| `.env` files | Project Setup | Other agents read; never overwrite |

---

## Risk Notes

- `adbkit` requires ADB platform tools on the host PATH. Document in README; no code guard needed for Sprint 1.
- SQLite file-level locking is acceptable for single-operator use; flag for migration to Postgres if multi-node is ever required.
- Socket.IO CORS must allow `http://localhost:5173` in development. Project Setup agent must configure this in `backend/src/index.js`.

---

STATUS: APPROVED
