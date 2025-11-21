# RUCKUS 1 API Workbench - Implementation Plan

## Project Overview

**Goal**: Create a web-based bulk operations tool for RUCKUS One API that enables large-scale operations (create/delete 100+ venues, WLANs, APs) with configurable concurrency, timing control, and real-time progress tracking.

**Key Requirements**:
- Web UI for user interaction
- Support for bulk venue, WLAN, and AP operations
- Configurable concurrency and delays between API calls
- Real-time status tracking and timing
- Pattern-based naming (prefix, postfix, step count)
- Pause/resume/cancel functionality

## Technology Stack

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **API Client**: Reuse ruckus1-mcp services (ruckusApiService.ts)
- **Storage**: In-memory (for session tracking)
- **Authentication**: Reuse token caching from ruckus1-mcp

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Axios

### Shared
- **Type Definitions**: Shared TypeScript types for backend/frontend

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │  Venue     │  │   WLAN     │  │     AP     │                │
│  │   Form     │  │   Form     │  │   Form     │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │                │                │                       │
│        └────────────────┴────────────────┘                       │
│                         │                                        │
│                  ┌──────▼───────┐                                │
│                  │ API Service  │                                │
│                  └──────┬───────┘                                │
│                         │                                        │
│                  ┌──────▼───────┐                                │
│                  │   Progress   │                                │
│                  │   Monitor    │                                │
│                  └──────────────┘                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                      Backend (Express)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                            │  │
│  │  /api/venues/*  /api/wlans/*  /api/aps/*  /api/sessions │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │            Bulk Operation Service                        │  │
│  │  • Pattern-based name generation                         │  │
│  │  • Semaphore for concurrency control                     │  │
│  │  • Progress tracking integration                         │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │          RUCKUS API Service (from ruckus1-mcp)           │  │
│  │  • OAuth2 authentication                                 │  │
│  │  • Token caching                                         │  │
│  │  • Async operation polling                               │  │
│  │  • Multi-region support                                  │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────▼──────────────────────────────────┐  │
│  │           Operation Tracker (In-Memory)                  │  │
│  │  • Session management                                    │  │
│  │  • Operation status tracking                             │  │
│  │  • Progress calculation                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   RUCKUS One API                                │
│  • Venue operations                                             │
│  • WLAN operations                                              │
│  • AP operations                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Backend Foundation

**1.1 Project Structure**
- [ ] Create project directory structure
- [ ] Initialize backend package.json
- [ ] Configure TypeScript (tsconfig.json)
- [ ] Create .env.example template

**1.2 Core Services (Reuse from ruckus1-mcp)**
- [ ] Copy ruckusApiService.ts (~4,400 lines)
- [ ] Copy tokenCache.ts
- [ ] Copy errorHandler.ts
- [ ] Verify all dependencies are available

**1.3 New Utilities**
- [ ] Create semaphore.ts for concurrency control
  - `acquire()` - Get permit
  - `release()` - Release permit
  - `execute()` - Execute with automatic acquire/release
- [ ] Create operationTracker.ts for in-memory tracking
  - `createSession()` - Start new bulk operation session
  - `addOperation()` - Add operation to session
  - `updateOperation()` - Update operation status
  - `getProgress()` - Calculate progress percentage
  - `pauseSession()` - Pause session execution
  - `resumeSession()` - Resume paused session
  - `cancelSession()` - Cancel session

**1.4 Bulk Operation Service**
- [ ] Create bulkOperationService.ts
- [ ] Implement helper: `generateNames(prefix, suffix, count, startStep)`
- [ ] Implement: `bulkCreateVenues()`
  - Generate venue names from pattern
  - Create semaphore with maxConcurrent
  - Loop through venues
  - Acquire semaphore permit
  - Execute createVenueWithRetry()
  - Update operation tracker
  - Release semaphore
  - Apply delay between operations
- [ ] Implement: `bulkDeleteVenues()`
- [ ] Implement: `bulkCreateWlans()`
- [ ] Implement: `bulkActivateWlans()`
- [ ] Implement: `bulkDeactivateWlans()`
- [ ] Implement: `bulkDeleteWlans()`
- [ ] Implement: `bulkAddAps()`
- [ ] Implement: `bulkMoveAps()`
- [ ] Implement: `bulkRemoveAps()`

**1.5 API Routes**
- [ ] Create routes/bulkVenues.ts
  - `POST /bulk-create` - Create multiple venues
  - `POST /bulk-delete` - Delete multiple venues
- [ ] Create routes/bulkWlans.ts
  - `POST /bulk-create` - Create multiple WLANs
  - `POST /bulk-activate` - Activate WLANs at venues
  - `POST /bulk-deactivate` - Deactivate WLANs
  - `POST /bulk-delete` - Delete WLANs
- [ ] Create routes/bulkAps.ts
  - `POST /bulk-add` - Add multiple APs
  - `POST /bulk-move` - Move multiple APs
  - `POST /bulk-remove` - Remove multiple APs
- [ ] Create routes/sessions.ts
  - `GET /` - Get all sessions
  - `GET /:sessionId` - Get session details
  - `GET /:sessionId/progress` - Get progress
  - `GET /:sessionId/operations` - Get operations list
  - `POST /:sessionId/pause` - Pause session
  - `POST /:sessionId/resume` - Resume session
  - `POST /:sessionId/cancel` - Cancel session
  - `DELETE /:sessionId` - Delete session

**1.6 Express Server**
- [ ] Create server.ts
- [ ] Configure Express app
- [ ] Add CORS middleware
- [ ] Add JSON body parser
- [ ] Add request logging
- [ ] Register all routes
- [ ] Add error handler middleware
- [ ] Add health check endpoint

### Phase 2: Shared Types

**2.1 Type Definitions**
- [ ] Create shared/types.ts
- [ ] Define: `OperationType` = 'venue' | 'wlan' | 'ap'
- [ ] Define: `OperationStatus` = 'queued' | 'running' | 'success' | 'failed' | 'cancelled'
- [ ] Define: `Operation` interface
  - id, type, action, status, itemName
  - startTime, endTime, duration
  - result, error, activityId
- [ ] Define: `BulkOperationRequest` interface
- [ ] Define: `BulkOperationOptions` interface
  - maxConcurrent, delayMs, dryRun
- [ ] Define: `BulkOperationSession` interface
- [ ] Define: `BulkOperationProgress` interface
- [ ] Define request interfaces:
  - `BulkVenueCreateRequest`
  - `BulkVenueDeleteRequest`
  - `BulkWlanCreateRequest`
  - `BulkWlanActivateRequest`
  - `BulkWlanDeactivateRequest`
  - `BulkWlanDeleteRequest`
  - `BulkApAddRequest`
  - `BulkApMoveRequest`
  - `BulkApRemoveRequest`
- [ ] Define response interfaces:
  - `ApiResponse<T>`
  - `SessionResponse`
  - `ProgressResponse`
  - `OperationsResponse`

### Phase 3: Frontend Foundation

**3.1 Project Setup**
- [ ] Initialize frontend with Vite + React + TypeScript
- [ ] Configure TailwindCSS
- [ ] Configure PostCSS
- [ ] Create vite.config.ts with proxy to backend
- [ ] Create index.html
- [ ] Create src/index.css with Tailwind imports

**3.2 API Service Layer**
- [ ] Create src/services/api.ts
- [ ] Create ApiService class with Axios
- [ ] Implement venue methods:
  - `bulkCreateVenues()`
  - `bulkDeleteVenues()`
- [ ] Implement WLAN methods:
  - `bulkCreateWlans()`
  - `bulkActivateWlans()`
  - `bulkDeactivateWlans()`
  - `bulkDeleteWlans()`
- [ ] Implement AP methods:
  - `bulkAddAps()`
  - `bulkMoveAps()`
  - `bulkRemoveAps()`
- [ ] Implement session methods:
  - `getAllSessions()`
  - `getSession()`
  - `getSessionProgress()`
  - `getSessionOperations()`
  - `pauseSession()`
  - `resumeSession()`
  - `cancelSession()`
  - `deleteSession()`

### Phase 4: Frontend Components

**4.1 Progress Monitoring Component**
- [ ] Create components/OperationProgress.tsx
- [ ] Accept props: `sessionId`, `onComplete`
- [ ] State: progress, session, operations, isPolling
- [ ] useEffect: Poll every 1 second for progress updates
- [ ] Render progress bar with percentage
- [ ] Render statistics: success, failed, running, queued
- [ ] Render operations table with status badges
- [ ] Render pause/resume/cancel buttons
- [ ] Handle pause/resume/cancel clicks
- [ ] Stop polling when session completes

**4.2 Venue Form Component**
- [ ] Create components/BulkVenueForm.tsx
- [ ] State: form fields, sessionId, error, isSubmitting
- [ ] Action selector: Create vs Delete radio buttons
- [ ] Create mode:
  - Naming pattern fields (prefix, suffix, count, startStep)
  - Preview of generated names
  - Venue details (address, city, country, timezone)
  - Options (maxConcurrent, delayMs)
  - Submit button
- [ ] Delete mode:
  - Textarea for venue IDs (one per line)
  - Options (maxConcurrent, delayMs)
  - Submit button
- [ ] Form submission:
  - Call apiService method
  - Set sessionId on success
  - Show OperationProgress when sessionId set
- [ ] Back button to return to form

**4.3 WLAN Form Component**
- [ ] Create components/BulkWlanForm.tsx
- [ ] State: form fields, sessionId, error, isSubmitting
- [ ] Naming pattern section:
  - Name prefix/suffix
  - SSID prefix/suffix
  - Count, start step
  - Preview
- [ ] WLAN configuration:
  - Type selector (PSK, Enterprise, Open, Guest)
  - Security selector
  - Passphrase field (conditional on type)
  - VLAN ID
- [ ] Options section (maxConcurrent, delayMs)
- [ ] Submit button
- [ ] Form submission and progress display

**4.4 AP Form Component**
- [ ] Create components/BulkApForm.tsx
- [ ] State: form fields, sessionId, error, isSubmitting
- [ ] Naming pattern section:
  - Name prefix/suffix
  - Serial number prefix/suffix
  - Count, start step
  - Preview
- [ ] Target location:
  - Venue ID input
  - AP Group ID input
  - Description (optional)
- [ ] Options section (maxConcurrent, delayMs)
- [ ] Submit button
- [ ] Form submission and progress display

**4.5 Main App Component**
- [ ] Create App.tsx
- [ ] Setup React Router
- [ ] Create header with title and description
- [ ] Create navigation tabs:
  - Venues
  - WLANs
  - Access Points
- [ ] Setup routes:
  - `/` → BulkVenueForm
  - `/wlans` → BulkWlanForm
  - `/aps` → BulkApForm
- [ ] Create footer

**4.6 Entry Point**
- [ ] Create main.tsx
- [ ] Import React, ReactDOM
- [ ] Import App component
- [ ] Import index.css
- [ ] Render App to #root

### Phase 5: Integration & Testing

**5.1 Backend Testing**
- [ ] Test health endpoint
- [ ] Test authentication with RUCKUS One
- [ ] Test venue creation (single)
- [ ] Test bulk venue creation (10 venues)
- [ ] Test progress tracking
- [ ] Test pause/resume/cancel
- [ ] Test WLAN operations
- [ ] Test AP operations

**5.2 Frontend Testing**
- [ ] Test form validation
- [ ] Test API connectivity
- [ ] Test progress updates
- [ ] Test pause/resume/cancel buttons
- [ ] Test navigation between tabs
- [ ] Test error handling
- [ ] Test with various concurrency/delay settings

**5.3 End-to-End Testing**
- [ ] Create 100 test venues
- [ ] Monitor progress tracking
- [ ] Verify all venues created in RUCKUS One
- [ ] Delete 100 test venues
- [ ] Create 50 test WLANs
- [ ] Test pause during operation
- [ ] Test resume after pause
- [ ] Test cancel during operation

### Phase 6: Documentation & Polish

**6.1 Documentation**
- [ ] Create README.md
  - Project overview
  - Features list
  - Prerequisites
  - Setup instructions (backend + frontend)
  - Usage guide with examples
  - API endpoints documentation
  - Configuration options
  - Troubleshooting guide
- [ ] Create QUICK_START.md
  - Step-by-step first-time setup
  - First operation walkthrough
  - Common operations examples
- [ ] Create PROJECT_SUMMARY.md
  - Architecture overview
  - Code reuse details
  - Performance characteristics
  - Future enhancements roadmap
- [ ] Create CHANGELOG.md
  - Version 1.0.0 features
  - Planned features

**6.2 Setup Automation**
- [ ] Create setup.sh script
  - Check Node.js version
  - Install backend dependencies
  - Install frontend dependencies
  - Create .env from template
  - Build backend
  - Print next steps
- [ ] Make setup.sh executable

**6.3 Configuration**
- [ ] Create .gitignore
  - node_modules
  - dist/build
  - .env files
  - IDE files
- [ ] Create root package.json with convenience scripts
  - `npm run setup`
  - `npm run backend`
  - `npm run frontend`
  - `npm run build`

## Key Design Decisions

### Concurrency Control
**Pattern**: Semaphore with configurable permits
```typescript
const semaphore = new Semaphore(maxConcurrent);
await semaphore.execute(async () => {
  // API operation
});
```

### Progress Tracking
**Pattern**: In-memory session tracking with polling
- Backend tracks operation status
- Frontend polls every 1 second
- Efficient for development, consider WebSockets for production

### Error Handling
**Pattern**: Capture and display errors per operation
- Failed operations don't block others
- Error messages stored with operation
- Session continues even with failures

### Naming Pattern
**Pattern**: `prefix + step + suffix`
```
prefix="Venue-", suffix="-Lab", count=10, startStep=1
→ Venue-1-Lab, Venue-2-Lab, ..., Venue-10-Lab
```

### Delay Implementation
**Pattern**: Sleep between operation starts
```typescript
if (index > 0 && delayMs > 0) {
  await delay(delayMs);
}
```

### Pause/Resume/Cancel
**Pattern**: Check session status before each operation
```typescript
if (session.status === 'cancelled') return;
while (session.status === 'paused') {
  await delay(500);
}
```

## Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "axios": "^1.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "uuid": "^9.0.1",
  "typescript": "^5.3.3",
  "ts-node": "^10.9.2"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.6",
  "vite": "^5.0.8",
  "typescript": "^5.3.3"
}
```

## Environment Configuration

```bash
# backend/.env
RUCKUS_TENANT_ID=your-tenant-id
RUCKUS_CLIENT_ID=your-client-id
RUCKUS_CLIENT_SECRET=your-client-secret
RUCKUS_REGION=us
PORT=3001
```

## Success Criteria

### Functional Requirements
- ✅ Create 100+ venues in parallel
- ✅ Create 100+ WLANs with various types
- ✅ Add 100+ APs to venues/groups
- ✅ Real-time progress tracking
- ✅ Pause/resume/cancel functionality
- ✅ Error handling and display
- ✅ Configurable concurrency and delays

### Non-Functional Requirements
- ✅ Type-safe frontend/backend communication
- ✅ Responsive UI (mobile-friendly)
- ✅ Clean, modern design
- ✅ Comprehensive documentation
- ✅ Easy setup (< 5 minutes)
- ✅ Reuse existing battle-tested code

## Timeline Estimate

- **Phase 1** (Backend): 2 hours
- **Phase 2** (Types): 30 minutes
- **Phase 3** (Frontend Setup): 1 hour
- **Phase 4** (Components): 2 hours
- **Phase 5** (Testing): 1 hour
- **Phase 6** (Documentation): 1 hour

**Total**: ~7-8 hours

## Future Enhancements

### High Priority
1. Export results to CSV/JSON
2. Save/load operation templates
3. Dry-run mode (validate without executing)
4. Operation history persistence

### Medium Priority
5. Database persistence (PostgreSQL)
6. WebSocket real-time updates
7. Operation rollback/undo
8. Batch scheduling
9. Email notifications

### Low Priority
10. Multi-tenant support
11. API rate limit detection
12. Custom retry strategies
13. Advanced filtering/search
14. Dashboard with statistics

## Risk Mitigation

### Risk: RUCKUS API rate limiting
**Mitigation**: Configurable delays, concurrency limits, exponential backoff

### Risk: Memory usage with large sessions
**Mitigation**: Limit session size, add pagination, implement database

### Risk: Frontend crashes during long operations
**Mitigation**: Robust error handling, session recovery, heartbeat checking

### Risk: Incomplete operations on server restart
**Mitigation**: Document limitation, add database persistence in future

### Risk: Concurrent access to same resources
**Mitigation**: Document best practices, add locking in future

## Deployment Considerations

### Development
- HTTP on localhost
- CORS enabled for localhost:3000
- No authentication required
- In-memory storage

### Production (Future)
- HTTPS only
- CORS restricted to production domain
- Authentication middleware (JWT/OAuth)
- Database for persistence
- Rate limiting
- Logging (Winston/Pino)
- Monitoring (Prometheus/Grafana)
- Container deployment (Docker)
- Load balancing for multiple instances

## Conclusion

This implementation plan provides a complete roadmap for building the RUCKUS 1 API Workbench. By reusing the proven ruckus1-mcp codebase and adding intelligent orchestration, the tool will enable efficient bulk operations on RUCKUS One infrastructure with a modern, user-friendly interface.
