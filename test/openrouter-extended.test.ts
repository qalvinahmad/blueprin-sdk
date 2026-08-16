import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient } from '../lib/src/openrouter/openrouter-client.ts';

describe('OpenRouterClient Extended', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('handles image models and generation stats', async () => {
    const mockImageModels = { data: [{ id: 'flux', name: 'Flux.1' }] };
    const mockStats = { data: { id: 'gen-123', total_cost: 0.002 } };

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/images/models')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: async () => JSON.stringify(mockImageModels),
        });
      }
      if (url.includes('/generation?id=')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: async () => JSON.stringify(mockStats),
        });
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test' });
    const imgModels = await client.getImageModels();
    expect(imgModels[0].id).toBe('flux');

    const stats = await client.getGenerationStats('gen-123');
    expect(stats.id).toBe('gen-123');
  });

  it('performs chat completions with options and response_format', async () => {
    const mockResponse = {
      id: 'chat-1',
      choices: [{ message: { role: 'assistant', content: 'Hello!' } }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockResponse),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test' });
    const response = await client.chatCompletion({
      messages: [{ role: 'user', content: 'Hi' }],
      response_format: { type: 'json_object' },
      stream: false,
      temperature: 0.5,
      max_tokens: 100,
    });

    expect(response.id).toBe('chat-1');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const bodySent = JSON.parse((globalThis.fetch as any).mock.calls[0][1].body);
    expect(bodySent.response_format).toEqual({ type: 'json_object' });
    expect(bodySent.temperature).toBe(0.5);
  });

  it('generates images with full options', async () => {
    const mockImgData = {
      data: [{ url: 'https://example.com/img.png' }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockImgData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test' });
    const img = await client.generateImage({
      prompt: 'A modern blueprint',
      negative_prompt: 'blurry',
      width: 512,
      height: 512,
      steps: 25,
      guidance: 7.5,
      seed: 42,
    });

    expect(img.url).toBe('https://example.com/img.png');
    const bodySent = JSON.parse((globalThis.fetch as any).mock.calls[0][1].body);
    expect(bodySent.negative_prompt).toBe('blurry');
    expect(bodySent.seed).toBe(42);
  });

  it('generates embeddings for string and array inputs', async () => {
    const mockEmbeddings = {
      data: [{ object: 'embedding', embedding: [0.1, 0.2], index: 0 }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockEmbeddings),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test' });
    const embeddings = await client.generateEmbeddings({
      input: 'sample text',
    });

    expect(embeddings.length).toBe(1);
    expect(embeddings[0].embedding).toEqual([0.1, 0.2]);
  });

  it('handles 429 rate limits and retries with backoff', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '0' }),
          text: async () => JSON.stringify({ error: { message: 'Rate limit' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => JSON.stringify({ data: { total_credits: 10, total_usage: 1 } }),
      });
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test', maxRetries: 2, retryDelayMs: 10 });
    const credits = await client.getCredits();
    expect(credits.totalCredits).toBe(10);
    expect(callCount).toBe(2);
  });

  it('handles general HTTP error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: { message: 'Server crashed' } }),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test', maxRetries: 0 });
    await expect(client.getCredits()).rejects.toThrow('Server crashed');
  });

  it('handles non-JSON error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      headers: new Headers(),
      text: async () => 'Bad Gateway',
    });

    const client = new OpenRouterClient({ apiKey: 'sk-test', maxRetries: 0 });
    await expect(client.getCredits()).rejects.toThrow('HTTP error 502');
  });
});
