import { Router, Request, Response } from 'express';
import { apiLogTracker } from '../models/apiLogTracker';

const router = Router();

/**
 * GET /api/logs
 * Get all API logs
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit } = req.query;

    let logs;
    if (status === 'success' || status === 'error') {
      logs = apiLogTracker.getLogsByStatus(status);
    } else if (limit && !isNaN(Number(limit))) {
      logs = apiLogTracker.getRecentLogs(Number(limit));
    } else {
      logs = apiLogTracker.getLogs();
    }

    res.json({
      success: true,
      data: logs,
      message: `Retrieved ${logs.length} log entries`
    });
  } catch (error: any) {
    console.error('[Logs] Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/logs/stats
 * Get log statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = apiLogTracker.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('[Logs] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * DELETE /api/logs
 * Clear all logs
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    apiLogTracker.clearLogs();

    res.json({
      success: true,
      message: 'All logs cleared'
    });
  } catch (error: any) {
    console.error('[Logs] Error clearing logs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;

