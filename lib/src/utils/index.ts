/**
 * @alvinahmad/blueprin-sdk - Utils Module
 *
 * Common utility functions for formatting, ID generation, rate limiting, and helpers.
 */

/**
 * Format a number to Indonesian Rupiah currency string.
 * Example: formatIDR(340000) -> "Rp 340.000"
 *
 * @param value - Numeric currency amount (e.g. 340000 or 34.0)
 * @returns Formatted currency string
 */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number using customizable 3-digit notation separator and decimal places.
 *
 * Examples:
 * - formatNumberWithSeparator(340000, 'space') -> "340 000"
 * - formatNumberWithSeparator(34.0, 'space', 1) -> "34.0"
 * - formatNumberWithSeparator(340000, 'dot') -> "340.000"
 * - formatNumberWithSeparator(340000, 'comma') -> "340,000"
 *
 * @param value - Number or numeric string to format (e.g. 340000 or 34.0)
 * @param separator - 3-digit thousands separator ('space' | 'dot' | 'comma')
 * @param decimals - Number of decimal digits to preserve (e.g. 1 for "34.0")
 * @returns Formatted number string
 */
export function formatNumberWithSeparator(
  value: number | string | null | undefined,
  separator: 'space' | 'dot' | 'comma' = 'space',
  decimals: number = 0
): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);

  const fixedStr = decimals > 0 ? num.toFixed(decimals) : num.toFixed(0);
  const parts = fixedStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 && decimals > 0 ? parts[1] : '';

  let thousandsSep = ' ';
  let decimalSep = '.';

  if (separator === 'dot') {
    thousandsSep = '.';
    decimalSep = ',';
  } else if (separator === 'comma') {
    thousandsSep = ',';
    decimalSep = '.';
  } else if (separator === 'space') {
    thousandsSep = ' ';
    decimalSep = '.';
  }

  // 3-digit grouping regex for thousands (e.g. 340000 -> "340 000")
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);

  return decimalPart ? `${integerPart}${decimalSep}${decimalPart}` : integerPart;
}

/**
 * Format an ISO date or Date object to human-readable format.
 *
 * @param date - Date object or ISO string timestamp
 * @param locale - Locale code (e.g. 'en-US' or 'id-ID')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale: string = 'id-ID'): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format relative time duration from now.
 *
 * @param date - Date object or ISO string timestamp
 * @param locale - Language code ('id' | 'en', default: 'id')
 * @returns Relative time string (e.g. "baru saja", "5 menit lalu" or "just now", "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date, locale: 'id' | 'en' = 'id'): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (locale === 'en') {
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return formatDate(date, 'en-US');
  }

  if (seconds < 60) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return formatDate(date, 'id-ID');
}

/**
 * Merge CSS class names (lightweight cn/clsx utility).
 *
 * @param args - Class names, boolean conditions, arrays, or objects
 * @returns Merged class string
 */
export function cn(...args: any[]): string {
  const classes: any[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === 'string') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      classes.push(cn(...arg));
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a cryptographically secure UUID v4 identifier.
 *
 * @returns 36-character UUID string (e.g. "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")
 */
export function generateId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  try {
    const { randomUUID } = require('crypto');
    if (randomUUID) return randomUUID();
  } catch {
    // Fallback pseudo-random generator
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debounce a function to execute only after a period of inactivity.
 *
 * @param fn - Function to debounce
 * @param ms - Delay in milliseconds (default: 300)
 * @returns Debounced wrapper function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300): (...args: Parameters<T>) => void {
  let timer: any;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Deep clone an object using native structuredClone or JSON fallback.
 *
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick specific keys from an object.
 *
 * @param obj - Source object
 * @param keys - Array of keys to pick
 * @returns Object with selected keys
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

/**
 * Omit specific keys from an object.
 *
 * @param obj - Source object
 * @param keys - Array of keys to exclude
 * @returns Object with excluded keys omitted
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete (result as any)[key];
  }
  return result;
}

/**
 * Throttle a function to execute at most once per time window.
 * Useful for rate limiting heavy operations like 3D re-rendering or canvas updates.
 *
 * @param fn - Function to throttle
 * @param limit - Time window limit in milliseconds (default: 300)
 * @returns Throttled wrapper function
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit = 300): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * API Rate Limiter
 * Tracks the number of calls over a sliding time window to prevent spam/abuse from plugins.
 */
export class RateLimiter {
  private limit: number;
  private windowMs: number;
  private calls: Map<string, number[]>;

  constructor(limit = 100, windowMs = 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.calls = new Map();
  }

  /**
   * Check if a specific identifier has exceeded its rate limit.
   *
   * @param identifier - Unique identifier (e.g. pluginId or endpoint name)
   * @returns boolean - true if allowed, false if limit exceeded
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    if (!this.calls.has(identifier)) {
      this.calls.set(identifier, []);
    }

    let timestamps = this.calls.get(identifier)!;
    // Remove timestamps older than the sliding window
    timestamps = timestamps.filter((time) => now - time < this.windowMs);

    if (timestamps.length >= this.limit) {
      this.calls.set(identifier, timestamps);
      return false;
    }

    timestamps.push(now);
    this.calls.set(identifier, timestamps);
    return true;
  }
}
