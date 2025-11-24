import { Router, Request, Response } from 'express';
import { bulkCreateVenues, bulkDeleteVenues } from '../services/bulkOperationService';
import { operationTracker } from '../models/operationTracker';
import { BulkVenueCreateRequest, BulkVenueDeleteRequest } from '../../../shared/types';
import { mcpClient } from '../services/mcpClientService';

const router = Router();

/**
 * GET /api/venues/test-mcp
 * Test MCP server connectivity
 */
router.get('/test-mcp', async (req: Request, res: Response) => {
  try {
    console.log('[Venues] Testing MCP server connectivity...');
    
    // Test 1: Get auth token
    console.log('[Venues] Test 1: Getting auth token...');
    const tokenResponse = await mcpClient.getAuthToken();
    console.log('[Venues] Token response:', tokenResponse);
    
    // Test 2: Get venues
    console.log('[Venues] Test 2: Getting venues...');
    const venuesResponse = await mcpClient.getVenues();
    console.log('[Venues] Venues response:', venuesResponse);
    
    res.json({
      success: true,
      data: {
        tokenTest: {
          success: !!tokenResponse,
          hasToken: !!tokenResponse,
          tokenResponse: tokenResponse
        },
        venuesTest: {
          success: !!venuesResponse,
          venueCount: venuesResponse?.data?.length || 0,
          venuesResponse: venuesResponse
        }
      },
      message: 'MCP server connectivity test completed'
    });
  } catch (error: any) {
    console.error('[Venues] MCP test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack
    });
  }
});

/**
 * GET /api/venues
 * List all venues from RUCKUS One
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('[Venues] Fetching venues...');
    const venues = await mcpClient.getVenues();

    const venueCount = venues.data?.length || 0;
    console.log(`[Venues] Found ${venueCount} venues`);

    res.json({
      success: true,
      data: venues,
      message: `Found ${venueCount} venues`
    });
  } catch (error: any) {
    console.error('[Venues] Error fetching venues:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/venues/bulk-create
 * Create multiple venues
 */
router.post('/bulk-create', async (req: Request, res: Response) => {
  try {
    const request: BulkVenueCreateRequest = req.body;

    // Validate request
    if (!request.prefix || request.count < 1 || !request.addressLine || !request.city || !request.country) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prefix, count, addressLine, city, country'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkCreateVenues(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk venue creation for ${request.count} venues`
    });
  } catch (error: any) {
    console.error('[BulkVenues] Error in bulk-create:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/venues/bulk-delete
 * Delete multiple venues
 */
router.post('/bulk-delete', async (req: Request, res: Response) => {
  try {
    const request: BulkVenueDeleteRequest = req.body;

    if (!request.venueIds || request.venueIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'venueIds array is required and must not be empty'
      });
    }

    if (request.options.maxConcurrent < 1 || request.options.maxConcurrent > 20) {
      return res.status(400).json({
        success: false,
        error: 'maxConcurrent must be between 1 and 20'
      });
    }

    const sessionId = await bulkDeleteVenues(request);

    res.json({
      success: true,
      data: { sessionId },
      message: `Started bulk venue deletion for ${request.venueIds.length} venues`
    });
  } catch (error: any) {
    console.error('[BulkVenues] Error in bulk-delete:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
