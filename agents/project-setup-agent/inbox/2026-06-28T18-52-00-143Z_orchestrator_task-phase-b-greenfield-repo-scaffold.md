---
from: orchestrator
to: Project Setup Agent
timestamp: 2026-06-28T18:52:00.143Z
type: task-assignment
message-id: c6b88a15-eb11-4be6-b66a-d250ff999f8e
---

# Task: Phase B: Greenfield Repo Scaffold

## Description
Scaffold the Android Device Fleet Manager repo at C:/nebula/workspace/projects/instagram-account-autogen/.

GATE REQUIREMENT: Read C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md first. Do not start work if gate is not APPROVED.

Create:
- backend/ directory with Node.js + Express + Prisma (SQLite) + Socket.IO
- backend/src/index.js — Express app on port 3001, health: GET /api/health returns {status:'ok'}
- backend/prisma/schema.prisma — Device and DeviceUser models per gate doc
- backend/.env — DATABASE_URL=file:./dev.db
- backend/package.json with deps: express, prisma, @prisma/client, socket.io, adbkit, cors, dotenv
- frontend/ directory with Vite + React 18 + Tailwind CSS + Zustand
- frontend/src/main.jsx, frontend/src/App.jsx with / route shell
- frontend/package.json with deps: react, react-dom, vite, tailwindcss, zustand, socket.io-client
- Root package.json with dev script running both concurrently
- .gitignore covering node_modules, .env, *.db, dist/

Run: cd backend && npm install && npx prisma db push
Run: cd frontend && npm install
Verify both start without errors.
Write outbox to pm-agent when scaffold complete.

## Acceptance Criteria
- backend/ and frontend/ directories exist
- backend/src/index.js starts without errors on port 3001
- GET /api/health returns 200
- backend/prisma/schema.prisma has Device and DeviceUser models
- frontend/ Vite app starts without errors on port 5173
- Prisma db push succeeds
- Outbox to pm-agent written

## Relevant Files
- C:/nebula/workspace/projects/instagram-account-autogen/SPRINT_01_GATE.md

## Priority
HIGH

When complete, write a message to your outbox with what you did and files changed.
