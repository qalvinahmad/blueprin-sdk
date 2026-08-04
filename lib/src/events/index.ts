/**
 * Events Module - Re-exports event constants and helpers
 */

export { EVENT_NAMES } from '../core/constants.js';

/**
 * Helper to create event handlers with logging
 *
 * @example
 * import { createEventHandler } from '@alvinahmad/blueprin-sdk/events';
 *
 * ctx.events.on(
 *   EVENT_NAMES.PROJECT_CREATED,
 *   createEventHandler('project:created', (data) => {
 *     console.log('Project created:', data.project.name);
 *   })
 * );
 *
 * @param {string} name - Handler name for logging
 * @param {Function} handler - Event handler
 * @returns {Function} Wrapped handler
 */
export function createEventHandler(name, handler) {
  return (data) => {
    try {
      return handler(data);
    } catch (error) {
      console.error(`[Blueprin Event:${name}] Error:`, error);
      throw error;
    }
  };
}

/**
 * Common event patterns
 */
export const EventPatterns = {
  /**
   * Log all events for debugging
   */
  logger: (eventName) => (data) => {
    console.log(`[Blueprin Event:${eventName}]`, data);
  },

  /**
   * Debounce event handling
   * @param {number} ms - Debounce interval
   */
  debounce:
    (ms = 300) =>
    (() => {
      let timer;
      return (data) => {
        clearTimeout(timer);
        timer = setTimeout(() => data, ms);
      };
    })(),
};
