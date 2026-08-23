/**
 * LicenseManager — SDK class for plugin license management.
 *
 * Provides methods to check license status, verify user access,
 * and manage org/user licenses. Works with the LMA (License Management
 * Application) backend.
 *
 * @example
 * ```ts
 * const licenseMgr = new LicenseManager(sdk);
 *
 * // Check if org has valid license
 * const orgLicense = await licenseMgr.checkOrgLicense('my-plugin');
 *
 * // Check if current user has access
 * const userAccess = await licenseMgr.checkUserLicense('my-plugin', userId);
 *
 * // Get all licenses for an org
 * const licenses = await licenseMgr.getOrgLicenses(orgId);
 * ```
 */

import type { BlueprinSDK } from '../core/sdk.js';
import type {
  OrgLicense,
  UserLicense,
  LicenseCheckResult,
  LicenseTier,
  OrgLicenseStatus,
} from '../types/index.js';

export interface LicenseManagerOptions {
  /** Base API URL (defaults to window.location.origin). */
  baseUrl?: string;
  /** Custom headers for API requests. */
  headers?: Record<string, string>;
}

export class LicenseManager {
  private sdk: BlueprinSDK;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(sdk: BlueprinSDK, options: LicenseManagerOptions = {}) {
    this.sdk = sdk;
    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
  }

  /**
   * Check if an org has a valid license for a plugin.
   *
   * @param pluginId - Plugin ID or slug to check.
   * @param orgId - Organization ID (optional, uses current org).
   * @returns License check result with status and tier info.
   */
  async checkOrgLicense(pluginId: string, orgId?: string): Promise<LicenseCheckResult> {
    try {
      const params = new URLSearchParams({ plugin_id: pluginId });
      if (orgId) params.set('org_id', orgId);

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/org?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) {
        return {
          valid: false,
          status: 'pending',
          tier: 'site-wide',
          reason: `HTTP ${response.status}`,
        };
      }

      const result = await response.json();
      return result.data || { valid: false, status: 'pending', tier: 'site-wide' };
    } catch (error) {
      return {
        valid: false,
        status: 'pending',
        tier: 'site-wide',
        reason: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Check if a specific user has access to a plugin.
   *
   * For site-wide licenses, all users automatically have access.
   * For per-user licenses, checks if the user is in the assigned list.
   *
   * @param pluginId - Plugin ID or slug to check.
   * @param userId - User ID to check.
   * @returns License check result with user-specific info.
   */
  async checkUserLicense(pluginId: string, userId: string): Promise<LicenseCheckResult> {
    try {
      const params = new URLSearchParams({
        plugin_id: pluginId,
        user_id: userId,
      });

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/users?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) {
        return {
          valid: false,
          status: 'pending',
          tier: 'per-user',
          reason: `HTTP ${response.status}`,
          userLicensed: false,
        };
      }

      const result = await response.json();
      return result.data || { valid: false, status: 'pending', tier: 'per-user', userLicensed: false };
    } catch (error) {
      return {
        valid: false,
        status: 'pending',
        tier: 'per-user',
        reason: error instanceof Error ? error.message : 'Network error',
        userLicensed: false,
      };
    }
  }

  /**
   * Get all org licenses for the current organization.
   *
   * @param orgId - Organization ID (optional, uses current org).
   * @returns Array of org licenses.
   */
  async getOrgLicenses(orgId?: string): Promise<OrgLicense[]> {
    try {
      const params = new URLSearchParams();
      if (orgId) params.set('org_id', orgId);

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/org?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) return [];

      const result = await response.json();
      return result.data?.licenses || [];
    } catch {
      return [];
    }
  }

  /**
   * Get all user licenses for a plugin in the current org.
   *
   * @param pluginId - Plugin ID to get user licenses for.
   * @param orgId - Organization ID (optional).
   * @returns Array of user licenses.
   */
  async getUserLicenses(pluginId: string, orgId?: string): Promise<UserLicense[]> {
    try {
      const params = new URLSearchParams({ plugin_id: pluginId });
      if (orgId) params.set('org_id', orgId);

      const response = await fetch(
        `${this.baseUrl}/api/plugins/lma/users?${params.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...this.headers,
          },
        }
      );

      if (!response.ok) return [];

      const result = await response.json();
      return result.data?.licenses || [];
    } catch {
      return [];
    }
  }

  /**
   * Assign a license to a user (admin only).
   *
   * @param pluginId - Plugin ID to assign.
   * @param userId - User ID to assign license to.
   * @param orgId - Organization ID (optional).
   * @returns Success status.
   */
  async assignUserLicense(pluginId: string, userId: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plugins/lma/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          user_id: userId,
          org_id: orgId,
          action: 'assign',
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
   * Revoke a license from a user (admin only).
   *
   * @param pluginId - Plugin ID to revoke.
   * @param userId - User ID to revoke license from.
   * @param orgId - Organization ID (optional).
   * @returns Success status.
   */
  async revokeUserLicense(pluginId: string, userId: string, orgId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plugins/lma/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          user_id: userId,
          org_id: orgId,
          action: 'revoke',
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
   * Update org license tier (admin only).
   *
   * @param pluginId - Plugin ID to update.
   * @param tier - New license tier.
   * @param maxSeats - Maximum seats (for per-user tier).
   * @param orgId - Organization ID (optional).
   * @returns Success status.
   */
  async updateOrgLicense(
    pluginId: string,
    tier: LicenseTier,
    maxSeats?: number,
    orgId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/plugins/lma/org`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
        },
        body: JSON.stringify({
          plugin_id: pluginId,
          tier,
          max_seats: maxSeats,
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
