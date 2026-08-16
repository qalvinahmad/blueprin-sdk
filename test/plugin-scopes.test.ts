import { describe, it, expect } from 'vitest';
import {
  PLUGIN_SCOPES,
  hasScope,
  hasAllScopes,
  missingScopes,
  validateManifestScopes,
  getScopeGroups,
} from '../lib/src/core/plugin-scopes.ts';

describe('PluginScopes management', () => {
  it('checks single scope with hasScope', () => {
    expect(hasScope(null, 'read:projects')).toBe(false);
    expect(hasScope(['read:projects', 'read:materials'], 'read:projects')).toBe(true);
    expect(hasScope(['read:projects'], 'write:projects')).toBe(false);
    expect(hasScope(['*'], 'write:projects')).toBe(true);
    expect(hasScope(['*'], 'billing:checkout')).toBe(true);
  });

  it('checks all scopes with hasAllScopes', () => {
    const granted = ['read:projects', 'read:materials', 'read:ahs'];
    expect(hasAllScopes(granted, ['read:projects', 'read:ahs'])).toBe(true);
    expect(hasAllScopes(granted, ['read:projects', 'write:projects'])).toBe(false);
  });

  it('identifies missing scopes with missingScopes', () => {
    const granted = ['read:projects'];
    const required = ['read:projects', 'write:projects', 'billing:read'];
    expect(missingScopes(granted, required)).toEqual(['write:projects', 'billing:read']);
  });

  it('validates plugin manifest permissions / scopes', () => {
    const validManifest = { permissions: ['read:projects', 'write:materials'] };
    const res1 = validateManifestScopes(validManifest);
    expect(res1.valid).toBe(true);
    expect(res1.invalid).toEqual([]);

    const invalidManifest = { scopes: ['read:projects', 'invalid:scope:name'] };
    const res2 = validateManifestScopes(invalidManifest);
    expect(res2.valid).toBe(false);
    expect(res2.invalid).toEqual(['invalid:scope:name']);
    expect(res2.allValid).toEqual(Object.keys(PLUGIN_SCOPES));

    const emptyManifest = {};
    const res3 = validateManifestScopes(emptyManifest);
    expect(res3.valid).toBe(true);
  });

  it('groups scopes by category for UI display', () => {
    const groups = getScopeGroups();
    expect(groups.data).toBeDefined();
    expect(groups.billing).toBeDefined();
    expect(groups.integration).toBeDefined();
    expect(groups.user).toBeDefined();

    const dataScopeIds = groups.data.map((s) => s.id);
    expect(dataScopeIds).toContain('read:projects');
    expect(dataScopeIds).toContain('write:projects');
  });
});
