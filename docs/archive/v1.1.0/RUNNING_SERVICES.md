# Running Services Summary

## Current Status ✅

Both services are running successfully:

### Backend
- **Port**: 3003
- **URL**: http://localhost:3003
- **Health Check**: http://localhost:3003/health
- **Status**: ✅ Running
- **Credentials**: Configured from `.env` file

### Frontend
- **Port**: 3002
- **URL**: http://localhost:3002
- **Status**: ✅ Running
- **Proxy**: Configured to proxy `/api` requests to backend at `http://localhost:3003`

## Changes Made

### 1. Backend Configuration
- Updated `backend/src/server.ts` default port from 3001 → 3003
- Running using compiled JavaScript from `dist/` folder

### 2. Frontend Configuration
- Updated `frontend/vite.config.ts`:
  - Server port: 3000 → 3002
  - Proxy target: 3001 → 3003

### 3. Documentation
- Updated `QUICK_START.md` to reflect new ports

## How to Access

1. **Open Frontend**: http://localhost:3002
2. **Check Backend Health**: http://localhost:3003/health

## Process Management

### View Running Processes
```bash
ps aux | grep -E "(node.*3003|node.*vite)" | grep -v grep
```

### Check Ports
```bash
ss -tlnp | grep -E ":(3002|3003)"
```

### Stop Services
```bash
# Stop backend
pkill -f "node dist/server.js"

# Stop frontend
pkill -f "vite"
```

### Restart Services

**Backend:**
```bash
cd /home/jack/Documents/ruckus-1-api-workbench/backend
PORT=3003 node dist/server.js > /tmp/backend.log 2>&1 &
```

**Frontend:**
```bash
cd /home/jack/Documents/ruckus-1-api-workbench/frontend
npm run dev > /tmp/frontend.log 2>&1 &
```

### View Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log
```

## Environment Variables

The backend requires these environment variables in `backend/.env`:

```env
RUCKUS_TENANT_ID=your-tenant-id
RUCKUS_CLIENT_ID=your-client-id
RUCKUS_CLIENT_SECRET=your-secret
RUCKUS_REGION=us
PORT=3003
```

Note: The `.env` file is already configured with your credentials.

## API Endpoints

All available at http://localhost:3003:

### Venues
- `POST /api/venues/bulk-create`
- `POST /api/venues/bulk-delete`

### WLANs
- `POST /api/wlans/bulk-create`
- `POST /api/wlans/bulk-activate`
- `POST /api/wlans/bulk-deactivate`
- `POST /api/wlans/bulk-delete`

### Access Points
- `POST /api/aps/bulk-add`
- `POST /api/aps/bulk-move`
- `POST /api/aps/bulk-remove`

### Session Management
- `GET /api/sessions`
- `GET /api/sessions/:sessionId`
- `GET /api/sessions/:sessionId/progress`
- `GET /api/sessions/:sessionId/operations`
- `POST /api/sessions/:sessionId/pause`
- `POST /api/sessions/:sessionId/resume`
- `POST /api/sessions/:sessionId/cancel`
- `DELETE /api/sessions/:sessionId`

## Next Steps

1. Open your browser to http://localhost:3002
2. Start creating bulk operations!
3. Monitor progress in real-time
4. Check backend logs if you encounter issues

## Troubleshooting

### Frontend can't connect to backend
- Verify backend is running: `curl http://localhost:3003/health`
- Check proxy configuration in `frontend/vite.config.ts`
- Look for CORS errors in browser console (F12)

### Backend won't start
- Check credentials in `backend/.env`
- View logs: `tail -f /tmp/backend.log`
- Ensure port 3003 is not in use: `ss -tlnp | grep 3003`

### Port already in use
```bash
# Find process using the port
lsof -ti:3003
# Kill it
kill -9 $(lsof -ti:3003)
```

---

**Last Updated**: 2025-11-21 13:05 UTC
**Services Started**: Successfully ✅

