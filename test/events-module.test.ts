import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventHandler, EventPatterns, EVENT_NAMES } from '../lib/src/events/index.ts';
import { EventBus } from '../lib/src/core/event-bus.ts';

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

  describe('EventBus listener unsubscribe behavior', () => {
    let bus: EventBus;
    const mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    beforeEach(() => {
      vi.clearAllMocks();
      bus = new EventBus({ logger: mockLogger });
    });

    it('should stop receiving events after calling the unsubscribe function returned by on()', async () => {
      const callback = vi.fn();
      const unsubscribe = bus.on('test:event', callback);

      expect(bus.listenerCount('test:event')).toBe(1);

      // First emit - callback should be called
      await bus.emit('test:event', { id: 1 });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ id: 1 });

      // Unsubscribe listener
      unsubscribe();
      expect(bus.listenerCount('test:event')).toBe(0);

      // Second emit - callback should NOT be called again
      await bus.emit('test:event', { id: 2 });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should only unsubscribe the targeted listener when multiple listeners exist', async () => {
      const callbackA = vi.fn();
      const callbackB = vi.fn();

      const unsubscribeA = bus.on('test:multi', callbackA);
      bus.on('test:multi', callbackB);

      expect(bus.listenerCount('test:multi')).toBe(2);

      // Emit before unsubscribe
      await bus.emit('test:multi', { step: 'before' });
      expect(callbackA).toHaveBeenCalledTimes(1);
      expect(callbackB).toHaveBeenCalledTimes(1);

      // Unsubscribe only callbackA
      unsubscribeA();
      expect(bus.listenerCount('test:multi')).toBe(1);

      // Emit after unsubscribe
      await bus.emit('test:multi', { step: 'after' });
      expect(callbackA).toHaveBeenCalledTimes(1);
      expect(callbackB).toHaveBeenCalledTimes(2);
    });
  });
});
