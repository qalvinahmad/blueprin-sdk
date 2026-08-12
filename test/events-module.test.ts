import { describe, it, expect, vi } from 'vitest';
import { createEventHandler, EventPatterns, EVENT_NAMES } from '../lib/src/events/index.ts';

describe('Events module', () => {
  it('should export EVENT_NAMES', () => {
    expect(EVENT_NAMES).toBeDefined();
    expect(EVENT_NAMES.PROJECT_CREATED).toBe('blueprin:project:created');
  });

  describe('createEventHandler', () => {
    it('should wrap handler and return data', () => {
      const handler = (data) => ({ ...data, processed: true });
      const wrapped = createEventHandler('test', handler);
      const result = wrapped({ value: 1 });
      expect(result.processed).toBe(true);
    });

    it('should catch and re-throw handler errors', () => {
      const handler = () => { throw new Error('Handler error'); };
      const wrapped = createEventHandler('test', handler);
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => wrapped({})).toThrow('Handler error');
      spy.mockRestore();
    });
  });

  describe('EventPatterns.logger', () => {
    it('should return a function that logs events', () => {
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const logger = EventPatterns.logger('test:event');
      logger({ value: 42 });
      expect(spy).toHaveBeenCalledWith('[Blueprin Event:test:event]', { value: 42 });
      spy.mockRestore();
    });
  });

  describe('EventPatterns.debounce', () => {
    it('should return a debounced function', () => {
      vi.useFakeTimers();
      const debounced = EventPatterns.debounce(300);
      expect(typeof debounced).toBe('function');
      vi.useRealTimers();
    });
  });
});
