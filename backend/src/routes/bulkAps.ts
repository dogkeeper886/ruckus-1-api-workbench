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
import { mcpClient } from '../services/mcpClientService';

const router = Router();

/**
 * GET /api/aps/ap-groups?venueId=xxx
 * List AP groups from RUCKUS One, optionally filtered by venue
 * NOTE: This must be defined BEFORE the GET / route to avoid path collision
 */
router.get('/ap-groups', async (req: Request, res: Response) => {
  try {
    const { venueId } = req.query;
    console.log('[APs] Fetching AP groups via MCP...', venueId ? `for venue: ${venueId}` : 'all venues');
    
    const params: any = {
      fields: ['id', 'name', 'venueId', 'venueName', 'description', 'isDefault'],
      pageSize: 10000
    };
    
    // Filter by venue if provided
    if (venueId) {
      params.filters = { venueId: [venueId as string] };
      console.log('[APs] Filter params:', JSON.stringify(params.filters));
    }
    
    const apGroups = await mcpClient.getApGroups(params);
    
    console.log('[APs] AP groups raw response:', JSON.stringify(apGroups, null, 2));
    
    // Transform data: show "Default AP Group" for groups with empty names and isDefault=true
    const transformedData = apGroups.data?.map((group: any) => {
      if ((!group.name || group.name.trim() === '') && group.isDefault) {
        return {
          ...group,
          name: 'Default AP Group'
        };
      }
      return group;
    }) || [];
    
    console.log('[APs] Transformed AP groups:', transformedData.length, 'groups');
    
    res.json({
      success: true,
      data: {
        ...apGroups,
        data: transformedData
      },
      message: `Found ${transformedData.length} AP groups`
    });
  } catch (error: any) {
    console.error('[APs] Error fetching AP groups:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/aps
 * List all APs from RUCKUS One
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { venueId, searchString, page = '1', pageSize = '100' } = req.query;
    
    console.log('[APs] Fetching APs via MCP...');
    const aps = await mcpClient.getAps({
      venueId: venueId as string,
      searchString: searchString as string,
      page: Number(page),
      pageSize: Number(pageSize)
    });
    
    res.json({
      success: true,
      data: aps,
      message: `Found ${aps.data?.length || 0} APs`
    });
  } catch (error: any) {
    console.error('[APs] Error fetching APs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

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
