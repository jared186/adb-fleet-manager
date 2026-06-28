---
from: orchestrator
to: Frontend Developer
timestamp: 2026-06-28T18:52:00.157Z
type: task-assignment
message-id: aeab6757-0ea0-46b1-b32d-cd1fdfb1e4b6
---

# Task: Phase D: Fleet Dashboard UI

## Description
Implement the device fleet dashboard in C:/nebula/workspace/projects/instagram-account-autogen/frontend/src/.

GATE: Requires Phase C backend running. Read C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md before starting.

Create:
- frontend/src/store/deviceStore.js — Zustand store: { devices: [], setDevices, upsertDevice, removeDevice }
- frontend/src/hooks/useDevices.js — on mount: fetch GET /api/devices, init Socket.IO client, listen for device:connected/updated/disconnected events, update store
- frontend/src/components/DeviceCard.jsx — displays: serial (first 12 chars), model + manufacturer, status badge (green=ONLINE, red=OFFLINE, yellow=UNAUTHORIZED), battery progress bar (0-100), androidVersion, user count
- frontend/src/pages/Dashboard.jsx — grid of DeviceCards (3 columns), empty state message when no devices, Scan button (POST /api/devices/scan, disabled during scan)
- Wire Dashboard into frontend/src/App.jsx at / route
- Add VITE_API_URL env var support (default http://localhost:3001)

DO NOT TOUCH: frontend/src/main.jsx

Write outbox to pm-agent when done.

## Acceptance Criteria
- Dashboard renders at / without console errors
- DeviceCard renders correctly with mock device data
- Empty state shown when devices array is empty
- Scan button calls POST /api/devices/scan
- Socket.IO client connects without error
- Status badges show correct colors
- Outbox to pm-agent written

## Relevant Files
- C:/nebula/workspace/projects/instagram-account-autogen/frontend/src/main.jsx
- C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md

## Priority
MEDIUM

When complete, write a message to your outbox with what you did and files changed.
