import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { apiLogTracker } from '../models/apiLogTracker';

/**
 * MCP Client Service
 * Manages communication with the RUCKUS1 MCP server using the official MCP SDK
 */
class MCPClientService {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private isInitialized: boolean = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Start the MCP server and initialize connection
   */
  async start(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._start();
    return this.initPromise;
  }

  private async _start(): Promise<void> {
    if (this.client) {
      console.log('[MCP Client] Client already running');
      return;
    }

    console.log('[MCP Client] Starting MCP client...');

    // Create MCP Client
    this.client = new Client(
      {
        name: 'ruckus-backend',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Create StdioClientTransport with absolute path
    const projectRoot = path.resolve(__dirname, '../../../');
    const mcpServerPath = path.join(projectRoot, 'ruckus1-mcp/src/mcpServer.ts');
    
    console.log('[MCP Client] Project root:', projectRoot);
    console.log('[MCP Client] MCP server path:', mcpServerPath);
    console.log('[MCP Client] Command: npx ts-node', mcpServerPath);
    console.log('[MCP Client] Environment:');
    console.log('  - RUCKUS_TENANT_ID:', process.env.RUCKUS_TENANT_ID ? '✓ Set' : '✗ Not set');
    console.log('  - RUCKUS_CLIENT_ID:', process.env.RUCKUS_CLIENT_ID ? '✓ Set' : '✗ Not set');
    console.log('  - RUCKUS_CLIENT_SECRET:', process.env.RUCKUS_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
    console.log('  - RUCKUS_REGION:', process.env.RUCKUS_REGION || 'global (default)');

    this.transport = new StdioClientTransport({
      command: 'npx',
      args: ['ts-node', mcpServerPath],
      env: {
        ...process.env,
        RUCKUS_TENANT_ID: process.env.RUCKUS_TENANT_ID || '',
        RUCKUS_CLIENT_ID: process.env.RUCKUS_CLIENT_ID || '',
        RUCKUS_CLIENT_SECRET: process.env.RUCKUS_CLIENT_SECRET || '',
        RUCKUS_REGION: process.env.RUCKUS_REGION || 'global',
      },
      stderr: 'inherit', // Show MCP server logs
    });

    // Add transport event handlers for debugging
    console.log('[MCP Client] Setting up transport event handlers...');
    
    // Note: StdioClientTransport may not expose all events directly
    // We'll add what we can and add timing information
    
    const startTime = Date.now();
    
    // Add delay to ensure server process is ready
    console.log('[MCP Client] Waiting for MCP server to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('[MCP Client] Connecting to MCP server...');
    const connectStartTime = Date.now();
    
    // Connect client to transport (handles initialization automatically)
    await this.client.connect(this.transport);
    
    const connectEndTime = Date.now();
    console.log(`[MCP Client] Connection established in ${connectEndTime - connectStartTime}ms`);
    console.log(`[MCP Client] Total startup time: ${connectEndTime - startTime}ms`);

    this.isInitialized = true;
    console.log('[MCP Client] Client connected and ready ✓');
  }

  /**
   * Call an MCP tool
   */
  private async callTool(toolName: string, args: any = {}): Promise<any> {
    if (!this.isInitialized) {
      await this.start();
    }

    if (!this.client) {
      throw new Error('MCP client not initialized');
    }

    console.log(`[MCP Client] Calling tool: ${toolName}`);
    console.log(`[MCP Client] Arguments:`, JSON.stringify(args, null, 2));

    const callStartTime = Date.now();
    
    try {
      const response = await this.client.callTool({
        name: toolName,
        arguments: args,
      });
      const callEndTime = Date.now();
      const duration = callEndTime - callStartTime;

      console.log(`[MCP Client] Response received for ${toolName} in ${duration}ms`);
      console.log(`[MCP Client] Is error:`, response.isError);
      console.log(`[MCP Client] Content type:`, typeof response.content);
      console.log(`[MCP Client] Content array length:`, Array.isArray(response.content) ? response.content.length : 'not an array');
      
      // Log full response structure for debugging
      console.log(`[MCP Client] Full response structure:`, JSON.stringify(response, null, 2).substring(0, 500));

      if (response.isError) {
        const content = response.content as any;
        const errorText = content?.[0]?.text || 'Unknown error';
        console.error(`[MCP Client] Tool ${toolName} failed:`, errorText);
        
        // Log error to tracker
        apiLogTracker.addLog({
          timestamp: new Date(),
          toolName,
          requestData: args,
          responseData: response,
          duration,
          status: 'error',
          errorMessage: errorText,
        });
        
        throw new Error(`Tool ${toolName} error: ${errorText}`);
      }

      // Parse the text content (it's JSON string)
      const content = response.content as any;
      const textContent = content?.[0]?.text;
      console.log(`[MCP Client] Raw response text length:`, textContent?.length || 0);
      console.log(`[MCP Client] Raw response text preview:`, textContent?.substring(0, 200));
      
      if (!textContent) {
        console.log(`[MCP Client] WARNING: No text content in response`);
        console.log(`[MCP Client] Content object:`, JSON.stringify(content));
        
        // Log warning to tracker
        apiLogTracker.addLog({
          timestamp: new Date(),
          toolName,
          requestData: args,
          responseData: response,
          duration,
          status: 'error',
          errorMessage: 'No text content in response',
        });
        
        return null;
      }

      let parsed;
      try {
        parsed = JSON.parse(textContent);
        console.log(`[MCP Client] Successfully parsed JSON response`);
      } catch (e) {
        // If not JSON, return as-is
        console.log(`[MCP Client] Response is not JSON, returning as-is`);
        parsed = textContent;
      }
      
      // Log success to tracker
      apiLogTracker.addLog({
        timestamp: new Date(),
        toolName,
        requestData: args,
        responseData: parsed,
        duration,
        status: 'success',
      });
      
      return parsed;
    } catch (error: any) {
      const duration = Date.now() - callStartTime;
      
      // Log error to tracker
      apiLogTracker.addLog({
        timestamp: new Date(),
        toolName,
        requestData: args,
        responseData: null,
        duration,
        status: 'error',
        errorMessage: error.message || 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Stop the MCP client
   */
  async stop(): Promise<void> {
    console.log('[MCP Client] Stopping MCP client...');

    if (this.transport) {
      await this.transport.close();
    }

    this.cleanup();
  }

  private cleanup(): void {
    this.client = null;
    this.transport = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  // ============================================================================
  // Tool Methods - Authentication
  // ============================================================================

  async getAuthToken(): Promise<any> {
    return this.callTool('get_ruckus_auth_token');
  }

  // ============================================================================
  // Tool Methods - Venues
  // ============================================================================

  async getVenues(): Promise<any> {
    return this.callTool('get_ruckus_venues');
  }

  async createVenue(params: {
    name: string;
    addressLine: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('create_ruckus_venue', params);
  }

  async updateVenue(params: {
    venueId: string;
    name: string;
    addressLine: string;
    city: string;
    country: string;
    description?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_ruckus_venue', params);
  }

  async deleteVenue(params: {
    venueId: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('delete_ruckus_venue', params);
  }

  async getActivityDetails(activityId: string): Promise<any> {
    return this.callTool('get_ruckus_activity_details', { activityId });
  }

  // ============================================================================
  // Tool Methods - AP Groups
  // ============================================================================

  async getApGroups(params?: {
    filters?: any;
    fields?: string[];
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    return this.callTool('get_ruckus_ap_groups', params || {});
  }

  async createApGroup(params: {
    venueId: string;
    name: string;
    description?: string;
    apSerialNumbers?: Array<{ serialNumber: string }>;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('create_ruckus_ap_group', params);
  }

  async updateApGroup(params: {
    venueId: string;
    apGroupId: string;
    name: string;
    description?: string;
    apSerialNumbers?: Array<{ serialNumber: string }>;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_ruckus_ap_group', params);
  }

  async deleteApGroup(params: {
    venueId: string;
    apGroupId: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('delete_ruckus_ap_group', params);
  }

  // ============================================================================
  // Tool Methods - Access Points
  // ============================================================================

  async getAps(params?: {
    venueId?: string;
    searchString?: string;
    searchTargetFields?: string[];
    fields?: string[];
    page?: number;
    pageSize?: number;
    mesh?: boolean;
  }): Promise<any> {
    return this.callTool('get_ruckus_aps', params || {});
  }

  async addApToGroup(params: {
    venueId: string;
    apGroupId: string;
    name: string;
    serialNumber: string;
    description?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('add_ap_to_group', params);
  }

  async removeAp(params: {
    venueId: string;
    apSerialNumber: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('remove_ap', params);
  }

  async updateAp(params: {
    apSerialNumber: string;
    apName?: string;
    venueId?: string;
    apGroupId?: string;
    description?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_ruckus_ap', params);
  }

  // ============================================================================
  // Tool Methods - WiFi Networks (WLANs)
  // ============================================================================

  async queryWifiNetworks(params?: {
    filters?: any;
    fields?: string[];
    searchString?: string;
    searchTargetFields?: string[];
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  }): Promise<any> {
    return this.callTool('query_wifi_networks', params || {});
  }

  async getWifiNetwork(networkId: string): Promise<any> {
    return this.callTool('get_wifi_network', { networkId });
  }

  async createWifiNetwork(params: {
    name: string;
    ssid: string;
    type: 'psk' | 'enterprise' | 'open' | 'guest';
    passphrase?: string;
    wlanSecurity: 'WPA2Personal' | 'WPA3Personal' | 'WPA2Enterprise' | 'WPA3Enterprise' | 'Open' | 'None';
    guestPortal?: any;
    portalServiceProfileId?: string;
    vlanId?: number;
    managementFrameProtection?: 'Disabled' | 'Capable' | 'Required';
    maxClientsOnWlanPerRadio?: number;
    enableBandBalancing?: boolean;
    clientIsolation?: boolean;
    hideSsid?: boolean;
    enableFastRoaming?: boolean;
    mobilityDomainId?: number;
    wifi6Enabled?: boolean;
    wifi7Enabled?: boolean;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('create_wifi_network', params);
  }

  async activateWifiNetworkAtVenues(params: {
    networkId: string;
    venueConfigs: Array<{
      venueId: string;
      isAllApGroups: boolean;
      apGroups?: string[];
      allApGroupsRadio: 'Both' | '2.4GHz' | '5GHz' | '6GHz';
      allApGroupsRadioTypes: string[];
      scheduler: {
        type: 'ALWAYS_ON' | 'SCHEDULED';
      };
    }>;
    portalServiceProfileId?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('activate_wifi_network_at_venues', params);
  }

  async deactivateWifiNetworkAtVenues(params: {
    networkId: string;
    venueIds: string[];
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('deactivate_wifi_network_at_venues', params);
  }

  async deleteWifiNetwork(params: {
    networkId: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('delete_wifi_network', params);
  }

  async createGuestPass(params: {
    networkId: string;
    name: string;
    expiration: {
      duration: number;
      unit: 'Hour' | 'Day' | 'Week' | 'Month';
      activationType: 'Creation' | 'FirstUse';
    };
    maxDevices: number;
    deliveryMethods: Array<'PRINT' | 'EMAIL' | 'SMS'>;
    mobilePhoneNumber?: string;
    email?: string;
    notes?: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('create_guest_pass', params);
  }

  async updateWifiNetwork(params: {
    networkId: string;
    networkConfig: any;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_wifi_network', params);
  }

  async updateWifiNetworkPortalServiceProfile(params: {
    networkId: string;
    profileId: string;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_wifi_network_portal_service_profile', params);
  }

  async updateWifiNetworkRadiusServerProfileSettings(params: {
    networkId: string;
    enableAccountingProxy?: boolean;
    enableAuthProxy?: boolean;
    maxRetries?: number;
    pollIntervalMs?: number;
  }): Promise<any> {
    return this.callTool('update_wifi_network_radius_server_profile_settings', params);
  }
}

// Singleton instance
export const mcpClient = new MCPClientService();
