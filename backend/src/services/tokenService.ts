import { mcpClient } from './mcpClientService';
import { tokenCache } from '../utils/tokenCache';

export class TokenService {
  private tenantId: string;
  private clientId: string;

  constructor() {
    this.tenantId = process.env.RUCKUS_TENANT_ID!;
    this.clientId = process.env.RUCKUS_CLIENT_ID!;
  }

  async getValidToken(): Promise<string> {
    try {
      // Try cache first
      const cachedToken = tokenCache.getToken(this.tenantId, this.clientId);
      if (cachedToken) {
        console.log('[TokenService] Using cached token');
        return cachedToken;
      }

      // Fetch new token via MCP client
      console.log('[TokenService] Fetching new token via MCP');
      const tokenResponse = await mcpClient.getAuthToken();

      // Extract token from response
      const accessToken = tokenResponse.token;
      if (!accessToken) {
        throw new Error('No token in MCP response');
      }

      // Cache it (default 1 hour expiry)
      tokenCache.setToken(this.tenantId, this.clientId, {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600
      });

      return accessToken;
    } catch (error) {
      // If token fetch fails, clear any cached token
      tokenCache.invalidateToken(this.tenantId, this.clientId);
      throw error;
    }
  }

  invalidateToken(): void {
    tokenCache.invalidateToken(this.tenantId, this.clientId);
  }

  clearAllTokens(): void {
    tokenCache.clear();
  }

  getTokenStats(): { totalTokens: number; keys: string[] } {
    return tokenCache.getStats();
  }
}

// Singleton instance
export const tokenService = new TokenService();

