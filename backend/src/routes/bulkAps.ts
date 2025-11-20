import { Router, Request, Response } from 'express';
import {
  bulkAddAps,
  bulkMoveAps,
  bulkRemoveAps
} from '../services/bulkOperationService';
import {
  BulkApAddRequest,
  BulkApMoveRequest,
  BulkApRemoveRequest
} from '../../../shared/types';

const router = Router();

/**
 * POST /api/aps/bulk-add
 * Add multiple APs to a group
 */
router.post('/bulk-add', async (req: Request, res: Response) => {
  try {
    const request: BulkApAddRequest = req.body;

    if (!request.namePrefix || !request.serialPrefix || request.count < 1 || !request.venueId || !request.apGroupId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: namePrefix, serialPrefix, count, venueId, apGroupId'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkAddAps(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk AP addition for ${request.count} APs`
    });
  } catch (error: any) {
    console.error('[BulkAps] Error in bulk-add:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/aps/bulk-move
 * Move multiple APs between venues/groups
 */
router.post('/bulk-move', async (req: Request, res: Response) => {
  try {
    const request: BulkApMoveRequest = req.body;

    if (!request.apSerialNumbers || request.apSerialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'apSerialNumbers array is required and must not be empty'
      });
    }

    if (!request.targetVenueId && !request.targetApGroupId) {
      return res.status(400).json({
        success: false,
        error: 'At least one of targetVenueId or targetApGroupId must be provided'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkMoveAps(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk AP move for ${request.apSerialNumbers.length} APs`
    });
  } catch (error: any) {
    console.error('[BulkAps] Error in bulk-move:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/aps/bulk-remove
 * Remove multiple APs
 */
router.post('/bulk-remove', async (req: Request, res: Response) => {
  try {
    const request: BulkApRemoveRequest = req.body;

    if (!request.apSerialNumbers || request.apSerialNumbers.length === 0 || !request.venueId) {
      return res.status(400).json({
        success: false,
        error: 'apSerialNumbers array and venueId are required'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkRemoveAps(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk AP removal for ${request.apSerialNumbers.length} APs`
    });
  } catch (error: any) {
    console.error('[BulkAps] Error in bulk-remove:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
