/**
 * Hooks Module - Pre-defined hook names for plugin developers
 */

import { HOOK_NAMES } from '../core/constants.js';

export { HOOK_NAMES } from '../core/constants.js';

/**
 * Helper to create a hook handler with type-safe context
 *
 * @example
 * import { createHook } from '@alvinahmad/blueprin-sdk/hooks';
 *
 * export default definePlugin({
 *   id: 'my-plugin',
 *   activate(ctx) {
 *     ctx.hooks.register(
 *       HOOK_NAMES.AFTER_RAB_CALCULATE,
 *         createHook('after:rab:calculate', (data) => {
 *           console.log('Total RAB:', data.result.total);
 *         })
 *     );
 *   },
 * });
 *
 * @param {string} name - Hook name
 * @param {Function} handler - Hook handler
 * @returns {Function} Hook callback
 */
export function createHook(name, handler) {
  return handler;
}

/**
 * Common hook patterns for plugin developers
 */
export const HookPatterns = {
  /**
   * Log all events for debugging
   */
  logger: () => (data) => {
    console.log('[Blueprin Hook]', data);
  },

  /**
   * Validate data before creation
   * @param {Function} validator - Returns true if valid
   * @param {string} errorMessage
   */
  validator:
    (validator, errorMessage = 'Validation failed') =>
    (data) => {
      if (!validator(data)) {
        throw new Error(errorMessage);
      }
      return data;
    },

  /**
   * Transform data after retrieval
   * @param {Function} transformer
   */
  transformer:
    (transformer) =>
    (data) => {
      return { ...data, ...transformer(data) };
    },

  /**
   * Rate limiter - throttles hook execution
   * @param {number} ms - Minimum interval between executions
   */
  rateLimit:
    (ms = 1000) =>
    (() => {
      let lastCall = 0;
      return (data) => {
        const now = Date.now();
        if (now - lastCall < ms) {
          return data;
        }
        lastCall = now;
        return data;
      };
    })(),
};
