---
from: orchestrator
to: DevOps Agent
timestamp: 2026-06-28T18:54:00.307Z
type: task-assignment
message-id: d76304d0-6c78-4189-8dd3-8d1c4e971ebe
---

# Task: Phase F: American Cloud Deploy + nginx

## Description
Deploy the Android Device Fleet Manager to American Cloud after Phase E QA passes.

Server details:
- VM ID: 897469de-d552-4db1-9bc2-1d15f94934c1 (American Cloud, us-central-0)
- VM IP: TBD (will be updated when VM is STARTED — poll via American Cloud API or check PM inbox)
- SSH: root@<IP> using nebula or claude SSH key
- Ubuntu 24.04 LTS, 2vCPU 4GB RAM
- Node.js 20, nginx, pm2, git, adb installed via cloud-init on first boot

Deployment steps:
1. SSH into server: root@<VM_IP>
2. Verify provisioning complete: cat /root/PROVISIONED.txt
3. cd /var/www/adb-fleet-manager
4. git clone https://github.com/jared186/adb-fleet-manager.git . (or git pull if already cloned)
5. cd backend && npm install && NODE_ENV=production npx prisma db push
6. cd ../frontend && npm install && VITE_API_URL= npm run build
7. pm2 start backend/src/index.js --name adb-fleet-backend --env production; pm2 save; pm2 startup
8. Configure nginx at /etc/nginx/sites-available/adb-fleet-manager:
   - port 80, root /var/www/adb-fleet-manager/frontend/dist
   - proxy /api/* and /socket.io/* to localhost:3001
   - try_files  / /index.html for SPA routing
9. ln -sf nginx config to sites-enabled, remove default, nginx -t && systemctl restart nginx
10. Verify: curl http://<IP>/api/health returns {status:ok}

Write outbox to pm-agent with final URL when done.

## Acceptance Criteria
- VM SSH accessible
- curl http://<IP>/api/health returns {status:ok}
- nginx serves frontend at port 80
- Socket.IO proxied correctly
- pm2 process persists on reboot (pm2 save + startup)
- Outbox to pm-agent with live URL

## Relevant Files
- C:/nebula/workspace/projects/instagram-account-autogen/backend/src/index.js
- C:/nebula/workspace/projects/instagram-account-autogen/frontend/src/pages/Dashboard.jsx

## Priority
HIGH

When complete, write a message to your outbox with what you did and files changed.
