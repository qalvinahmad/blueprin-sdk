/**
 * Plugin OAuth Scopes — Permission management per plugin.
 *
 * Plugins declare required scopes at install time.
 * Users approve scope grants. Runtime checks enforce access.
 */

export const PLUGIN_SCOPES = {
  // Data read scopes
  "read:projects": { description: "View project list", category: "data" },
  "read:ahs": { description: "View unit price analysis data", category: "data" },
  "read:materials": { description: "View material data", category: "data" },
  "read:rab": { description: "View budget plan data", category: "data" },
  "read:reports": { description: "View reports", category: "data" },

  // Data write scopes
  "write:projects": { description: "Create/update projects", category: "data" },
  "write:ahs": { description: "Create/update unit price analysis data", category: "data" },
  "write:materials": { description: "Create/update material data", category: "data" },
  "write:rab": { description: "Create/update budget plan data", category: "data" },

  // Billing scopes
  "billing:read": { description: "View billing information", category: "billing" },
  "billing:checkout": { description: "Create payments", category: "billing" },

  // Integration scopes
  "integration:doku": { description: "Access DOKU integration", category: "integration" },
  "integration:bank": { description: "Access bank integration", category: "integration" },
  "integration:supplier": { description: "Access supplier integration", category: "integration" },

  // User scopes
  "user:profile": { description: "View user profile", category: "user" },
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
