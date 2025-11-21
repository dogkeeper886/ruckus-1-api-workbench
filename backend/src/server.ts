import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bulkVenuesRouter from './routes/bulkVenues';
import bulkWlansRouter from './routes/bulkWlans';
import bulkApsRouter from './routes/bulkAps';
import sessionsRouter from './routes/sessions';
import logsRouter from './routes/logs';
import { mcpClient } from './services/mcpClientService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RUCKUS 1 API Workbench Backend'
  });
});

// API Routes
app.use('/api/venues', bulkVenuesRouter);
app.use('/api/wlans', bulkWlansRouter);
app.use('/api/aps', bulkApsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/logs', logsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize MCP client and start server
async function startServer() {
  try {
    console.log('[Server] Initializing MCP client...');
    await mcpClient.start();
    console.log('[Server] MCP client initialized successfully');

    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   RUCKUS 1 API Workbench Backend                     ║
║   Server running on http://localhost:${PORT}          ║
╚═══════════════════════════════════════════════════════╝

Environment:
  - RUCKUS_TENANT_ID: ${process.env.RUCKUS_TENANT_ID ? '✓ Set' : '✗ Not set'}
  - RUCKUS_CLIENT_ID: ${process.env.RUCKUS_CLIENT_ID ? '✓ Set' : '✗ Not set'}
  - RUCKUS_CLIENT_SECRET: ${process.env.RUCKUS_CLIENT_SECRET ? '✓ Set' : '✗ Not set'}
  - RUCKUS_REGION: ${process.env.RUCKUS_REGION || 'global (default)'}
  - MCP Server: ✓ Running

Available endpoints:
  - GET  /health
  - GET  /api/venues
  - POST /api/venues/bulk-create
  - POST /api/venues/bulk-delete
  - POST /api/wlans/bulk-create
  - POST /api/wlans/bulk-activate
  - POST /api/wlans/bulk-deactivate
  - POST /api/wlans/bulk-delete
  - POST /api/aps/bulk-add
  - POST /api/aps/bulk-move
  - POST /api/aps/bulk-remove
  - GET  /api/sessions
  - GET  /api/sessions/token-stats
  - GET  /api/sessions/:sessionId
  - GET  /api/sessions/:sessionId/progress
  - GET  /api/sessions/:sessionId/operations
  - POST /api/sessions/:sessionId/pause
  - POST /api/sessions/:sessionId/resume
  - POST /api/sessions/:sessionId/cancel
  - DELETE /api/sessions/:sessionId
  - GET  /api/logs
  - GET  /api/logs/stats
  - DELETE /api/logs
  `);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] ${signal} received, shutting down gracefully...`);
      
      // Stop accepting new connections
      server.close(async () => {
        console.log('[Server] HTTP server closed');
        
        // Stop MCP client
        try {
          await mcpClient.stop();
          console.log('[Server] MCP client stopped');
        } catch (error) {
          console.error('[Server] Error stopping MCP client:', error);
        }
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Register shutdown handlers
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
