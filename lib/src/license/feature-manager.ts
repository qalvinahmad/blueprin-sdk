/**
 * FeatureManager — SDK class for plugin feature entitlement checks.
 *
 * Provides methods to check feature access based on license tier,
 * list available features, and verify external connector auth.
 *
 * Similar to Salesforce's System.FeatureManagement.checkPackageBooleanValue().
 *
 * @example
 * ```ts
 * const featureMgr = new FeatureManager(sdk);
 *
 * // Check if a feature is available
 * const hasAccess = await featureMgr.checkFeature('my-plugin', 'advanced_reporting');
 *
 * // List all features for a plugin
 * const features = await featureMgr.listFeatures('my-plugin');
 *
 * // Check external connector auth
 * const hasAuth = await featureMgr.checkExternalAuth('my-plugin', 'erp_connector');
 * ```
 */

import type { BlueprinSDK } from '../core/sdk.js';
import type {
  FeatureEntitlement,
  PluginFeature,
  FeatureCheckResult,
  ExternalConnectorAuth,
} from '../types/index.js';

export interface FeatureManagerOptions {
  /** Base API URL (defaults to window.location.origin). */
  baseUrl?: string;
  /** Custom headers for API requests. */
  headers?: Record<string, string>;
}

export class FeatureManager {
  private sdk: BlueprinSDK;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(sdk: BlueprinSDK, options: FeatureManagerOptions = {}) {
    this.sdk = sdk;
    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
  }

  /**
   * Check if a feature is available for the current org/user.
   *
   * This is the primary method plugins should use to gate features.
   * It checks both the org license tier and user license status.
   *
   * @param pluginId - Plugin ID to check features for.
   * @param featureKey - Feature key to check (e.g., 'advanced_reporting').
   * @param userId - User ID to check (optional, for per-user tier).
   * @returns Feature check result with availability info.
   */
  async checkFeature(
    pluginId: string,
    featureKey: string,
    userId?: string
  ): Promise<FeatureCheckResult> {
    try {
      const params = new URLSearchParams({
        plugin_id: pluginId,
        feature_key: featureKey,
      });
      if (userId) params.set('user_id', userId);

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/features?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) {
        return {
          available: false,
          featureKey,
          requiredTier: 'premium',
          orgTier: 'free',
          reason: `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return result.data || { available: false, featureKey, requiredTier: 'premium', orgTier: 'free' };
    } catch (error) {
      return {
        available: false,
        featureKey,
        requiredTier: 'premium',
        orgTier: 'free',
        reason: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Check multiple features at once (batch check).
   *
   * @param pluginId - Plugin ID to check features for.
   * @param featureKeys - Array of feature keys to check.
   * @param userId - User ID to check (optional).
   * @returns Map of feature key to check result.
   */
  async checkFeatures(
    pluginId: string,
    featureKeys: string[],
    userId?: string
  ): Promise<Map<string, FeatureCheckResult>> {
    const results = new Map<string, FeatureCheckResult>();

    // Check all features in parallel
    const checks = await Promise.all(
      featureKeys.map((key) => this.checkFeature(pluginId, key, userId))
    );

    featureKeys.forEach((key, index) => {
      results.set(key, checks[index]);
    });

    return results;
  }

  /**
   * List all features defined by a plugin.
   *
   * @param pluginId - Plugin ID to list features for.
   * @returns Array of plugin features.
   */
  async listFeatures(pluginId: string): Promise<PluginFeature[]> {
    try {
      const params = new URLSearchParams({ plugin_id: pluginId });

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/features?${params.toString()}&action=list`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) return [];

      const result = await response.json();
      return result.data?.features || [];
    } catch {
      return [];
    }
  }

  /**
   * Get all entitlements for a plugin (admin only).
   *
   * @param pluginId - Plugin ID to get entitlements for.
   * @returns Array of feature entitlements.
   */
  async getEntitlements(pluginId: string): Promise<FeatureEntitlement[]> {
    try {
      const params = new URLSearchParams({ plugin_id: pluginId });

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/features?${params.toString()}&action=entitlements`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) return [];

      const result = await response.json();
      return result.data?.entitlements || [];
    } catch {
      return [];
    }
  }

  /**
   * Update feature entitlement (admin only).
   *
   * @param pluginId - Plugin ID.
   * @param featureKey - Feature key to update.
   * @param tier - Minimum tier required.
   * @param enabled - Whether the feature is enabled.
   * @returns Success status.
   */
  async updateEntitlement(
    pluginId: string,
    featureKey: string,
    tier: 'free' | 'premium' | 'enterprise',
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plugins/lma/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          feature_key: featureKey,
          tier,
          enabled,
        }),
      });

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Check if external connector auth is configured for a plugin.
   *
   * @param pluginId - Plugin ID to check.
   * @param connectorType - Connector type (e.g., 'erp', 'ai').
   * @param orgId - Organization ID (optional).
   * @returns External auth check result.
   */
  async checkExternalAuth(
    pluginId: string,
    connectorType: string,
    orgId?: string
  ): Promise<{ configured: boolean; status: string; auth?: ExternalConnectorAuth }> {
    try {
      const params = new URLSearchParams({
        plugin_id: pluginId,
        connector_type: connectorType,
      });
      if (orgId) params.set('org_id', orgId);

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/external-auth?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) {
        return { configured: false, status: 'error' };
      }

      const result = await response.json();
      return result.data || { configured: false, status: 'none' };
    } catch {
      return { configured: false, status: 'error' };
    }
  }

  /**
   * Save external connector auth credentials (admin only).
   *
   * Credentials are encrypted before storage.
   *
   * @param pluginId - Plugin ID.
   * @param connectorType - Connector type.
   * @param displayName - Display name for this connection.
   * @param credentials - Plain text credentials (will be encrypted).
   * @param refreshToken - OAuth refresh token (optional).
   * @param orgId - Organization ID (optional).
   * @returns Success status.
   */
  async saveExternalAuth(
    pluginId: string,
    connectorType: string,
    displayName: string,
    credentials: string,
    refreshToken?: string,
    orgId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plugins/lma/external-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          connector_type: connectorType,
          display_name: displayName,
          credentials,
          refresh_token: refreshToken,
          org_id: orgId,
        }),
      });

      const result = await response.json();
      return { success: result.success, error: result.error };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }
}
