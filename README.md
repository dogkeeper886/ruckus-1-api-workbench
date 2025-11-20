# RUCKUS 1 API Workbench

A web-based bulk operations tool for RUCKUS One network management. Perform large-scale API operations with configurable concurrency, timing control, and real-time progress tracking.

## Features

- **Bulk Venue Operations**: Create or delete hundreds of venues with naming patterns
- **Bulk WLAN Operations**: Create, activate, deactivate, or delete multiple WiFi networks
- **Bulk AP Operations**: Add, move, or remove multiple access points
- **Real-time Progress Tracking**: Monitor operation status, timing, and results
- **Concurrency Control**: Configure parallel operations (1-20 concurrent requests)
- **Delay Management**: Add delays between operations to control API rate
- **Pause/Resume/Cancel**: Control running operations on the fly
- **Pattern-based Naming**: Generate names with prefix, suffix, and step count

## Architecture

```
ruckus-1-api-workbench/
├── backend/           # Express.js REST API
│   ├── src/
│   │   ├── services/  # RUCKUS API service + bulk operation orchestration
│   │   ├── routes/    # API endpoints (venues, WLANs, APs, sessions)
│   │   ├── models/    # In-memory operation tracker
│   │   ├── utils/     # Semaphore, token cache, error handling
│   │   └── server.ts  # Express server
├── frontend/          # React + TypeScript UI
│   ├── src/
│   │   ├── components/  # Forms and progress display
│   │   └── services/    # API client
└── shared/            # Shared TypeScript types
```

## Prerequisites

- Node.js 18+ and npm
- RUCKUS One account with API credentials
  - Tenant ID
  - Client ID
  - Client Secret

## Quick Start

### 1. Clone and Setup

```bash
cd /home/jack/src/ruckus-1-api-workbench
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Configure `.env`:
```bash
RUCKUS_TENANT_ID=your-tenant-id
RUCKUS_CLIENT_ID=your-client-id
RUCKUS_CLIENT_SECRET=your-client-secret
RUCKUS_REGION=us              # Optional: us, eu, asia (leave blank for global)
PORT=3001
```

```bash
# Build TypeScript
npm run build

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Bulk Venue Operations

**Create Venues:**
1. Navigate to "Venues" tab
2. Select "Create Venues"
3. Configure naming pattern:
   - Prefix: `TestVenue-`
   - Suffix: `` (optional)
   - Count: `100`
   - Start Step: `1`
   - Result: `TestVenue-1`, `TestVenue-2`, ..., `TestVenue-100`
4. Enter venue details (address, city, country, timezone)
5. Set concurrency (1-20) and delay (0-10000ms)
6. Click "Create N Venues"
7. Monitor real-time progress

**Delete Venues:**
1. Select "Delete Venues"
2. Enter venue IDs (one per line)
3. Set concurrency and delay
4. Click "Delete Venues"

### Bulk WLAN Operations

**Create WLANs:**
1. Navigate to "WLANs" tab
2. Configure naming patterns:
   - Name Prefix: `TestWLAN-`
   - SSID Prefix: `TestSSID-`
   - Count: `100`
3. Select network type (PSK, Enterprise, Open, Guest)
4. Configure security and passphrase
5. Set concurrency and delay
6. Click "Create N WLANs"

### Bulk AP Operations

**Add APs:**
1. Navigate to "Access Points" tab
2. Configure patterns:
   - Name Prefix: `TestAP-`
   - Serial Prefix: `SN-`
   - Count: `100`
3. Enter target venue ID and AP group ID
4. Set concurrency and delay
5. Click "Add N APs"

## API Endpoints

### Venue Operations
- `POST /api/venues/bulk-create` - Create multiple venues
- `POST /api/venues/bulk-delete` - Delete multiple venues

### WLAN Operations
- `POST /api/wlans/bulk-create` - Create multiple WLANs
- `POST /api/wlans/bulk-activate` - Activate WLANs at venues
- `POST /api/wlans/bulk-deactivate` - Deactivate WLANs from venues
- `POST /api/wlans/bulk-delete` - Delete multiple WLANs

### AP Operations
- `POST /api/aps/bulk-add` - Add multiple APs
- `POST /api/aps/bulk-move` - Move multiple APs
- `POST /api/aps/bulk-remove` - Remove multiple APs

