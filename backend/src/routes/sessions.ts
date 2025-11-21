import { Router, Request, Response } from 'express';
import { operationTracker } from '../models/operationTracker';
import { tokenService } from '../services/tokenService';

const router = Router();

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const sessions = operationTracker.getAllSessions();
    res.json({
      success: true,
      data: sessions
    });
  } catch (error: any) {
    console.error('[Sessions] Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/sessions/token-stats
 * Get token cache statistics (for debugging)
 */
router.get('/token-stats', (req: Request, res: Response) => {
  try {
    const stats = tokenService.getTokenStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('[Sessions] Error getting token stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
router.get('/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = operationTracker.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    console.error('[Sessions] Error getting session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/sessions/:sessionId/progress
 * Get session progress
 */
router.get('/:sessionId/progress', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const progress = operationTracker.getProgress(sessionId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error: any) {
    console.error('[Sessions] Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/sessions/:sessionId/operations
 * Get all operations for a session
 */
router.get('/:sessionId/operations', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const operations = operationTracker.getOperations(sessionId);

    res.json({
      success: true,
      data: operations
    });
  } catch (error: any) {
    console.error('[Sessions] Error getting operations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/sessions/:sessionId/pause
 * Pause a session
 */
router.post('/:sessionId/pause', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    operationTracker.pauseSession(sessionId);

    res.json({
      success: true,
      message: 'Session paused'
    });
  } catch (error: any) {
    console.error('[Sessions] Error pausing session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/sessions/:sessionId/resume
 * Resume a paused session
 */
router.post('/:sessionId/resume', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    operationTracker.resumeSession(sessionId);

    res.json({
      success: true,
      message: 'Session resumed'
    });
  } catch (error: any) {
    console.error('[Sessions] Error resuming session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/sessions/:sessionId/cancel
 * Cancel a session
 */
router.post('/:sessionId/cancel', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    operationTracker.cancelSession(sessionId);

    res.json({
      success: true,
      message: 'Session cancelled'
    });
  } catch (error: any) {
    console.error('[Sessions] Error cancelling session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * Delete a session
 */
router.delete('/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    operationTracker.deleteSession(sessionId);

    res.json({
      success: true,
      message: 'Session deleted'
    });
  } catch (error: any) {
    console.error('[Sessions] Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
