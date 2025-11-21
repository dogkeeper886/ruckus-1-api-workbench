# Quick Start Guide

## 1. Setup (First Time)

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

## 2. Configure Credentials

Edit `backend/.env`:

```bash
nano backend/.env
```

Add your RUCKUS One credentials:
```
RUCKUS_TENANT_ID=your-tenant-id-here
RUCKUS_CLIENT_ID=your-client-id-here
RUCKUS_CLIENT_SECRET=your-secret-here
RUCKUS_REGION=us
PORT=3003
```

Save and exit (Ctrl+X, Y, Enter)

## 3. Start Services (Using Makefile - Recommended)

**Option A: Clean start with Makefile**
```bash
# Clean up any old processes and start backend
make backend
```

In another terminal:
```bash
# Start frontend
make frontend
```

**Option B: Manual start**

Terminal 1:
```bash
cd backend
npm run dev
```

Terminal 2:
```bash
cd frontend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║   RUCKUS 1 API Workbench Backend                     ║
║   Server running on http://localhost:3003            ║
╚═══════════════════════════════════════════════════════╝
```

**Makefile Commands:**
- `make clean` - Kill old processes
- `make status` - Show running services
- `make backend` - Clean + start backend
- `make frontend` - Start frontend  
- `make dev` - Start both (parallel)
- `make stop` - Stop all services

## 4. Verify Services Running

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3002/
➜  Network: use --host to expose
```

## 5. Open Browser

Navigate to: **http://localhost:3002**

## 6. Your First Bulk Operation

### Create 10 Test Venues

1. Click "Venues" tab (default)
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

## 7. Verify in RUCKUS One

Log into your RUCKUS One dashboard and verify the venues were created:
- TestVenue-1
- TestVenue-2
- ...
- TestVenue-10

## 8. Clean Up Test Venues

1. In RUCKUS One, copy the venue IDs
2. Return to the workbench
3. Select "Delete Venues"
4. Paste venue IDs (one per line)
5. Set concurrency: `5`
6. Set delay: `500`
7. Click "Delete Venues"

## Troubleshooting

### Old processes still running
```bash
# Use Makefile to clean up
make clean

# Or manually check and kill
make status
```

### Backend won't start
```bash
# Check Node.js version (should be 18+)
node -v

# Clean up old processes first
make clean

# Reinstall dependencies if needed
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Authentication errors
- Verify credentials in `backend/.env`
- Ensure credentials have API access in RUCKUS One
- Check RUCKUS_TENANT_ID, RUCKUS_CLIENT_ID, RUCKUS_CLIENT_SECRET

### CORS errors
- Ensure backend is running on port 3003
- Ensure frontend is running on port 3002
- Check browser console for detailed errors

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

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [PROJECT_SUMMARY.md](docs/archive/v1.0.0/PROJECT_SUMMARY.md) for architecture details
- Explore the API endpoints at http://localhost:3003/health
- Review backend logs for debugging
- Check browser console for frontend errors

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review backend terminal for error messages
3. Check browser console (F12) for frontend errors
4. Verify RUCKUS One credentials are correct
5. Ensure you have API permissions in RUCKUS One

Enjoy bulk operations! 🚀
