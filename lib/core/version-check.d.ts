/**
 * Plugin Version Compatibility — Validate plugin compatibility with SDK version.
 *
 * Uses semver-like comparison for plugin version requirements.
 */
export interface VersionCheckResult {
    compatible: boolean;
    pluginVersion: string;
    sdkVersion: string;
    requiredVersion?: string;
    reason?: string;
}
/**
 * Parse a semver string into components.
 */
export declare function parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
};
/**
 * Compare two versions. Returns:
 *   -1 if a < b
 *    0 if a === b
 *    1 if a > b
 */
export declare function compareVersions(a: string, b: string): number;
/**
 * Check if a version satisfies a range requirement.
 *
 * Supports:
 *   "^1.0.0"  — compatible with 1.x.x (>=1.0.0 <2.0.0)
 *   "~1.2.0"  — compatible with 1.2.x (>=1.2.0 <1.3.0)
 *   ">=1.0.0" — greater than or equal
 *   "1.0.0"   — exact match
 */
export declare function satisfies(version: string, range: string): boolean;
/**
 * Check plugin compatibility with the current SDK version.
 */
export declare function checkCompatibility(pluginVersion: string, minSdkVersion: string | undefined, currentSdkVersion: string): VersionCheckResult;
/**
 * Check if a plugin update is available.
 */
export declare function checkUpdateAvailable(installedVersion: string, latestVersion: string): {
    available: boolean;
    type: 'major' | 'minor' | 'patch' | null;
};
