import { Router, Request, Response } from 'express';
import {
  bulkCreateGuestPasses,
  bulkDeleteGuestPasses
} from '../services/bulkOperationService';
import {
  BulkGuestPassCreateRequest,
  BulkGuestPassDeleteRequest
} from '../../../shared/types';
import { mcpClient } from '../services/mcpClientService';

const router = Router();

/**
 * GET /api/guest-passes
 * List all guest pass credentials from all guest pass networks
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[GuestPasses] Fetching all guest passes...');

    // Single query for all guest passes (no network filtering needed)
    const result = await mcpClient.queryGuestPasses({
      pageSize: 10000,
      fields: ['id', 'name', 'networkId', 'wifiNetworkId', 'ssid',
               'passDurationHours', 'maxNumberOfClients', 'guestStatus',
               'creationDate', 'expiryDate', 'emailAddress', 'mobilePhoneNumber']
    });

    const guestPasses = result?.data || [];
    console.log(`[GuestPasses] Found ${guestPasses.length} guest passes`);

    res.json({
      success: true,
      data: {
        data: guestPasses,
        totalCount: guestPasses.length,
        page: 1,
        pageSize: guestPasses.length
      }
    });

  } catch (error: any) {
    console.error('[GuestPasses] Error fetching guest passes:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/guest-passes/bulk-create
 * Create multiple guest pass credentials
 */
router.post('/bulk-create', async (req: Request, res: Response) => {
  try {
    const request: BulkGuestPassCreateRequest = req.body;

    // Validate required fields
    if (!request.networkId) {
      return res.status(400).json({
        success: false,
        error: 'networkId is required'
      });
    }

    if (!request.namePrefix) {
      return res.status(400).json({
        success: false,
        error: 'namePrefix is required'
      });
    }

    if (!request.count || request.count < 1) {
      return res.status(400).json({
        success: false,
        error: 'count must be at least 1'
      });
    }

    if (!request.expiration || !request.expiration.duration || !request.expiration.unit || !request.expiration.activationType) {
      return res.status(400).json({
        success: false,
        error: 'expiration is required with duration, unit, and activationType'
      });
    }

    if (!request.maxDevices || request.maxDevices < 1) {
      return res.status(400).json({
        success: false,
        error: 'maxDevices must be at least 1'
      });
    }

    if (!request.deliveryMethods || request.deliveryMethods.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'deliveryMethods is required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    console.log(`[GuestPasses] Starting bulk create for ${request.count} guest passes...`);
    const sessionId = await bulkCreateGuestPasses(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk guest pass creation for ${request.count} credentials`
    });
  } catch (error: any) {
    console.error('[GuestPasses] Error in bulk-create:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/guest-passes/bulk-delete
 * Delete multiple guest pass credentials
 * Note: This requires delete_guest_pass MCP tool to be implemented
 */
router.post('/bulk-delete', async (req: Request, res: Response) => {
  try {
    const request: BulkGuestPassDeleteRequest = req.body;

    if (!request.networkId) {
      return res.status(400).json({
        success: false,
        error: 'networkId is required'
      });
    }

    if (!request.guestPassIds || request.guestPassIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'guestPassIds array is required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    console.log(`[GuestPasses] Starting bulk delete for ${request.guestPassIds.length} guest passes...`);
    const sessionId = await bulkDeleteGuestPasses(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk guest pass deletion for ${request.guestPassIds.length} credentials`
    });
  } catch (error: any) {
    console.error('[GuestPasses] Error in bulk-delete:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
