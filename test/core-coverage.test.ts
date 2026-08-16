import { describe, it, expect, vi } from 'vitest';
import { Logger } from '../lib/src/core/logger.ts';
import { EventBus } from '../lib/src/core/event-bus.ts';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import { ProjectClient } from '../lib/src/project/index.ts';
import { EventPatterns } from '../lib/src/events/index.ts';
import { FormulaEngine as RabFormulaEngine } from '../lib/src/rab/formula-engine.ts';

describe('Core components full coverage', () => {
  it('Logger handles debug and success', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new Logger({ prefix: '[Test]', debug: true });
    logger.debug('debugging details');
    logger.success('all good');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('EventBus handles scoped once and rate limiting', async () => {
    const mockLogger = { debug: vi.fn(), warn: vi.fn() };
    const bus = new EventBus({ logger: mockLogger });
    const scoped = bus.createScoped('plugin-rate-test');

    const cb = vi.fn();
    scoped.once('test-event', cb);
    await bus.emit('test-event', { data: 1 });
    await bus.emit('test-event', { data: 2 });
    expect(cb).toHaveBeenCalledTimes(1);

    // Rate limiting: emit rapid events
    for (let i = 0; i < 110; i++) {
      scoped.emit('rapid-event', {});
    }
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('BlueprinSDK destroy and initialize', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-destroy', debug: false });
    await sdk.initialize();
    expect(sdk.getInfo().initialized).toBe(true);

    await sdk.destroy();
    expect(sdk.getInfo().initialized).toBe(false);
  });

  it('ProjectClient getCurrent and setCurrent', async () => {
    const mockStorage = {
      _data: {} as Record<string, any>,
      get: vi.fn(async (k) => mockStorage._data[k] || null),
      set: vi.fn(async (k, v) => {
        mockStorage._data[k] = v;
      }),
    };
    const mockEvents = { emit: vi.fn() };
    const mockHooks = { executeBefore: vi.fn((_, c) => c), executeAfter: vi.fn((_, c) => c) };

    const client = new ProjectClient({ storage: mockStorage, hooks: mockHooks, events: mockEvents });

    await client.setCurrent({ id: 'p1', name: 'Rumah Mewah' });
    expect(mockEvents.emit).toHaveBeenCalledWith('blueprin:project:updated', { project: { id: 'p1', name: 'Rumah Mewah' } });

    const current = await client.getCurrent();
    expect(current?.name).toBe('Rumah Mewah');
  });

  it('EventPatterns debounce and logger', async () => {
    const debounceFn = EventPatterns.debounce(10);
    debounceFn('test1');
    debounceFn('test2');

    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logFn = EventPatterns.logger('custom:event');
    logFn({ payload: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('Rab FormulaEngine error on invalid type', async () => {
    const engine = new RabFormulaEngine({ hooks: null, logger: null });
    expect(() => (engine as any)._register('invalid_type', 'test', () => {})).toThrow('Invalid formula pipeline type');
    await expect((engine as any).applyChain('invalid_type', {}, 100)).rejects.toThrow('Invalid formula pipeline type');
  });
});
