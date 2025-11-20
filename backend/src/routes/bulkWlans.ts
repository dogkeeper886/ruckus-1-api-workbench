import { Router, Request, Response } from 'express';
import {
  bulkCreateWlans,
  bulkActivateWlans,
  bulkDeactivateWlans,
  bulkDeleteWlans
} from '../services/bulkOperationService';
import {
  BulkWlanCreateRequest,
  BulkWlanActivateRequest,
  BulkWlanDeactivateRequest,
  BulkWlanDeleteRequest
} from '../../../shared/types';

const router = Router();

/**
 * POST /api/wlans/bulk-create
 * Create multiple WLANs
 */
router.post('/bulk-create', async (req: Request, res: Response) => {
  try {
    const request: BulkWlanCreateRequest = req.body;

    if (!request.namePrefix || !request.ssidPrefix || request.count < 1 || !request.type || !request.wlanSecurity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: namePrefix, ssidPrefix, count, type, wlanSecurity'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkCreateWlans(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk WLAN creation for ${request.count} networks`
    });
  } catch (error: any) {
    console.error('[BulkWlans] Error in bulk-create:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/wlans/bulk-activate
 * Activate multiple WLANs at venues
 */
router.post('/bulk-activate', async (req: Request, res: Response) => {
  try {
    const request: BulkWlanActivateRequest = req.body;

    if (!request.networkIds || request.networkIds.length === 0 || !request.venueConfigs || request.venueConfigs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'networkIds and venueConfigs arrays are required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkActivateWlans(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk WLAN activation for ${request.networkIds.length} networks`
    });
  } catch (error: any) {
    console.error('[BulkWlans] Error in bulk-activate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/wlans/bulk-deactivate
 * Deactivate multiple WLANs from venues
 */
router.post('/bulk-deactivate', async (req: Request, res: Response) => {
  try {
    const request: BulkWlanDeactivateRequest = req.body;

    if (!request.networkIds || request.networkIds.length === 0 || !request.venueIds || request.venueIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'networkIds and venueIds arrays are required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkDeactivateWlans(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk WLAN deactivation for ${request.networkIds.length} networks`
    });
  } catch (error: any) {
    console.error('[BulkWlans] Error in bulk-deactivate:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/wlans/bulk-delete
 * Delete multiple WLANs
 */
router.post('/bulk-delete', async (req: Request, res: Response) => {
  try {
    const request: BulkWlanDeleteRequest = req.body;

    if (!request.networkIds || request.networkIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'networkIds array is required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkDeleteWlans(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk WLAN deletion for ${request.networkIds.length} networks`
    });
  } catch (error: any) {
    console.error('[BulkWlans] Error in bulk-delete:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
