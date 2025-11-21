# Next Steps - MCP Communication Investigation

## Current Status

✅ **Completed (v1.1.0)**
- Added comprehensive debug logging to MCP client service
- Fixed MCP server path resolution (absolute paths)
- Created `/api/venues/test-mcp` endpoint for connectivity testing
- Created Makefile for automated process management
- Verified MCP server works correctly when run standalone

## Outstanding Issues

### 1. MCP Server Communication Problem

**Symptom:** 
- Backend MCP client connects to MCP server successfully
- Tool calls are sent but responses come back empty (`content[0].text: ""`)
- `isError` is `undefined` instead of `true` or `false`
- Venues list returns 0 venues despite accounts having venues

**Evidence:**
```
[MCP Client] Calling tool: get_ruckus_venues
[MCP Client] Arguments: {}
[MCP Client] Response received for get_ruckus_venues
[MCP Client] Is error: undefined
[MCP Client] Content type: object
[MCP Client] Raw response text: ""
[MCP Client] Successfully parsed JSON response
```

**Verified Working:**
- MCP server responds correctly when tested directly with stdio
- Environment variables are configured correctly in both backend/.env and ruckus1-mcp/.env
- Token service and caching work in the MCP server

**Root Cause Hypothesis:**
The stdio communication channel between Node.js MCP Client SDK and the spawned MCP server process is not transmitting data correctly. Possible causes:
1. Buffer/stream synchronization issues with npx/ts-node pipes
2. MCP SDK version compatibility issue with stdio transport
3. MCP server process writing responses but backend not reading them
4. Protocol mismatch in JSON-RPC message format

## Immediate Action Items

### Step 1: Verify stdio Communication
```bash
# Start backend with full logging
make backend

# In another terminal, test MCP endpoint
curl http://localhost:3003/api/venues/test-mcp | jq '.'

# Check backend logs for:
# - Full request being sent to MCP server
# - Raw response from MCP server
# - Any stdio errors or warnings
```

### Step 2: Test Direct MCP Server Invocation
Test if the issue is specific to the backend's spawning method:

```bash
# Test MCP server directly
cd ruckus1-mcp
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_ruckus_venues","arguments":{}}}' | \
  RUCKUS_TENANT_ID=xxx RUCKUS_CLIENT_ID=xxx RUCKUS_CLIENT_SECRET=xxx RUCKUS_REGION=dev \
  npx ts-node src/mcpServer.ts
```

Compare the response format with what the backend receives.

### Step 3: Alternative MCP Server Execution
Try different execution methods in `mcpClientService.ts`:

**Option A: Use compiled JavaScript instead of ts-node**
```typescript
// Build MCP server first: cd ruckus1-mcp && npm run build
const mcpServerPath = path.join(projectRoot, 'ruckus1-mcp/dist/mcpServer.js');
this.transport = new StdioClientTransport({
  command: 'node',
  args: [mcpServerPath],
  // ... rest of config
});
```

**Option B: Use direct ts-node path**
```typescript
const tsNodeBin = path.join(projectRoot, 'backend/node_modules/.bin/ts-node');
this.transport = new StdioClientTransport({
  command: tsNodeBin,
  args: [mcpServerPath],
  // ... rest of config
});
```

### Step 4: Check MCP SDK Versions
Verify both backend and MCP server use compatible SDK versions:
```bash
cd backend && npm list @modelcontextprotocol/sdk
cd ../ruckus1-mcp && npm list @modelcontextprotocol/sdk
```

If versions differ, align them.

### Step 5: Add MCP Server Debug Output
Temporarily add logging to MCP server to verify it receives requests:

In `ruckus1-mcp/src/mcpServer.ts`, add before the switch statement:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`[MCP SERVER] Received tool call: ${name}`);
  console.error(`[MCP SERVER] Arguments: ${JSON.stringify(args)}`);
  
  // ... existing code
  
  console.error(`[MCP SERVER] Sending response: ${JSON.stringify(response).substring(0, 200)}`);
  return response;
});
```

Note: Use `console.error()` instead of `console.log()` because stdout is used for MCP protocol.

## Alternative Solutions

If stdio communication cannot be fixed:

### Option 1: HTTP MCP Server
Convert MCP server to use HTTP transport instead of stdio:
- More reliable for process communication
- Easier to debug with tools like curl
- Requires MCP server to run as separate service

### Option 2: Direct API Integration
Bypass MCP server entirely:
- Move `ruckusApiService.ts` functions directly into backend
- Simplifies architecture
- Loses MCP protocol benefits

### Option 3: Use Compiled MCP Server
Pre-compile MCP server and run the JavaScript:
- Potentially more reliable than ts-node
- Faster startup
- Easier to debug

## Testing Checklist

- [ ] Backend starts without errors
- [ ] MCP server process is spawned
- [ ] Environment variables are passed to MCP server
- [ ] Tool calls are sent from backend
- [ ] MCP server receives tool calls (check with debug logging)
- [ ] MCP server executes tool logic
- [ ] MCP server sends responses
- [ ] Backend receives non-empty responses
- [ ] Token caching works
- [ ] Venues list returns actual data

## Success Criteria

When fixed:
1. `GET /api/venues` returns list of venues (not empty)
2. `GET /api/venues/test-mcp` shows successful token and venues tests
3. Backend logs show non-empty response text from MCP server
4. Token cache statistics show cached tokens

## Files Modified in v1.1.0

- `backend/src/services/mcpClientService.ts` - Added debug logging, fixed paths
- `backend/src/routes/bulkVenues.ts` - Added test endpoint
- `Makefile` - Process management automation
- `backend/dist/` - Recompiled with changes

## Documentation

- Archived implementation docs to `docs/archive/v1.1.0/`
- Updated QUICK_START.md with Makefile usage
- This file contains next investigation steps

## Resources

- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [MCP Protocol Spec](https://spec.modelcontextprotocol.io/)
- Project MCP findings: `ruckus1-mcp/MCP_PROTOCOL_FINDINGS.md`
- Existing tests: `ruckus1-mcp/tests/`

---

**Created:** 2025-11-21  
**Version:** v1.1.0  
**Status:** Investigation Required

