/**
 * Shared types between backend and frontend
 */

export type OperationType = 'venue' | 'wlan' | 'ap' | 'guest_pass';
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

/**
 * WiFi Network data structure
 */
export interface WifiNetwork {
  id: string;
  name: string;
  ssid: string;
  type: 'psk' | 'enterprise' | 'open' | 'guest';
  nwSubType?: string; // Alternative field name used in list queries
  wlanSecurity?: string;
  portalServiceProfileId?: string;
  status?: string;
  vlanId?: number;
  venueApGroups?: Array<{
    venueId: string;
    venueName?: string;
    apGroupIds?: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Guest Pass Credential data structure
 */
export interface GuestPass {
  id: string;
  name: string;
  networkId: string;
  networkName?: string; // Network name for display purposes
  ssid?: string;
  password: string;
  expiration: {
    duration: number;
    unit: 'Hour' | 'Day' | 'Week' | 'Month';
    activationType: 'Creation' | 'FirstUse';
  };
  maxDevices: number;
  deliveryMethods: ('PRINT' | 'EMAIL' | 'SMS')[];
  mobilePhoneNumber?: string;
  email?: string;
  notes?: string;
  disabled?: boolean;
  createdDate?: number;
  lastModified?: number;
  expirationDate?: number;
  locale?: string;
  guestUserType?: string;
}

/**
 * Activity Details from RUCKUS API (normalized from MCP response)
 */
export interface ActivityDetails {
  id: string;
  status: 'SUCCESS' | 'FAIL' | 'INPROGRESS';
  endDatetime?: string;
  error?: {
    errors?: Array<{
      message: string;
      reason?: string;
      code?: string;
    }>;
  } | null;
  message?: string;
  steps?: Array<{
    id: string;
    description: string;
    status: string;
    error?: any;
    startDatetime?: string;
    endDatetime?: string;
  }>;
  [key: string]: any; // Allow other RUCKUS API fields
}

/**
 * Operation in a bulk operation session
 */
export interface Operation {
  id: string;
  type: OperationType;
  action: string; // e.g., 'create', 'delete', 'update', 'activate', 'deactivate'
  status: OperationStatus;
  itemName: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  error?: string; // Clean, human-readable error message
  activityId?: string; // RUCKUS API activity/request ID
  activityDetails?: ActivityDetails; // Full activity details from RUCKUS API (source of truth)
  requestData?: any; // The request payload sent to RUCKUS API
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
  ssidPrefix: string;
  count: number;
  startStep: number;
  type: 'psk' | 'guest';
  wlanSecurity: string;
  passphrase?: string;
  portalServiceProfileId?: string;
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

// Guest Pass-specific types
export interface BulkGuestPassCreateRequest {
  networkId: string;
  namePrefix: string;
  count: number;
  startStep: number;
  expiration: {
    duration: number;
    unit: 'Hour' | 'Day' | 'Week' | 'Month';
    activationType: 'Creation' | 'FirstUse';
  };
  maxDevices: number;
  deliveryMethods: ('PRINT' | 'EMAIL' | 'SMS')[];
  mobilePhoneNumber?: string;
  email?: string;
  notes?: string;
  options: BulkOperationOptions;
}

export interface BulkGuestPassDeleteRequest {
  networkId: string;
  guestPassIds: string[];
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
