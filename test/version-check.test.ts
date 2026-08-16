import { describe, it, expect } from 'vitest';
import {
  parseVersion,
  compareVersions,
  satisfies,
  checkCompatibility,
  checkUpdateAvailable,
} from '../lib/src/core/version-check.ts';

describe('VersionCheck and Semver utilities', () => {
  it('parses version strings into major, minor, patch', () => {
    expect(parseVersion('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3 });
    expect(parseVersion('v2.0.1')).toEqual({ major: 2, minor: 0, patch: 1 });
    expect(parseVersion('')).toEqual({ major: 0, minor: 0, patch: 0 });
    expect(parseVersion('10')).toEqual({ major: 10, minor: 0, patch: 0 });
  });

  it('compares two versions correctly', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
    expect(compareVersions('1.2.0', '1.1.9')).toBe(1);
    expect(compareVersions('1.1.9', '1.2.0')).toBe(-1);
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
    expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
  });

  it('evaluates caret ^ ranges', () => {
    expect(satisfies('1.2.3', '^1.0.0')).toBe(true);
    expect(satisfies('1.0.0', '^1.0.0')).toBe(true);
    expect(satisfies('1.9.9', '^1.2.0')).toBe(true);
    expect(satisfies('2.0.0', '^1.0.0')).toBe(false);
    expect(satisfies('0.9.0', '^1.0.0')).toBe(false);
  });

  it('evaluates tilde ~ ranges', () => {
    expect(satisfies('1.2.3', '~1.2.0')).toBe(true);
    expect(satisfies('1.2.0', '~1.2.0')).toBe(true);
    expect(satisfies('1.3.0', '~1.2.0')).toBe(false);
    expect(satisfies('1.1.9', '~1.2.0')).toBe(false);
    expect(satisfies('2.2.0', '~1.2.0')).toBe(false);
  });

  it('evaluates comparison operators (>=, >, <=, <, exact)', () => {
    expect(satisfies('1.5.0', '>=1.0.0')).toBe(true);
    expect(satisfies('1.0.0', '>=1.0.0')).toBe(true);
    expect(satisfies('0.9.0', '>=1.0.0')).toBe(false);

    expect(satisfies('1.5.0', '>1.0.0')).toBe(true);
    expect(satisfies('1.0.0', '>1.0.0')).toBe(false);

    expect(satisfies('1.0.0', '<=1.0.0')).toBe(true);
    expect(satisfies('0.9.0', '<=1.0.0')).toBe(true);
    expect(satisfies('1.1.0', '<=1.0.0')).toBe(false);

    expect(satisfies('0.9.0', '<1.0.0')).toBe(true);
    expect(satisfies('1.0.0', '<1.0.0')).toBe(false);

    expect(satisfies('1.0.0', '1.0.0')).toBe(true);
    expect(satisfies('1.0.1', '1.0.0')).toBe(false);
  });

  it('checks plugin compatibility against SDK version', () => {
    const result1 = checkCompatibility('1.0.0', undefined, '1.0.1');
    expect(result1.compatible).toBe(true);

    const result2 = checkCompatibility('1.0.0', '^1.0.0', '1.0.1');
    expect(result2.compatible).toBe(true);

    const result3 = checkCompatibility('1.0.0', '^2.0.0', '1.0.1');
    expect(result3.compatible).toBe(false);
    expect(result3.reason).toContain('Plugin requires SDK ^2.0.0, but current is 1.0.1');
  });

  it('checks update availability and type (major, minor, patch, none)', () => {
    expect(checkUpdateAvailable('1.0.0', '1.0.0')).toEqual({ available: false, type: null });
    expect(checkUpdateAvailable('1.0.1', '1.0.0')).toEqual({ available: false, type: null });

    expect(checkUpdateAvailable('1.0.0', '2.0.0')).toEqual({ available: true, type: 'major' });
    expect(checkUpdateAvailable('1.0.0', '1.1.0')).toEqual({ available: true, type: 'minor' });
    expect(checkUpdateAvailable('1.0.0', '1.0.1')).toEqual({ available: true, type: 'patch' });
  });
});
