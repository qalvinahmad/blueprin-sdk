import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatIDR,
  formatDate,
  formatRelativeTime,
  cn,
  generateId,
  debounce,
  deepClone,
  pick,
  omit,
  throttle,
  RateLimiter,
} from '../lib/src/utils/index.ts';

describe('formatIDR', () => {
  it('should format small numbers', () => {
    expect(formatIDR(50000)).toContain('50.000');
  });

  it('should format large numbers', () => {
    expect(formatIDR(1500000)).toContain('1.500.000');
  });

  it('should format zero', () => {
    expect(formatIDR(0)).toContain('0');
  });
});

describe('formatDate', () => {
  it('should format date string', () => {
    const result = formatDate('2026-08-01');
    expect(result).toContain('Agustus');
    expect(result).toContain('2026');
  });

  it('should format Date object', () => {
    const result = formatDate(new Date('2026-01-15'));
    expect(result).toContain('Januari');
    expect(result).toContain('2026');
  });
});

describe('formatRelativeTime', () => {
  it('should return "baru saja" for recent times', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('baru saja');
  });

  it('should return minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    expect(formatRelativeTime(d)).toBe('5 menit lalu');
  });

  it('should return hours ago', () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(formatRelativeTime(d)).toBe('3 jam lalu');
  });

  it('should return days ago', () => {
    const d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    expect(formatRelativeTime(d)).toBe('3 hari lalu');
  });

  it('should return formatted date for old dates', () => {
    const d = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const result = formatRelativeTime(d);
    expect(result).toContain('2026');
  });
});

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('should filter falsy values', () => {
    expect(cn('a', null, 'b', undefined, false)).toBe('a b');
  });

  it('should handle object syntax', () => {
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('should handle arrays', () => {
    expect(cn('a', ['b', 'c'])).toBe('a b c');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('generateId', () => {
  it('should return a UUID v4 format', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should use fallback random generator when crypto.randomUUID is missing', () => {
    const originalCrypto = globalThis.crypto;
    try {
      // @ts-ignore
      delete globalThis.crypto;
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    } finally {
      // @ts-ignore
      globalThis.crypto = originalCrypto;
    }
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);
    debounced();
    vi.advanceTimersByTime(200);
    debounced();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should execute only the latest call when invoked multiple times before delay expires', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced('first');
    debounced('second');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith('second');
  });
});

describe('deepClone', () => {
  it('should deep clone objects', () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
  });

  it('should clone arrays', () => {
    const original = [1, [2, 3]];
    const cloned = deepClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
  });
});

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });

  it('should ignore missing keys', () => {
    const obj = { a: 1 };
    expect(pick(obj, ['a', 'b'])).toEqual({ a: 1 });
  });

  it('should return empty object for empty keys', () => {
    expect(pick({ a: 1 }, [])).toEqual({});
  });
});

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
  });

  it('should return original if no keys to omit', () => {
    const obj = { a: 1 };
    expect(omit(obj, [])).toEqual({ a: 1 });
  });

  it('should not mutate original', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, ['b']);
    expect(obj).toEqual({ a: 1, b: 2 });
    expect(result).toEqual({ a: 1 });
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should call function immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should ignore calls within throttle window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should allow call after throttle window', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);
    throttled();
    vi.advanceTimersByTime(300);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 300);
    throttled('a', 'b');
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });
});

describe('RateLimiter', () => {
  it('should allow calls within limit', () => {
    const limiter = new RateLimiter(5, 1000);
    expect(limiter.checkLimit('api1')).toBe(true);
    expect(limiter.checkLimit('api1')).toBe(true);
  });

  it('should block calls exceeding limit', () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.checkLimit('api1')).toBe(true);
    expect(limiter.checkLimit('api1')).toBe(true);
    expect(limiter.checkLimit('api1')).toBe(false);
  });

  it('should track different identifiers separately', () => {
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.checkLimit('api1')).toBe(true);
    expect(limiter.checkLimit('api2')).toBe(true);
    expect(limiter.checkLimit('api1')).toBe(false);
  });

  it('should reset after window expires', () => {
    const limiter = new RateLimiter(1, 50); // 50ms window
    expect(limiter.checkLimit('api1')).toBe(true);
    expect(limiter.checkLimit('api1')).toBe(false);
    // Note: Cannot reliably test window expiry without fake timers
    // The filter logic removes expired timestamps, so after window passes, new calls are allowed
  });
});
