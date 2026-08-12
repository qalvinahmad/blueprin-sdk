import { describe, it, expect } from 'vitest';
import { createHook, HookPatterns } from '../lib/src/hooks/index.ts';
import { HOOK_NAMES } from '../lib/src/core/constants.ts';

describe('createHook', () => {
  it('should return the handler function', () => {
    const handler = (data) => data;
    const hook = createHook('test:hook', handler);
    expect(hook).toBe(handler);
  });

  it('should execute the returned handler', () => {
    const hook = createHook('test:hook', (data) => ({ ...data, modified: true }));
    const result = hook({ value: 1 });
    expect(result.modified).toBe(true);
  });
});

describe('HookPatterns.logger', () => {
  it('should return a function that logs data', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const loggerHook = HookPatterns.logger();
    loggerHook({ test: 'data' });
    expect(spy).toHaveBeenCalledWith('[Blueprin Hook]', { test: 'data' });
    spy.mockRestore();
  });
});

describe('HookPatterns.validator', () => {
  it('should pass valid data', () => {
    const validatorHook = HookPatterns.validator((data) => data.value > 0, 'Value must be positive');
    const result = validatorHook({ value: 5 });
    expect(result.value).toBe(5);
  });

  it('should throw on invalid data', () => {
    const validatorHook = HookPatterns.validator((data) => data.value > 0, 'Value must be positive');
    expect(() => validatorHook({ value: -1 })).toThrow('Value must be positive');
  });

  it('should use default error message', () => {
    const validatorHook = HookPatterns.validator(() => false);
    expect(() => validatorHook({})).toThrow('Validation failed');
  });
});

describe('HookPatterns.transformer', () => {
  it('should transform data', () => {
    const transformerHook = HookPatterns.transformer((data) => ({ extra: 'added' }));
    const result = transformerHook({ value: 1 });
    expect(result.value).toBe(1);
    expect(result.extra).toBe('added');
  });
});

describe('HookPatterns.rateLimit', () => {
  it('should allow first call', () => {
    const rateLimitHook = HookPatterns.rateLimit(1000);
    const result = rateLimitHook({ value: 1 });
    expect(result.value).toBe(1);
  });

  it('should throttle subsequent calls within window', () => {
    const rateLimitHook = HookPatterns.rateLimit(10000); // 10 second window
    rateLimitHook({ value: 1 }); // First call
    const result = rateLimitHook({ value: 2 }); // Should be throttled
    expect(result.value).toBe(2); // Returns data but doesn't execute
  });
});

describe('HOOK_NAMES constants', () => {
  it('should have all expected hook names', () => {
    expect(HOOK_NAMES.BEFORE_RAB_CALCULATE).toBe('blueprin:before:rab:calculate');
    expect(HOOK_NAMES.AFTER_RAB_CALCULATE).toBe('blueprin:after:rab:calculate');
    expect(HOOK_NAMES.BEFORE_MATERIAL_CREATE).toBe('blueprin:before:material:create');
    expect(HOOK_NAMES.AFTER_MATERIAL_CREATE).toBe('blueprin:after:material:create');
    expect(HOOK_NAMES.BEFORE_ORDER_CREATE).toBe('blueprin:before:order:create');
    expect(HOOK_NAMES.AFTER_ORDER_CREATE).toBe('blueprin:after:order:create');
  });
});
