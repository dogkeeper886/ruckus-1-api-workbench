import { Semaphore } from '../utils/semaphore';
import { operationTracker } from '../models/operationTracker';
import {
  createVenueWithRetry,
  deleteVenueWithRetry,
  createWifiNetworkWithRetry,
  activateWifiNetworkAtVenuesWithRetry,
  deactivateWifiNetworkAtVenuesWithRetry,
  deleteWifiNetworkWithRetry,
  addApToGroupWithRetry,
  removeApWithRetry,
  updateApWithRetrieval,
  getRuckusJwtToken
} from './ruckusApiService';
import {
  BulkVenueCreateRequest,
  BulkVenueDeleteRequest,
  BulkWlanCreateRequest,
  BulkWlanActivateRequest,
  BulkWlanDeactivateRequest,
  BulkWlanDeleteRequest,
  BulkApAddRequest,
  BulkApMoveRequest,
  BulkApRemoveRequest,
  OperationType
} from '../../../shared/types';

/**
 * Helper to generate names with pattern
 */
function generateNames(
  prefix: string,
  suffix: string,
  count: number,
  startStep: number = 1
): string[] {
  return Array.from(
    { length: count },
    (_, i) => `${prefix}${startStep + i}${suffix}`
  );
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get RUCKUS token with caching
 */
async function getToken(): Promise<string> {
  return await getRuckusJwtToken(
    process.env.RUCKUS_TENANT_ID!,
    process.env.RUCKUS_CLIENT_ID!,
    process.env.RUCKUS_CLIENT_SECRET!,
    process.env.RUCKUS_REGION
  );
}

/**
 * Bulk venue create operation
 */
export async function bulkCreateVenues(request: BulkVenueCreateRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  // Generate venue names
  const venueNames = generateNames(
    request.prefix,
    request.suffix,
    request.count,
    request.startStep
  );

  // Create session
  const sessionId = operationTracker.createSession('venue', 'create', venueNames.length);

  // Create semaphore for concurrency control
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Track cancellation
  const session = operationTracker.getSession(sessionId);
  if (!session) {
    throw new Error('Failed to create session');
  }

  // Execute operations
  const executeOperation = async (venueName: string, index: number) => {
    // Check if session is cancelled
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    // Wait for pause
    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    // Add delay between operations (except first one)
    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'venue', 'create', venueName);

    try {
      await semaphore.acquire();

      // Update to running
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      // Execute venue creation
      const result = await createVenueWithRetry(
        token,
        venueName,
        request.addressLine,
        request.city,
        request.country,
        request.timezone,
        region,
        5, // maxRetries
        2000 // pollIntervalMs
      );

      // Update to success
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result,
        activityId: result.activityId
      });

    } catch (error: any) {
      // Update to failed
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  // Execute all operations
  Promise.all(
    venueNames.map((venueName, index) => executeOperation(venueName, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk venue create:', err);
  });

  return sessionId;
}

/**
 * Bulk venue delete operation
 */
export async function bulkDeleteVenues(request: BulkVenueDeleteRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  // Create session
  const sessionId = operationTracker.createSession('venue', 'delete', request.venueIds.length);

  // Create semaphore
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Execute operations
  const executeOperation = async (venueId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'venue', 'delete', venueId);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await deleteVenueWithRetry(token, venueId, region, 5, 2000);

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result,
        activityId: result.activityId
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.venueIds.map((venueId, index) => executeOperation(venueId, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk venue delete:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN create operation
 */
export async function bulkCreateWlans(request: BulkWlanCreateRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const names = generateNames(request.namePrefix, request.nameSuffix, request.count, request.startStep);
  const ssids = generateNames(request.ssidPrefix, request.ssidSuffix, request.count, request.startStep);

  const sessionId = operationTracker.createSession('wlan', 'create', names.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (name: string, ssid: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'wlan', 'create', `${name} (${ssid})`);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await createWifiNetworkWithRetry(
        token,
        name,
        ssid,
        request.type,
        request.wlanSecurity,
        request.passphrase,
        request.portalServiceProfileId,
        request.vlanId,
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    names.map((name, index) => executeOperation(name, ssids[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN create:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN activate operation
 */
export async function bulkActivateWlans(request: BulkWlanActivateRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const sessionId = operationTracker.createSession('wlan', 'activate', request.networkIds.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'wlan', 'activate', networkId);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await activateWifiNetworkAtVenuesWithRetry(
        token,
        networkId,
        request.venueConfigs,
        request.portalServiceProfileId,
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN activate:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN deactivate operation
 */
export async function bulkDeactivateWlans(request: BulkWlanDeactivateRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const sessionId = operationTracker.createSession('wlan', 'deactivate', request.networkIds.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'wlan', 'deactivate', networkId);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await deactivateWifiNetworkAtVenuesWithRetry(
        token,
        networkId,
        request.venueIds,
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN deactivate:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN delete operation
 */
export async function bulkDeleteWlans(request: BulkWlanDeleteRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const sessionId = operationTracker.createSession('wlan', 'delete', request.networkIds.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'wlan', 'delete', networkId);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await deleteWifiNetworkWithRetry(token, networkId, region, 5, 2000);

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN delete:', err);
  });

  return sessionId;
}

/**
 * Bulk AP add operation
 */
export async function bulkAddAps(request: BulkApAddRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const names = generateNames(request.namePrefix, request.nameSuffix, request.count, request.startStep);
  const serialNumbers = generateNames(request.serialPrefix, request.serialSuffix, request.count, request.startStep);

  const sessionId = operationTracker.createSession('ap', 'add', names.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (name: string, serialNumber: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'ap', 'add', `${name} (${serialNumber})`);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await addApToGroupWithRetry(
        token,
        request.venueId,
        request.apGroupId,
        name,
        serialNumber,
        request.description,
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    names.map((name, index) => executeOperation(name, serialNumbers[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP add:', err);
  });

  return sessionId;
}

/**
 * Bulk AP move operation
 */
export async function bulkMoveAps(request: BulkApMoveRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const sessionId = operationTracker.createSession('ap', 'move', request.apSerialNumbers.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (serialNumber: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'ap', 'move', serialNumber);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await updateApWithRetrieval(
        token,
        serialNumber,
        {
          venueId: request.targetVenueId,
          apGroupId: request.targetApGroupId
        },
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.apSerialNumbers.map((serialNumber, index) => executeOperation(serialNumber, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP move:', err);
  });

  return sessionId;
}

/**
 * Bulk AP remove operation
 */
export async function bulkRemoveAps(request: BulkApRemoveRequest): Promise<string> {
  const token = await getToken();
  const region = process.env.RUCKUS_REGION || '';

  const sessionId = operationTracker.createSession('ap', 'remove', request.apSerialNumbers.length);
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (serialNumber: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    if (index > 0 && request.options.delayMs > 0) {
      await delay(request.options.delayMs);
    }

    const operationId = operationTracker.addOperation(sessionId, 'ap', 'remove', serialNumber);

    try {
      await semaphore.acquire();

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await removeApWithRetry(
        token,
        request.venueId,
        serialNumber,
        region,
        5,
        2000
      );

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        result: result
      });

    } catch (error: any) {
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message || String(error)
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.apSerialNumbers.map((serialNumber, index) => executeOperation(serialNumber, index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP remove:', err);
  });

  return sessionId;
}
