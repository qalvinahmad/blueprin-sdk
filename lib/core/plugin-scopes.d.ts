/**
 * Plugin OAuth Scopes — Permission management per plugin.
 *
 * Plugins declare required scopes at install time.
 * Users approve scope grants. Runtime checks enforce access.
 */
export declare const PLUGIN_SCOPES: {
    "read:projects": {
        description: string;
        category: string;
    };
    "read:ahs": {
        description: string;
        category: string;
    };
    "read:materials": {
        description: string;
        category: string;
    };
    "read:rab": {
        description: string;
        category: string;
    };
    "read:reports": {
        description: string;
        category: string;
    };
    "write:projects": {
        description: string;
        category: string;
    };
    "write:ahs": {
        description: string;
        category: string;
    };
    "write:materials": {
        description: string;
        category: string;
    };
    "write:rab": {
        description: string;
        category: string;
    };
    "billing:read": {
        description: string;
        category: string;
    };
    "billing:checkout": {
        description: string;
        category: string;
    };
    "integration:doku": {
        description: string;
        category: string;
    };
    "integration:bank": {
        description: string;
        category: string;
    };
    "integration:supplier": {
        description: string;
        category: string;
    };
    "user:profile": {
        description: string;
        category: string;
    };
};
/**
 * Check if a set of granted scopes includes a required scope.
 */
export declare function hasScope(grantedScopes: any, requiredScope: any): boolean;
/**
 * Check if all required scopes are granted.
 */
export declare function hasAllScopes(grantedScopes: any, requiredScopes: any): any;
/**
 * Get the difference between required and granted scopes.
 */
export declare function missingScopes(grantedScopes: any, requiredScopes: any): any;
/**
 * Validate that a plugin manifest has valid scopes.
 */
export declare function validateManifestScopes(manifest: any): {
    valid: boolean;
    invalid: any;
    allValid: string[];
};
/**
 * Scope groupings for UI display.
 */
export declare function getScopeGroups(): {};
