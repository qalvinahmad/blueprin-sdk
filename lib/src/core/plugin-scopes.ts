/**
 * Plugin OAuth Scopes — Permission management per plugin.
 *
 * Plugins declare required scopes at install time.
 * Users approve scope grants. Runtime checks enforce access.
 */

export const PLUGIN_SCOPES = {
  // Data read scopes
  "read:projects": { description: "Melihat daftar proyek", category: "data" },
  "read:ahs": { description: "Melihat data AHS", category: "data" },
  "read:materials": { description: "Melihat data material/bahan", category: "data" },
  "read:rab": { description: "Melihat data RAB", category: "data" },
  "read:reports": { description: "Melihat laporan", category: "data" },

  // Data write scopes
  "write:projects": { description: "Membuat/mengubah proyek", category: "data" },
  "write:ahs": { description: "Membuat/mengubah data AHS", category: "data" },
  "write:materials": { description: "Membuat/mengubah data material", category: "data" },
  "write:rab": { description: "Membuat/mengubah data RAB", category: "data" },

  // Billing scopes
  "billing:read": { description: "Melihat informasi billing", category: "billing" },
  "billing:checkout": { description: "Membuat pembayaran", category: "billing" },

  // Integration scopes
  "integration:doku": { description: "Akses integrasi DOKU", category: "integration" },
  "integration:bank": { description: "Akses integrasi bank", category: "integration" },
  "integration:supplier": { description: "Akses integrasi supplier", category: "integration" },

  // User scopes
  "user:profile": { description: "Melihat profil user", category: "user" },
};

/**
 * Check if a set of granted scopes includes a required scope.
 */
export function hasScope(grantedScopes, requiredScope) {
  if (!grantedScopes || !Array.isArray(grantedScopes)) return false;
  if (grantedScopes.includes("*")) return true;
  return grantedScopes.includes(requiredScope);
}

/**
 * Check if all required scopes are granted.
 */
export function hasAllScopes(grantedScopes, requiredScopes) {
  return requiredScopes.every((scope) => hasScope(grantedScopes, scope));
}

/**
 * Get the difference between required and granted scopes.
 */
export function missingScopes(grantedScopes, requiredScopes) {
  return requiredScopes.filter((scope) => !hasScope(grantedScopes, scope));
}

/**
 * Validate that a plugin manifest has valid scopes.
 */
export function validateManifestScopes(manifest) {
  const declaredScopes = manifest?.permissions || manifest?.scopes || [];
  const invalid = declaredScopes.filter((s) => !PLUGIN_SCOPES[s]);
  return {
    valid: invalid.length === 0,
    invalid,
    allValid: Object.keys(PLUGIN_SCOPES),
  };
}

/**
 * Scope groupings for UI display.
 */
export function getScopeGroups() {
  const groups = {};
  for (const [scope, meta] of Object.entries(PLUGIN_SCOPES)) {
    const cat = meta.category || "other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ id: scope, ...meta });
  }
  return groups;
}
