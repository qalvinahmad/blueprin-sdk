import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelemetryManager } from '../lib/src/telemetry/index.ts';

describe('TelemetryManager', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('initializes with default settings and handles session generation', () => {
    const tm = new TelemetryManager({ appId: 'test-app' });
    expect(tm.isEnabled()).toBe(true);
    expect(tm.handlerCount()).toBe(0);
    tm.destroy();
  });

  it('supports handler subscription and unsubscription', async () => {
    const tm = new TelemetryManager();
    const handler = vi.fn();
    const unsub = tm.addHandler(handler);
    expect(tm.handlerCount()).toBe(1);

    await tm.track('test_event', { foo: 'bar' });
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'test_event',
        payload: { foo: 'bar' },
      })
    );

    unsub();
    expect(tm.handlerCount()).toBe(0);

    tm.addHandler(handler);
    tm.removeHandler(handler);
    expect(tm.handlerCount()).toBe(0);

    tm.addHandler(handler);
    tm.clear();
    expect(tm.handlerCount()).toBe(0);

    expect(() => tm.addHandler(null as any)).toThrow('Telemetry handler must be a function');
  });

  it('ignores tracking when disabled or invalid eventName', async () => {
    const tm = new TelemetryManager({ enabled: false });
    const res1 = await tm.track('event_name');
    expect(res1).toBeNull();

    tm.enable();
    const res2 = await tm.track('');
    expect(res2).toBeNull();

    const res3 = await tm.track(null as any);
    expect(res3).toBeNull();
  });

  it('batches events and flushes when batch size reached', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
    const tm = new TelemetryManager({ batchSize: 2, ingestUrl: 'https://example.com/ingest' });

    await tm.track('event_1');
    expect(globalThis.fetch).not.toHaveBeenCalled();

    await tm.track('event_2');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('sends immediate events directly to ingest', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });
    const tm = new TelemetryManager({ ingestUrl: 'https://example.com/ingest' });

    await tm.track('immediate_event', { urgent: true }, { immediate: true });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('records metrics and calculates summary', () => {
    const tm = new TelemetryManager();
    tm.recordMetric('plugin-a', 'render_time', 10, 'ms');
    tm.recordMetric('plugin-a', 'render_time', 20, 'ms');
    tm.recordMetric('plugin-a', 'render_time', 30, 'ms');
    tm.recordMetric('plugin-b', 'render_time', 50, 'ms');

    const summary = tm.getMetricsSummary('plugin-a');
    expect(summary.render_time).toBeDefined();
    expect(summary.render_time.count).toBe(3);
    expect(summary.render_time.min).toBe(10);
    expect(summary.render_time.max).toBe(30);
    expect(summary.render_time.avg).toBe(20);
    expect(summary.render_time.unit).toBe('ms');
  });

  it('measures elapsed time with startTimer', async () => {
    const tm = new TelemetryManager();
    const stopTimer = tm.startTimer('plugin-a', 'load_time');
    await new Promise((r) => setTimeout(r, 10));
    const elapsed = stopTimer();
    expect(elapsed).toBeGreaterThanOrEqual(5);

    const summary = tm.getMetricsSummary('plugin-a');
    expect(summary.load_time.count).toBe(1);
  });

  it('tracks health status and returns reports', () => {
    const tm = new TelemetryManager();
    tm.reportHealth('plugin-a', 'healthy', { apiCallsCount: 5 });
    let health = tm.getHealth('plugin-a');
    expect(health?.status).toBe('healthy');
    expect(health?.apiCallsCount).toBe(5);

    tm.reportHealth('plugin-a', 'degraded');
    health = tm.getHealth('plugin-a');
    expect(health?.warningCount).toBe(1);

    tm.reportHealth('plugin-a', 'error');
    health = tm.getHealth('plugin-a');
    expect(health?.errorCount).toBe(1);

    const allHealth = tm.getAllHealth();
    expect(allHealth.length).toBe(1);
    expect(tm.getHealth('non-existent')).toBeNull();
  });

  it('creates scoped telemetry instance for plugins', async () => {
    const tm = new TelemetryManager();
    const scoped = tm.createScoped('plugin-xyz');

    expect(scoped.isEnabled()).toBe(true);

    const event = await scoped.track('scoped_event', { test: true });
    expect(event?.pluginId).toBe('plugin-xyz');

    scoped.recordMetric('cpu_usage', 15, '%');
    expect(tm.getMetricsSummary('plugin-xyz').cpu_usage.avg).toBe(15);

    scoped.reportHealth('healthy');
    expect(tm.getHealth('plugin-xyz')?.status).toBe('healthy');

    const stop = scoped.startTimer('db_query');
    stop();
    expect(tm.getMetricsSummary('plugin-xyz').db_query.count).toBe(1);
  });

  it('enables, disables and destroys properly', () => {
    const tm = new TelemetryManager();
    tm.disable();
    expect(tm.isEnabled()).toBe(false);

    tm.enable();
    expect(tm.isEnabled()).toBe(true);

    tm.destroy();
    expect(tm.isEnabled()).toBe(false);
  });
});