### Session Management
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:sessionId` - Get session details
- `GET /api/sessions/:sessionId/progress` - Get real-time progress
- `GET /api/sessions/:sessionId/operations` - Get all operations
- `POST /api/sessions/:sessionId/pause` - Pause session
- `POST /api/sessions/:sessionId/resume` - Resume session
- `POST /api/sessions/:sessionId/cancel` - Cancel session
- `DELETE /api/sessions/:sessionId` - Delete session

## Configuration

### Concurrency Control

- **Max Concurrent (1-20)**: Number of parallel API operations
  - Lower values: Safer, slower, less API load
  - Higher values: Faster, more API load, potential rate limiting

### Delay Between Operations

- **Delay (0-10000ms)**: Time to wait between starting operations
  - `0ms`: No delay, maximum speed
  - `500ms`: Recommended for most operations
  - `1000ms+`: Conservative, for rate-limited scenarios

## Progress Tracking

The progress display shows:

- **Progress Bar**: Visual representation of completion (0-100%)
- **Statistics**:
  - Success: Successfully completed operations
  - Failed: Operations that encountered errors
  - Running: Currently executing operations
  - Queued: Operations waiting to start
- **Operations Table**: Detailed view of each operation
  - Item name
  - Status (queued, running, success, failed, cancelled)
  - Duration (in seconds)
  - Error message (if failed)

## Controls

- **Pause**: Pause execution (currently running operations will complete)
- **Resume**: Resume paused execution
- **Cancel**: Cancel session (queues cancelled, running operations complete)

## Troubleshooting

### Backend Issues

**Connection refused:**
```bash
# Check if backend is running
cd backend
npm run dev
```

**Authentication errors:**
- Verify credentials in `backend/.env`
- Check RUCKUS_TENANT_ID, RUCKUS_CLIENT_ID, RUCKUS_CLIENT_SECRET
- Ensure credentials have necessary API permissions

**CORS errors:**
- Backend includes CORS middleware for localhost:3000
- If using different ports, update `backend/src/server.ts`

### Frontend Issues

**API calls fail:**
- Verify backend is running on port 3001
- Check proxy configuration in `frontend/vite.config.ts`
- Open browser console for detailed errors

**Build errors:**
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Development

### Backend Development

```bash
cd backend

# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run built version
npm start
```

### Frontend Development

```bash
cd frontend

# Development mode with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Reuse from ruckus1-mcp

This project reuses core functionality from the `ruckus1-mcp` project:

- **ruckusApiService.ts**: Complete RUCKUS One API client
  - OAuth2 authentication with token caching
  - All venue, WLAN, AP operations
  - Async operation polling with retry logic
  - Multi-region support

- **tokenCache.ts**: JWT token management with expiry
- **errorHandler.ts**: Structured error handling

New components created for bulk operations:

- **semaphore.ts**: Concurrency control
- **operationTracker.ts**: In-memory session/operation tracking
- **bulkOperationService.ts**: Bulk operation orchestration

## Architecture Patterns

### Concurrency with Semaphore

```typescript
const semaphore = new Semaphore(maxConcurrent);
await semaphore.acquire();
try {
  // Execute operation
} finally {
  semaphore.release();
}
```

### Operation Tracking

```typescript
const sessionId = tracker.createSession('venue', 'create', 100);
const opId = tracker.addOperation(sessionId, 'venue', 'create', 'Venue-1');
tracker.updateOperation(sessionId, opId, { status: 'running' });
tracker.updateOperation(sessionId, opId, { status: 'success' });
```

### Async Polling

All RUCKUS API async operations use standard polling:
- Max retries: 5
- Poll interval: 2000ms
- Activity tracking via requestId

## Performance Considerations

- **In-memory storage**: Sessions cleared on server restart
- **Recommended limits**:
  - Concurrency: 5-10 for most operations
  - Delay: 500ms for sustained operations
  - Batch size: 100-500 operations per session

## Security

- **Environment variables**: Never commit `.env` file
- **API credentials**: Stored server-side only
- **CORS**: Configured for localhost development
- **Production deployment**: Add authentication, HTTPS, rate limiting

## License

MIT

## Support

For issues or questions:
- Check troubleshooting section
- Review backend logs for API errors
- Check browser console for frontend errors
- Ensure RUCKUS One API credentials are valid

## Roadmap

Future enhancements:
- [ ] Export results to CSV/JSON
- [ ] Save operation templates
- [ ] Batch operation scheduling
- [ ] Database persistence (PostgreSQL)
- [ ] WebSocket real-time updates
- [ ] Multi-tenant support
- [ ] API rate limit detection
- [ ] Dry-run mode
- [ ] Operation rollback
