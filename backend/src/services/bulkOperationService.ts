import { Semaphore } from '../utils/semaphore';
import { operationTracker } from '../models/operationTracker';
import { mcpClient } from './mcpClientService';
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
  BulkGuestPassCreateRequest,
  BulkGuestPassDeleteRequest,
  OperationType
} from '../../../shared/types';

/**
 * Helper to parse JSON string errors from MCP responses
 */
function parseErrorJson(errorStr: string): any {
  if (!errorStr) return null;

  try {
    return JSON.parse(errorStr);
  } catch (e) {
    return { message: errorStr };
  }
}

/**
 * Helper to parse error message string into MCP response object
 */
function parseErrorToMcpResponse(errorInput: any): any {
  if (typeof errorInput === 'string') {
    // Try to extract JSON from "Tool xxx error: {JSON}" format
    const match = errorInput.match(/Tool \w+ error:\s*(\{[\s\S]*\})\s*$/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  return errorInput;
}

/**
 * Helper to extract clean error message from MCP response or error string
 */
function extractErrorMessage(errorInput: any): string {
  // Parse error string to MCP response if needed
  const mcpResponse = parseErrorToMcpResponse(errorInput);

  if (!mcpResponse) {
    // Not a valid MCP response, return truncated string
    const errorStr = typeof errorInput === 'string' ? errorInput : String(errorInput);
    return errorStr.length > 150 ? errorStr.substring(0, 150) + '...' : errorStr;
  }

  // Priority order for extracting meaningful error messages:

  // 1. Check activityDetails.error (JSON string that needs parsing)
  if (mcpResponse.activityDetails?.error) {
    const errorObj = parseErrorJson(mcpResponse.activityDetails.error);

    // Try to extract from errors array
    if (errorObj?.errors && Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
      const firstError = errorObj.errors[0];

      // Handle double-encoded JSON string
      if (typeof firstError === 'string') {
        const parsed = parseErrorJson(firstError);
        return parsed?.message || firstError;
      }

      return firstError.message || JSON.stringify(firstError);
    }

    return errorObj?.message || mcpResponse.activityDetails.error;
  }

  // 2. Check for failed steps
  if (mcpResponse.activityDetails?.steps) {
    const failedStep = mcpResponse.activityDetails.steps.find((s: any) => s.status === 'FAIL');
    if (failedStep?.error) {
      const stepError = parseErrorJson(failedStep.error);
      if (stepError?.errors && stepError.errors[0]) {
        const firstError = typeof stepError.errors[0] === 'string'
          ? parseErrorJson(stepError.errors[0])
          : stepError.errors[0];
        return firstError?.message || 'Operation failed';
      }
      return failedStep.error;
    }
  }

  // 3. Check top-level error field
  if (mcpResponse.error) {
    return typeof mcpResponse.error === 'string' ? mcpResponse.error : JSON.stringify(mcpResponse.error);
  }

  // 4. Check message field
  if (mcpResponse.message) {
    return mcpResponse.message;
  }

  return 'Unknown error';
}

/**
 * Helper to normalize MCP response (remove duplicates, parse JSON strings)
 */
function normalizeMcpResponse(mcpResponse: any): any {
  if (!mcpResponse) return null;

  // Parse activityDetails.error from JSON string to object
  const activityDetails = mcpResponse.activityDetails ? {
    ...mcpResponse.activityDetails,
    error: parseErrorJson(mcpResponse.activityDetails.error)
  } : null;

  return {
    requestId: mcpResponse.requestId || mcpResponse.activityId,
    activityDetails
  };
}

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
 * Bulk venue create operation
 */
export async function bulkCreateVenues(request: BulkVenueCreateRequest): Promise<string> {

  // Generate venue names
  const venueNames = generateNames(
    request.prefix,
    request.suffix,
    request.count,
    request.startStep
  );

  // Create session
  const sessionId = operationTracker.createSession('venue', 'create', venueNames.length);

  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const venueName of venueNames) {
    const opId = operationTracker.addOperation(sessionId, 'venue', 'create', venueName);
    operationIds.push(opId);
  }

  // Create semaphore for concurrency control
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Track cancellation
  const session = operationTracker.getSession(sessionId);
  if (!session) {
    throw new Error('Failed to create session');
  }

  // Execute operations
  const executeOperation = async (venueName: string, operationId: string, index: number) => {
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

    try {
      await semaphore.acquire();

      // Capture request data
      const requestData = {
        name: venueName,
        addressLine: request.addressLine,
        city: request.city,
        country: request.country,
        timezone: request.timezone
      };

      // Update to running with request data
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date(),
        requestData
      });

      // Execute venue creation via MCP
      const result = await mcpClient.createVenue({
        name: venueName,
        addressLine: request.addressLine,
        city: request.city,
        country: request.country,
        timezone: request.timezone,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  // Execute all operations
  Promise.all(
    venueNames.map((venueName, index) => executeOperation(venueName, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk venue create:', err);
  });

  return sessionId;
}

/**
 * Bulk venue delete operation
 */
export async function bulkDeleteVenues(request: BulkVenueDeleteRequest): Promise<string> {

  // Create session
  const sessionId = operationTracker.createSession('venue', 'delete', request.venueIds.length);

  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const venueId of request.venueIds) {
    const opId = operationTracker.addOperation(sessionId, 'venue', 'delete', venueId);
    operationIds.push(opId);
  }

  // Create semaphore
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Execute operations
  const executeOperation = async (venueId: string, operationId: string, index: number) => {
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

    try {
      await semaphore.acquire();

      // Capture request data
      const requestData = {
        venueId
      };

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date(),
        requestData
      });

      const result = await mcpClient.deleteVenue({
        venueId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.venueIds.map((venueId, index) => executeOperation(venueId, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk venue delete:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN create operation
 */
export async function bulkCreateWlans(request: BulkWlanCreateRequest): Promise<string> {

  const names = generateNames(request.namePrefix, '', request.count, request.startStep);
  const ssids = generateNames(request.ssidPrefix, '', request.count, request.startStep);

  const sessionId = operationTracker.createSession('wlan', 'create', names.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (let i = 0; i < names.length; i++) {
    const opId = operationTracker.addOperation(sessionId, 'wlan', 'create', `${names[i]} (${ssids[i]})`);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (name: string, ssid: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.createWifiNetwork({
        name,
        ssid,
        type: request.type as 'psk' | 'enterprise' | 'open' | 'guest',
        wlanSecurity: request.wlanSecurity as 'WPA2Personal' | 'WPA3Personal' | 'WPA2Enterprise' | 'WPA3Enterprise' | 'Open' | 'None',
        passphrase: request.passphrase,
        portalServiceProfileId: request.portalServiceProfileId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    names.map((name, index) => executeOperation(name, ssids[index], operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN create:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN activate operation
 */
export async function bulkActivateWlans(request: BulkWlanActivateRequest): Promise<string> {

  const sessionId = operationTracker.createSession('wlan', 'activate', request.networkIds.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const networkId of request.networkIds) {
    const opId = operationTracker.addOperation(sessionId, 'wlan', 'activate', networkId);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.activateWifiNetworkAtVenues({
        networkId,
        venueConfigs: request.venueConfigs as any,
        portalServiceProfileId: request.portalServiceProfileId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN activate:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN deactivate operation
 */
export async function bulkDeactivateWlans(request: BulkWlanDeactivateRequest): Promise<string> {

  const sessionId = operationTracker.createSession('wlan', 'deactivate', request.networkIds.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const networkId of request.networkIds) {
    const opId = operationTracker.addOperation(sessionId, 'wlan', 'deactivate', networkId);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.deactivateWifiNetworkAtVenues({
        networkId,
        venueIds: request.venueIds,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN deactivate:', err);
  });

  return sessionId;
}

/**
 * Bulk WLAN delete operation
 */
export async function bulkDeleteWlans(request: BulkWlanDeleteRequest): Promise<string> {

  const sessionId = operationTracker.createSession('wlan', 'delete', request.networkIds.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const networkId of request.networkIds) {
    const opId = operationTracker.addOperation(sessionId, 'wlan', 'delete', networkId);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (networkId: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.deleteWifiNetwork({
        networkId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.networkIds.map((networkId, index) => executeOperation(networkId, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk WLAN delete:', err);
  });

  return sessionId;
}

/**
 * Bulk AP add operation
 */
export async function bulkAddAps(request: BulkApAddRequest): Promise<string> {

  const names = generateNames(request.namePrefix, request.nameSuffix, request.count, request.startStep);

  // Generate serial numbers by incrementing the starting serial number
  const startSerial = parseInt(request.startSerialNumber, 10);
  const serialNumbers = Array.from(
    { length: request.count },
    (_, i) => (startSerial + i).toString()
  );

  const sessionId = operationTracker.createSession('ap', 'add', names.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (let i = 0; i < names.length; i++) {
    const opId = operationTracker.addOperation(sessionId, 'ap', 'add', `${names[i]} (${serialNumbers[i]})`);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (name: string, serialNumber: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.addApToGroup({
        venueId: request.venueId,
        apGroupId: request.apGroupId,
        name,
        serialNumber,
        description: request.description,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    names.map((name, index) => executeOperation(name, serialNumbers[index], operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP add:', err);
  });

  return sessionId;
}

/**
 * Bulk AP move operation
 */
export async function bulkMoveAps(request: BulkApMoveRequest): Promise<string> {

  const sessionId = operationTracker.createSession('ap', 'move', request.apSerialNumbers.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const serialNumber of request.apSerialNumbers) {
    const opId = operationTracker.addOperation(sessionId, 'ap', 'move', serialNumber);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (serialNumber: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.updateAp({
        apSerialNumber: serialNumber,
        venueId: request.targetVenueId,
        apGroupId: request.targetApGroupId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.apSerialNumbers.map((serialNumber, index) => executeOperation(serialNumber, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP move:', err);
  });

  return sessionId;
}

/**
 * Bulk AP remove operation
 */
export async function bulkRemoveAps(request: BulkApRemoveRequest): Promise<string> {

  const sessionId = operationTracker.createSession('ap', 'remove', request.apSerialNumbers.length);
  
  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const serialNumber of request.apSerialNumbers) {
    const opId = operationTracker.addOperation(sessionId, 'ap', 'remove', serialNumber);
    operationIds.push(opId);
  }
  
  const semaphore = new Semaphore(request.options.maxConcurrent);

  const executeOperation = async (serialNumber: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      const result = await mcpClient.removeAp({
        venueId: request.venueId,
        apSerialNumber: serialNumber,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.apSerialNumbers.map((serialNumber, index) => executeOperation(serialNumber, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk AP remove:', err);
  });

  return sessionId;
}

/**
 * Bulk guest pass create operation
 */
export async function bulkCreateGuestPasses(request: BulkGuestPassCreateRequest): Promise<string> {

  // Generate guest pass names
  const guestPassNames = generateNames(
    request.namePrefix,
    '',
    request.count,
    request.startStep
  );

  // Create session
  const sessionId = operationTracker.createSession('guest_pass', 'create', guestPassNames.length);

  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const guestPassName of guestPassNames) {
    const opId = operationTracker.addOperation(sessionId, 'guest_pass', 'create', guestPassName);
    operationIds.push(opId);
  }

  // Create semaphore for concurrency control
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Track cancellation
  const session = operationTracker.getSession(sessionId);
  if (!session) {
    throw new Error('Failed to create session');
  }

  // Execute operations
  const executeOperation = async (guestPassName: string, operationId: string, index: number) => {
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

    try {
      await semaphore.acquire();

      // Capture request data
      const requestData = {
        networkId: request.networkId,
        name: guestPassName,
        expiration: request.expiration,
        maxDevices: request.maxDevices,
        deliveryMethods: request.deliveryMethods,
        mobilePhoneNumber: request.mobilePhoneNumber,
        email: request.email,
        notes: request.notes
      };

      // Update to running with request data
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date(),
        requestData
      });

      // Execute guest pass creation via MCP
      const result = await mcpClient.createGuestPass({
        networkId: request.networkId,
        name: guestPassName,
        expiration: request.expiration,
        maxDevices: request.maxDevices,
        deliveryMethods: request.deliveryMethods,
        mobilePhoneNumber: request.mobilePhoneNumber,
        email: request.email,
        notes: request.notes,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  // Execute all operations
  Promise.all(
    guestPassNames.map((guestPassName, index) => executeOperation(guestPassName, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk guest pass create:', err);
  });

  return sessionId;
}

/**
 * Bulk guest pass delete operation
 */
export async function bulkDeleteGuestPasses(request: BulkGuestPassDeleteRequest): Promise<string> {

  // Create session
  const sessionId = operationTracker.createSession('guest_pass', 'delete', request.guestPassIds.length);

  // Pre-create all operations as "queued"
  const operationIds: string[] = [];
  for (const guestPassId of request.guestPassIds) {
    const opId = operationTracker.addOperation(sessionId, 'guest_pass', 'delete', guestPassId);
    operationIds.push(opId);
  }

  // Create semaphore
  const semaphore = new Semaphore(request.options.maxConcurrent);

  // Execute operations
  const executeOperation = async (guestPassId: string, operationId: string, index: number) => {
    const currentSession = operationTracker.getSession(sessionId);
    if (currentSession?.status === 'cancelled') {
      return;
    }

    while (currentSession?.status === 'paused') {
      await delay(500);
    }

    try {
      await semaphore.acquire();

      if (index > 0 && request.options.delayMs > 0) {
        await delay(request.options.delayMs);
      }

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'running',
        startTime: new Date()
      });

      // Note: Delete functionality requires implementation in MCP client
      // For now, we'll call a placeholder that needs to be implemented
      const result = await mcpClient.deleteGuestPass({
        networkId: request.networkId,
        guestPassId: guestPassId,
        maxRetries: 5,
        pollIntervalMs: 2000
      });

      // Normalize and store response data
      const normalized = normalizeMcpResponse(result);
      operationTracker.updateOperation(sessionId, operationId, {
        status: 'success',
        endTime: new Date(),
        activityId: normalized.requestId,
        activityDetails: normalized.activityDetails
      });

    } catch (error: any) {
      // Extract clean error message
      const errorMessage = extractErrorMessage(error.message || String(error));

      // Parse error to get MCP response if available
      const mcpResponse = parseErrorToMcpResponse(error.message || String(error));
      const normalized = mcpResponse ? normalizeMcpResponse(mcpResponse) : null;

      operationTracker.updateOperation(sessionId, operationId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        activityId: normalized?.requestId,
        activityDetails: normalized?.activityDetails
      });
    } finally {
      semaphore.release();
    }
  };

  Promise.all(
    request.guestPassIds.map((guestPassId, index) => executeOperation(guestPassId, operationIds[index], index))
  ).catch(err => {
    console.error('[BulkOperationService] Error in bulk guest pass delete:', err);
  });

  return sessionId;
}
