---
from: orchestrator
to: Backend Developer
timestamp: 2026-06-28T18:52:00.150Z
type: task-assignment
message-id: ec3cdf93-58e8-4b4f-aee8-8b0727643b68
---

# Task: Phase C: ADB Device Detection + REST API

## Description
Implement ADB device tracking and REST API in C:/nebula/workspace/projects/instagram-account-autogen/backend/.

GATE: Requires Phase B scaffold complete. Read C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md before starting.

Create these files:
- backend/src/adb/tracker.js — adbkit tracker. On device connect: upsert Device record (status ONLINE), call deviceInfo + users. On disconnect: update status OFFLINE. Emit socket events.
- backend/src/adb/deviceInfo.js — fetch device props (model, manufacturer, androidVersion) via adb shell getprop, battery via adb shell dumpsys battery. Return parsed object.
- backend/src/adb/users.js — fetch Android users via adb shell pm list users. Parse output into [{androidUserId, name}]. Upsert DeviceUser records.
- backend/src/routes/devices.js — Express router:
  GET /api/devices — return all Device records with user count
  GET /api/devices/:serial — return single device with users, 404 if not found
  GET /api/devices/:serial/users — return DeviceUser array
  POST /api/devices/scan — trigger tracker.refresh(), return {status:'scanning'}
- backend/src/socket.js — Socket.IO instance export, emits device:connected, device:disconnected, device:updated
- Mount router in backend/src/index.js at /api/devices

DO NOT TOUCH: backend/prisma/schema.prisma

Write outbox to pm-agent when done.

## Acceptance Criteria
- GET /api/devices returns 200 with array (empty ok)
- GET /api/devices/unknown returns 404
- POST /api/devices/scan returns {status:scanning}
- Socket.IO server starts without error
- adbkit tracker initializes without crashing
- backend/src/adb/ directory has tracker.js, deviceInfo.js, users.js
- Outbox to pm-agent written

## Relevant Files
- C:/nebula/workspace/projects/instagram-account-autogen/backend/src/index.js
- C:/nebula/workspace/projects/instagram-account-autogen/backend/prisma/schema.prisma
- C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md

## Priority
HIGH

When complete, write a message to your outbox with what you did and files changed.
