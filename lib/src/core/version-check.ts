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
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const cleaned = String(version || '0.0.0').replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  return {
    major: parseInt(parts[0] || '0', 10),
    minor: parseInt(parts[1] || '0', 10),
    patch: parseInt(parts[2] || '0', 10),
  };
}

/**
 * Compare two versions. Returns:
 *   -1 if a < b
 *    0 if a === b
 *    1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (va.major !== vb.major) return va.major < vb.major ? -1 : 1;
  if (va.minor !== vb.minor) return va.minor < vb.minor ? -1 : 1;
  if (va.patch !== vb.patch) return va.patch < vb.patch ? -1 : 1;
  return 0;
}

/**
 * Check if a version satisfies a range requirement.
 *
 * Supports:
 *   "^1.0.0"  — compatible with 1.x.x (>=1.0.0 <2.0.0)
 *   "~1.2.0"  — compatible with 1.2.x (>=1.2.0 <1.3.0)
 *   ">=1.0.0" — greater than or equal
 *   "1.0.0"   — exact match
 */
export function satisfies(version: string, range: string): boolean {
  const cleaned = String(range || '').trim();

  if (cleaned.startsWith('^')) {
    const required = cleaned.slice(1);
    const v = parseVersion(version);
    const r = parseVersion(required);
    return (
      v.major === r.major &&
      (v.major > r.major ||
        (v.minor > r.minor || (v.minor === r.minor && v.patch >= r.patch))) &&
      compareVersions(version, required) >= 0
    );
  }

  if (cleaned.startsWith('~')) {
    const required = cleaned.slice(1);
    const v = parseVersion(version);
    const r = parseVersion(required);
    return (
      v.major === r.major &&
      v.minor === r.minor &&
      v.patch >= r.patch
    );
  }

  if (cleaned.startsWith('>=')) {
    const required = cleaned.slice(2).trim();
    return compareVersions(version, required) >= 0;
  }

  if (cleaned.startsWith('>')) {
    const required = cleaned.slice(1).trim();
    return compareVersions(version, required) > 0;
  }

  if (cleaned.startsWith('<=')) {
    const required = cleaned.slice(2).trim();
    return compareVersions(version, required) <= 0;
  }

  if (cleaned.startsWith('<')) {
    const required = cleaned.slice(1).trim();
    return compareVersions(version, required) < 0;
  }

  // Exact match
  return compareVersions(version, cleaned) === 0;
}

/**
 * Check plugin compatibility with the current SDK version.
 */
export function checkCompatibility(
  pluginVersion: string,
  minSdkVersion: string | undefined,
  currentSdkVersion: string
): VersionCheckResult {
  const result: VersionCheckResult = {
    compatible: true,
    pluginVersion,
    sdkVersion: currentSdkVersion,
    requiredVersion: minSdkVersion,
  };

  if (!minSdkVersion) {
    return result;
  }

  if (!satisfies(currentSdkVersion, minSdkVersion)) {
    result.compatible = false;
    result.reason = `Plugin requires SDK ${minSdkVersion}, but current is ${currentSdkVersion}`;
  }

  return result;
}

/**
 * Check if a plugin update is available.
 */
export function checkUpdateAvailable(
  installedVersion: string,
  latestVersion: string
): { available: boolean; type: 'major' | 'minor' | 'patch' | null } {
  const cmp = compareVersions(latestVersion, installedVersion);

  if (cmp <= 0) {
    return { available: false, type: null };
  }

  const installed = parseVersion(installedVersion);
  const latest = parseVersion(latestVersion);

  if (latest.major > installed.major) return { available: true, type: 'major' };
  if (latest.minor > installed.minor) return { available: true, type: 'minor' };
  return { available: true, type: 'patch' };
}
