/**
 * Utils Module - Common utility functions
 */

/**
 * Format number to Indonesian Rupiah
 * @param {number} value
 * @returns {string}
 */
export function formatIDR(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format ISO date to Indonesian format
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format relative time in Indonesian
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;

  return formatDate(date);
}

/**
 * Merge class names (lightweight cn/clsx)
 * @param {...(string|Object|Array)} args
 * @returns {string}
 */
export function cn(...args) {
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

export function generateId() {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  try {
    const { randomUUID } = require('crypto');
    if (randomUUID) return randomUUID();
  } catch {
    // ignore
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Debounce a function
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Deep clone an object
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  return structuredClone(obj);
}

/**
 * Pick specific keys from an object
 * @param {Object} obj
 * @param {string[]} keys
 * @returns {Object}
 */
export function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

/**
 * Omit specific keys from an object
 * @param {Object} obj
 * @param {string[]} keys
 * @returns {Object}
 */
export function omit(obj, keys) {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Throttle a function (Ensures it is called at most once in a specified time limit)
 * Useful for rate limiting heavy SDK operations like 3D re-rendering.
 * @param {Function} fn
 * @param {number} limit (in milliseconds)
 * @returns {Function}
 */
export function throttle(fn: any, limit = 300) {
  let inThrottle: any;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * API Rate Limiter
 * Tracks the number of calls over a specific time window to prevent spam/abuse from plugins.
 */
export class RateLimiter {
  private limit: any;
  private windowMs: any;
  private calls: any;

  constructor(limit = 100, windowMs = 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.calls = new Map(); // Track calls by identifier (e.g., pluginId or API name)
  }
  
  /**
   * Check if a specific identifier has exceeded its rate limit
   * @param {string} identifier 
   * @returns {boolean} true if allowed, false if limit exceeded
   */
  checkLimit(identifier) {
    const now = Date.now();
    if (!this.calls.has(identifier)) {
      this.calls.set(identifier, []);
    }
    
    let timestamps = this.calls.get(identifier);
    // Remove timestamps older than the window
    timestamps = timestamps.filter(time => now - time < this.windowMs);
    
    if (timestamps.length >= this.limit) {
      this.calls.set(identifier, timestamps); // Update filtered list
      return false; // Limit exceeded
    }
    
    timestamps.push(now);
    this.calls.set(identifier, timestamps);
    return true; // Allowed
  }
}

