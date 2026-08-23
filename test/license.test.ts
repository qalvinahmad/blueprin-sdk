import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LicenseManager, FeatureManager } from '../lib/src/license/index.ts';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';

describe('LicenseManager and FeatureManager (LMA)', () => {
  let sdk: BlueprinSDK;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    sdk = new BlueprinSDK({ appId: 'test-app' });
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('LicenseManager', () => {
    it('checks org license successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            tier: 'enterprise',
            status: 'active',
            allocatedSeats: 100,
            assignedSeats: 25,
            expiresAt: '2027-01-01T00:00:00Z',
          },
        }),
      });

      const lm = new LicenseManager(sdk, { baseUrl: 'https://api.blueprin.id' });
      const result = await lm.checkOrgLicense('plugin-pro', 'org-123');

      expect(result.valid).toBe(true);
      expect(result.tier).toBe('enterprise');
      expect(result.status).toBe('active');
      expect(result.assignedSeats).toBe(25);
    });

    it('handles org license check failure gracefully', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const lm = new LicenseManager(sdk);
      const result = await lm.checkOrgLicense('plugin-pro');

      expect(result.valid).toBe(false);
      expect(result.status).toBe('pending');
      expect(result.reason).toContain('Network error');
    });

    it('checks user license successfully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            valid: true,
            status: 'active',
            tier: 'per-user',
            userLicensed: true,
          },
        }),
      });

      const lm = new LicenseManager(sdk);
      const result = await lm.checkUserLicense('plugin-pro', 'user-456');

      expect(result.valid).toBe(true);
      expect(result.userLicensed).toBe(true);
    });

    it('manages org licenses and user assignments', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            licenses: [{ id: 'lic-1', pluginId: 'plugin-pro' }],
          },
        }),
      });

      const lm = new LicenseManager(sdk);
      const orgLicenses = await lm.getOrgLicenses('org-123');
      const userLicenses = await lm.getUserLicenses('plugin-pro', 'org-123');
      const assignRes = await lm.assignUserLicense('plugin-pro', 'user-1', 'org-123');
      const revokeRes = await lm.revokeUserLicense('plugin-pro', 'user-1', 'org-123');

      expect(orgLicenses.length).toBe(1);
      expect(userLicenses.length).toBe(1);
      expect(assignRes.success).toBe(true);
      expect(revokeRes.success).toBe(true);
      expect(globalThis.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('FeatureManager', () => {
    it('checks feature availability and requirements', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            available: true,
            featureKey: 'advanced_reports',
            requiredTier: 'enterprise',
            orgTier: 'enterprise',
          },
        }),
      });

      const fm = new FeatureManager(sdk, { baseUrl: 'https://api.blueprin.id' });
      const res = await fm.checkFeature('plugin-pro', 'advanced_reports', 'user-1');

      expect(res.available).toBe(true);
      expect(res.featureKey).toBe('advanced_reports');
    });

    it('checks multiple features (batch check)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            available: true,
            featureKey: 'feat1',
            requiredTier: 'free',
            orgTier: 'free',
          },
        }),
      });

      const fm = new FeatureManager(sdk);
      const map = await fm.checkFeatures('plugin-pro', ['feat1', 'feat2']);

      expect(map.size).toBe(2);
      expect(map.get('feat1')?.available).toBe(true);
    });

    it('handles feature check errors gracefully', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const fm = new FeatureManager(sdk);
      const res = await fm.checkFeature('plugin-pro', 'unknown_feat');

      expect(res.available).toBe(false);
      expect(res.reason).toContain('HTTP 404');
    });

    it('lists features, entitlements, and manages external auth', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            features: [{ key: 'export_bim', name: 'BIM Export', requiredTier: 'enterprise' }],
            entitlements: [{ featureKey: 'export_bim', minTier: 'enterprise', enabled: true }],
            configured: true,
            status: 'active',
            authType: 'oauth2',
          },
        }),
      });

      const fm = new FeatureManager(sdk);
      const features = await fm.listFeatures('plugin-pro');
      const entitlements = await fm.getEntitlements('plugin-pro');
      const updateRes = await fm.updateEntitlement('plugin-pro', 'export_bim', 'enterprise', true);
      const auth = await fm.checkExternalAuth('plugin-pro', 'connector-autodesk', 'org-1');
      const setAuthRes = await fm.saveExternalAuth('plugin-pro', 'connector-autodesk', 'Autodesk APS', 'token123', 'ref123', 'org-1');

      expect(features.length).toBe(1);
      expect(entitlements.length).toBe(1);
      expect(auth.configured).toBe(true);
      expect(updateRes.success).toBe(true);
      expect(setAuthRes.success).toBe(true);
    });
  });
});
