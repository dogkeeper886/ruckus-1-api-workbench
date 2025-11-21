/**
 * Shared types between backend and frontend
 */
export type OperationType = 'venue' | 'wlan' | 'ap';
export type OperationStatus = 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
export interface Operation {
    id: string;
    type: OperationType;
    action: string;
    status: OperationStatus;
    itemName: string;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    result?: any;
    error?: string;
    activityId?: string;
    requestData?: any;
    responseData?: any;
}
export interface BulkOperationRequest {
    type: OperationType;
    action: string;
    items: any[];
    options: BulkOperationOptions;
}
export interface BulkOperationOptions {
    maxConcurrent: number;
    delayMs: number;
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
    progress: number;
}
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
        scheduler: {
            type: string;
        };
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
export interface BulkApAddRequest {
    namePrefix: string;
    nameSuffix: string;
    serialPrefix: string;
    serialSuffix: string;
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
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface SessionResponse extends ApiResponse<BulkOperationSession> {
}
export interface ProgressResponse extends ApiResponse<BulkOperationProgress> {
}
export interface OperationsResponse extends ApiResponse<Operation[]> {
}
//# sourceMappingURL=types.d.ts.map