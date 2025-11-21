import { AuthTokenResponse } from '../types/ruckusApi';

interface CachedToken {
  token: string;
  expiresAt: number;
  tokenType: string;
}

export class TokenCache {
  private cache = new Map<string, CachedToken>();
  private readonly EXPIRY_BUFFER_MS = 60000; // 1 minute buffer before actual expiry

  private getCacheKey(tenantId: string, clientId: string): string {
    return `${tenantId}:${clientId}`;
  }

  getToken(tenantId: string, clientId: string): string | null {
    const key = this.getCacheKey(tenantId, clientId);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if token is expired (with buffer)
    if (Date.now() >= cached.expiresAt - this.EXPIRY_BUFFER_MS) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.token;
  }

  setToken(
    tenantId: string, 
    clientId: string, 
    tokenResponse: AuthTokenResponse
  ): void {
    const key = this.getCacheKey(tenantId, clientId);
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    
    this.cache.set(key, {
      token: tokenResponse.access_token,
      expiresAt,
      tokenType: tokenResponse.token_type
    });
  }

  invalidateToken(tenantId: string, clientId: string): void {
    const key = this.getCacheKey(tenantId, clientId);
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { totalTokens: number; keys: string[] } {
    return {
      totalTokens: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global token cache instance
export const tokenCache = new TokenCache();