import axios, { AxiosInstance } from 'axios';
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
  SessionResponse,
  ProgressResponse,
  OperationsResponse,
  BulkOperationSession,
  Venue,
  WifiNetwork,
  GuestPass,
  ApiLogEntry
} from '../../../shared/types';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Venue operations
  async bulkCreateVenues(request: BulkVenueCreateRequest): Promise<SessionResponse> {
    const response = await this.client.post('/venues/bulk-create', request);
    return response.data;
  }

  async bulkDeleteVenues(request: BulkVenueDeleteRequest): Promise<SessionResponse> {
    const response = await this.client.post('/venues/bulk-delete', request);
    return response.data;
  }

  // WLAN operations
  async bulkCreateWlans(request: BulkWlanCreateRequest): Promise<SessionResponse> {
    const response = await this.client.post('/wlans/bulk-create', request);
    return response.data;
  }

  async bulkActivateWlans(request: BulkWlanActivateRequest): Promise<SessionResponse> {
    const response = await this.client.post('/wlans/bulk-activate', request);
    return response.data;
  }

  async bulkDeactivateWlans(request: BulkWlanDeactivateRequest): Promise<SessionResponse> {
    const response = await this.client.post('/wlans/bulk-deactivate', request);
    return response.data;
  }

  async bulkDeleteWlans(request: BulkWlanDeleteRequest): Promise<SessionResponse> {
    const response = await this.client.post('/wlans/bulk-delete', request);
    return response.data;
  }

  // AP operations
  async bulkAddAps(request: BulkApAddRequest): Promise<SessionResponse> {
    const response = await this.client.post('/aps/bulk-add', request);
    return response.data;
  }

  async bulkMoveAps(request: BulkApMoveRequest): Promise<SessionResponse> {
    const response = await this.client.post('/aps/bulk-move', request);
    return response.data;
  }

  async bulkRemoveAps(request: BulkApRemoveRequest): Promise<SessionResponse> {
    const response = await this.client.post('/aps/bulk-remove', request);
    return response.data;
  }

  // Guest Pass operations
  async bulkCreateGuestPasses(request: BulkGuestPassCreateRequest): Promise<SessionResponse> {
    const response = await this.client.post('/guest-passes/bulk-create', request);
    return response.data;
  }

  async bulkDeleteGuestPasses(request: BulkGuestPassDeleteRequest): Promise<SessionResponse> {
    const response = await this.client.post('/guest-passes/bulk-delete', request);
    return response.data;
  }

  // Session management
  async getAllSessions(): Promise<{ success: boolean; data: BulkOperationSession[] }> {
    const response = await this.client.get('/sessions');
    return response.data;
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const response = await this.client.get(`/sessions/${sessionId}`);
    return response.data;
  }

  async getSessionProgress(sessionId: string): Promise<ProgressResponse> {
    const response = await this.client.get(`/sessions/${sessionId}/progress`);
    return response.data;
  }

  async getSessionOperations(sessionId: string): Promise<OperationsResponse> {
    const response = await this.client.get(`/sessions/${sessionId}/operations`);
    return response.data;
  }

  async pauseSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/sessions/${sessionId}/pause`);
    return response.data;
  }

  async resumeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/sessions/${sessionId}/resume`);
    return response.data;
  }

  async cancelSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/sessions/${sessionId}/cancel`);
    return response.data;
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/sessions/${sessionId}`);
    return response.data;
  }

  // Venues operations
  async getVenues(): Promise<Venue[]> {
    const response = await this.client.get('/venues');
    return response.data.data?.data || [];
  }

  // WLAN operations
  async getWlans(): Promise<WifiNetwork[]> {
    const response = await this.client.get('/wlans');
    return response.data.data?.data || [];
  }

  async getPortalProfiles(): Promise<any[]> {
    const response = await this.client.get('/wlans/portal-profiles');
    return response.data.data?.content || [];
  }

  // AP operations
  async getAps(params?: { venueId?: string; searchString?: string }): Promise<any> {
    const response = await this.client.get('/aps', { params });
    return response.data.data || { data: [], total: 0 };
  }

  async getApGroups(venueId?: string): Promise<any> {
    const params = venueId ? { venueId } : {};
    const response = await this.client.get('/aps/ap-groups', { params });
    return response.data.data || { data: [], total: 0 };
  }

  // Guest Pass operations
  async getGuestPasses(networkId?: string): Promise<GuestPass[]> {
    const params = networkId ? { networkId } : {};
    const response = await this.client.get('/guest-passes', { params });
    return response.data.data?.data || [];
  }

  // API logs operations
  async getApiLogs(status?: 'success' | 'error', limit?: number): Promise<ApiLogEntry[]> {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    
    const response = await this.client.get('/logs', { params });
    return response.data.data || [];
  }

  async getApiLogStats(): Promise<{ total: number; success: number; error: number; averageDuration: number }> {
    const response = await this.client.get('/logs/stats');
    return response.data.data;
  }

  async clearApiLogs(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete('/logs');
    return response.data;
  }
}

export const apiService = new ApiService();
