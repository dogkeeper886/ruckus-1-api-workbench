/**
 * Shared types between backend and frontend
 */

export type OperationType = 'venue' | 'wlan' | 'ap';
export type OperationStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';

/**
 * API Log Entry - tracks MCP tool calls
 */
export interface ApiLogEntry {
  id: string;
  timestamp: Date;
  toolName: string;
  requestData: any;
  responseData: any;
  duration: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

/**
 * Venue data structure
 */
export interface Venue {
  id: string;
  name: string;
  addressLine?: string;
  city?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Access Point data structure
 */
export interface AccessPoint {
  serialNumber: string;
  name: string;
  venueId: string;
  venueName?: string;
  apGroupId: string;
  apGroupName?: string;
  status: string;
  model?: string;
  macAddress?: string;
}

export interface Operation {
  id: string;
  type: OperationType;
  action: string; // e.g., 'create', 'delete', 'update', 'activate', 'deactivate'
  status: OperationStatus;
  itemName: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  result?: any;
  error?: string;
  activityId?: string; // RUCKUS API activity/request ID
  requestData?: any; // The request payload sent to RUCKUS API
  responseData?: any; // The response received from RUCKUS API
}

export interface BulkOperationRequest {
  type: OperationType;
  action: string;
  items: any[];
  options: BulkOperationOptions;
}

export interface BulkOperationOptions {
  maxConcurrent: number; // 1-20
  delayMs: number; // 0-10000
  dryRun?: boolean;
}

export interface BulkOperationSession {
  sessionId: string;
  type: OperationType;
  action: string;
  status: 'running' | 'paused' | 'completed' | 'cancelled';
  operations: Operation[];
  startTime: Date;
  endTime?: Date;
  totalCount: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
}

export interface BulkOperationProgress {
  sessionId: string;
  totalCount: number;
  completedCount: number;
  successCount: number;
  failureCount: number;
  cancelledCount: number;
  runningCount: number;
  queuedCount: number;
  progress: number; // 0-100
}

// Venue-specific types
export interface BulkVenueCreateRequest {
  prefix: string;
  suffix: string;
  count: number;
  startStep: number;
  addressLine: string;
  city: string;
  country: string;
  timezone?: string;
  options: BulkOperationOptions;
}

export interface BulkVenueDeleteRequest {
  venueIds: string[];
  options: BulkOperationOptions;
}

// WLAN-specific types
export interface BulkWlanCreateRequest {
  namePrefix: string;
  nameSuffix: string;
  ssidPrefix: string;
  ssidSuffix: string;
  count: number;
  startStep: number;
  type: 'psk' | 'enterprise' | 'open' | 'guest';
  wlanSecurity: string;
  passphrase?: string;
  portalServiceProfileId?: string;
  vlanId?: number;
  options: BulkOperationOptions;
}

export interface BulkWlanActivateRequest {
  networkIds: string[];
  venueConfigs: Array<{
    venueId: string;
    isAllApGroups: boolean;
    apGroups?: string[];
    allApGroupsRadio: string;
    allApGroupsRadioTypes: string[];
    scheduler: { type: string };
  }>;
  portalServiceProfileId?: string;
  options: BulkOperationOptions;
}

export interface BulkWlanDeactivateRequest {
  networkIds: string[];
  venueIds: string[];
  options: BulkOperationOptions;
}

export interface BulkWlanDeleteRequest {
  networkIds: string[];
  options: BulkOperationOptions;
}

// AP-specific types
export interface BulkApAddRequest {
  namePrefix: string;
  nameSuffix: string;
  startSerialNumber: string;
  count: number;
  startStep: number;
  venueId: string;
  apGroupId: string;
  description?: string;
  options: BulkOperationOptions;
}

export interface BulkApMoveRequest {
  apSerialNumbers: string[];
  targetVenueId?: string;
  targetApGroupId?: string;
  options: BulkOperationOptions;
}

export interface BulkApRemoveRequest {
  apSerialNumbers: string[];
  venueId: string;
  options: BulkOperationOptions;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SessionResponse extends ApiResponse<BulkOperationSession> {}
export interface ProgressResponse extends ApiResponse<BulkOperationProgress> {}
export interface OperationsResponse extends ApiResponse<Operation[]> {}
