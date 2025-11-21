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

### Option A: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh
```

This will:
- Install backend dependencies
- Install frontend dependencies
- Create `.env` template
- Build backend TypeScript

Then configure your credentials:

```bash
# Edit backend/.env
nano backend/.env
```

Add your RUCKUS One credentials:
```bash
RUCKUS_TENANT_ID=your-tenant-id-here
RUCKUS_CLIENT_ID=your-client-id-here
RUCKUS_CLIENT_SECRET=your-secret-here
RUCKUS_REGION=us              # Optional: us, eu, asia (leave blank for global)
PORT=3003
```

Save and exit (Ctrl+X, Y, Enter)

**Start Services with Makefile:**

```bash
# Clean up any old processes and start backend
make backend
```

In another terminal:
```bash
# Start frontend
make frontend
```

**Makefile Commands:**
- `make help` - Show all available commands
- `make clean` - Kill old processes on ports 3003/3002
- `make status` - Show running services
- `make backend` - Clean + start backend
- `make frontend` - Start frontend  
- `make dev` - Start both (parallel)
- `make stop` - Stop all services

### Option B: Manual Setup

#### 1. Backend Setup

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
PORT=3003
```

```bash
# Build TypeScript
npm run build

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3003`

#### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3002`

### Access the Application

Open your browser and navigate to:
```
http://localhost:3002
```

## Your First Bulk Operation

### Create 10 Test Venues

1. Click "Venues" tab (default view)
2. Ensure "Create Venues" is selected
3. Fill in the form:
   - **Prefix**: `TestVenue-`
   - **Suffix**: `` (leave empty)
   - **Count**: `10`
   - **Start Step**: `1`
   - **Address**: `123 Test Street`
   - **City**: `TestCity`
   - **Country**: `US`
   - **Timezone**: `America/New_York`
   - **Max Concurrent**: `5`
   - **Delay Between Ops**: `500`

4. Click "Create 10 Venues"

5. Watch the progress:
   - Progress bar shows completion percentage
   - Stats show success/failed/running counts
   - Operations table shows each venue's status

6. Wait for completion (all operations show green "success" badges)

### Verify in RUCKUS One

Log into your RUCKUS One dashboard and verify the venues were created:
- TestVenue-1
- TestVenue-2
- ...
- TestVenue-10

### Clean Up Test Venues

1. In RUCKUS One, copy the venue IDs
2. Return to the workbench
3. Select "Delete Venues"
4. Paste venue IDs (one per line)
5. Set concurrency: `5`
6. Set delay: `500`
7. Click "Delete Venues"

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

## Common Operations

### Create 100 Venues
```
Prefix: Venue-
Count: 100
Concurrency: 10
Delay: 500ms
```

### Create 50 WLANs
```
Navigate to "WLANs" tab
Name Prefix: TestWLAN-
SSID Prefix: TestSSID-
Count: 50
Type: PSK
Passphrase: TestPassword123
Concurrency: 5
Delay: 1000ms
```

### Add 20 APs
```
Navigate to "Access Points" tab
Name Prefix: AP-
Serial Prefix: SN-
Count: 20
Venue ID: <from RUCKUS One>
AP Group ID: <from RUCKUS One>
Concurrency: 5
Delay: 500ms
```

## Tips

- **Start small**: Test with 5-10 operations first
- **Increase gradually**: Once confident, scale to 50, 100, 500+
- **Monitor progress**: Watch for failures and adjust concurrency/delay
- **Use pause/resume**: Pause operations if you see errors
- **Cancel when needed**: Cancel operations that are failing repeatedly
- **Concurrency**: Higher = faster, but may hit rate limits
- **Delay**: Higher = safer, but slower

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

### Old Processes Still Running

```bash
# Use Makefile to clean up
make clean

# Or manually check and kill
make status
```

### Backend Won't Start

```bash
# Check Node.js version (should be 18+)
node -v

# Clean up old processes first
make clean

# Reinstall dependencies if needed
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

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
- Backend includes CORS middleware for localhost:3002
- If using different ports, update `backend/src/server.ts`

### Frontend Won't Start

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API calls fail:**
- Verify backend is running on port 3003
- Check proxy configuration in `frontend/vite.config.ts`
- Open browser console for detailed errors

**Build errors:**
- Ensure Node.js 18+ is installed
- Clear node_modules and reinstall (see above)

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
1. Check troubleshooting section above
2. Review backend logs for API errors
3. Check browser console for frontend errors
4. Verify RUCKUS One credentials are valid
5. Ensure you have API permissions in RUCKUS One
6. Explore the API health endpoint at http://localhost:3003/health
