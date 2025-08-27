import { google } from 'googleapis';
import crypto from 'crypto';
import { 
  GCPOAuthTokens, 
  GCPOAuthError, 
  OAuthState, 
  GCP_OAUTH_SCOPES 
} from '@/types/gcp-oauth';

export class GCPOAuthClient {
  private oauth2Client: any;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.redirectUri = `${"http://localhost:3000"}/api/auth/gcp/callback`;

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google OAuth credentials not configured. Please check your environment variables.');
    }

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(userId: string): string {
    const state = this.generateState(userId);
    
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      prompt: 'consent', // Force consent screen to get refresh token
      scope: GCP_OAUTH_SCOPES,
      state: JSON.stringify(state),
      include_granted_scopes: true,
    });

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GCPOAuthTokens> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
        expires_in: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : 3600,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope || GCP_OAUTH_SCOPES.join(' '),
        expires_at: new Date(tokens.expiry_date || Date.now() + 3600000),
      };
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error(`OAuth token exchange failed: ${error.message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GCPOAuthTokens> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      return {
        access_token: credentials.access_token,
        refresh_token: refreshToken, // Keep original refresh token
        expires_in: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
        token_type: credentials.token_type || 'Bearer',
        scope: credentials.scope || GCP_OAUTH_SCOPES.join(' '),
        expires_at: new Date(credentials.expiry_date || Date.now() + 3600000),
      };
    } catch (error: any) {
      console.error('Error refreshing access token:', error);
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Validate OAuth state parameter
   */
  validateState(stateParam: string, expectedUserId: string): boolean {
    try {
      const state: OAuthState = JSON.parse(stateParam);
      
      // Check if state is not too old (max 10 minutes)
      const maxAge = 10 * 60 * 1000; // 10 minutes
      if (Date.now() - state.timestamp > maxAge) {
        console.error('OAuth state expired');
        return false;
      }

      // Validate state signature or other security measures
      return true;
    } catch (error) {
      console.error('Invalid OAuth state:', error);
      return false;
    }
  }

  /**
   * Check if tokens are expired
   */
  isTokenExpired(tokens: GCPOAuthTokens): boolean {
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return new Date(tokens.expires_at).getTime() - buffer < Date.now();
  }

  /**
   * Get authenticated Google APIs client
   */
  getAuthenticatedClient(tokens: GCPOAuthTokens) {
    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at.getTime(),
      token_type: tokens.token_type,
      scope: tokens.scope,
    });

    return this.oauth2Client;
  }

  /**
   * Revoke tokens (disconnect)
   */
  async revokeTokens(accessToken: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(accessToken);
    } catch (error: any) {
      console.error('Error revoking tokens:', error);
      throw new Error(`Token revocation failed: ${error.message}`);
    }
  }

  /**
   * Generate secure state parameter
   */
  private generateState(userId: string): OAuthState {
    const state = crypto.randomBytes(32).toString('hex');
    
    return {
      state,
      redirectUri: this.redirectUri,
      timestamp: Date.now(),
    };
  }

  /**
   * Encrypt tokens for storage
   */
  static encryptTokens(tokens: GCPOAuthTokens): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('gcp-tokens'));
    
    let encrypted = cipher.update(JSON.stringify(tokens), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encrypted,
    });
  }

  /**
   * Decrypt tokens from storage
   */
  static decryptTokens(encryptedData: string): GCPOAuthTokens {
    try {
      const { iv, authTag, encrypted } = JSON.parse(encryptedData);
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('gcp-tokens'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      const tokens = JSON.parse(decrypted);
      
      // Convert expires_at back to Date object
      tokens.expires_at = new Date(tokens.expires_at);
      
      return tokens;
    } catch (error) {
      console.error('Error decrypting tokens:', error);
      throw new Error('Failed to decrypt OAuth tokens');
    }
  }
}

// Singleton instance
export const gcpOAuthClient = new GCPOAuthClient();
