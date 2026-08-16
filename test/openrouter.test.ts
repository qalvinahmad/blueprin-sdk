import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenRouterClient } from '../lib/src/openrouter/index.js';

describe('OpenRouterClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('throws error when initialized without apiKey', () => {
    expect(() => new OpenRouterClient({ apiKey: '' })).toThrow('OpenRouter API key must be provided');
  });

  it('correctly fetches credits', async () => {
    const mockData = {
      data: {
        total_credits: 100.5,
        total_usage: 25.75,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.getCredits();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (globalThis.fetch as any).mock.calls[0][0];
    expect(calledUrl).toContain('/credits');
    expect(result.totalCredits).toBe(100.5);
    expect(result.totalUsage).toBe(25.75);
    expect(result.balance).toBe(74.75);
  });

  it('correctly fetches activity', async () => {
    const mockData = {
      data: [
        {
          date: '2025-08-24',
          model: 'openai/gpt-4.1',
          usage: 0.015,
          requests: 5,
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.getActivity({ date: '2025-08-24' });

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe('openai/gpt-4.1');
  });

  it('correctly fetches models', async () => {
    const mockData = {
      data: [
        {
          id: 'openai/gpt-4.1',
          name: 'GPT-4.1',
          pricing: { prompt: 0.000002, completion: 0.000008, image: 0 },
          context_length: 1048576,
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.getModels();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('openai/gpt-4.1');
  });

  it('correctly fetches image models', async () => {
    const mockData = {
      data: [
        {
          id: 'black-forest-labs/flux-schnell',
          name: 'FLUX Schnell',
          architecture: {
            input_modalities: ['text'],
            output_modalities: ['image'],
          },
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.getImageModels();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('black-forest-labs/flux-schnell');
  });

  it('correctly fetches generation stats', async () => {
    const mockData = {
      data: {
        id: 'gen-123',
        model: 'openai/gpt-4.1',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 4,
          total_tokens: 14,
          cost: 0.00014,
        },
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.getGenerationStats('gen-123');

    expect(result.id).toBe('gen-123');
    expect(result.usage.cost).toBe(0.00014);
  });

  it('correctly calls chat completion', async () => {
    const mockData = {
      choices: [
        {
          message: {
            content: 'Hello! How can I help you?',
          },
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.chatCompletion({
      model: 'openai/gpt-4.1-mini',
      messages: [{ role: 'user', content: 'Hello!' }],
    });

    expect(result.choices[0].message.content).toBe('Hello! How can I help you?');
  });

  it('correctly generates image', async () => {
    const mockData = {
      data: [
        {
          url: 'https://example.com/image.png',
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.generateImage({
      prompt: 'A beautiful house',
      model: 'black-forest-labs/flux-schnell',
    });

    expect(result.url).toBe('https://example.com/image.png');
  });

  it('correctly generates embeddings', async () => {
    const mockData = {
      data: [
        {
          embedding: [0.1, 0.2, 0.3],
          index: 0,
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.generateEmbeddings({
      input: 'Hello world',
    });

    expect(result).toHaveLength(1);
    expect(result[0].embedding).toEqual([0.1, 0.2, 0.3]);
  });

  it('handles 401 Unauthorized by throwing error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-invalid' });
    await expect(client.getCredits()).rejects.toThrow('Invalid API key');
  });

  it('handles 429 Rate Limit with retry', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 429,
          headers: new Headers({ 'Retry-After': '0' }),
          text: async () => JSON.stringify({ error: { message: 'Rate limit exceeded' } }),
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => JSON.stringify({ data: { total_credits: 100, total_usage: 25 } }),
      };
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789', maxRetries: 1 });
    const result = await client.getCredits();

    expect(result.totalCredits).toBe(100);
    expect(callCount).toBe(2);
  });

  it('formats cost correctly', () => {
    expect(OpenRouterClient.formatCost(0.005)).toBe('$5.00K');
    expect(OpenRouterClient.formatCost(0.05)).toBe('$0.05');
    expect(OpenRouterClient.formatCost(1.5)).toBe('$1.50');
  });

  it('formats tokens correctly', () => {
    expect(OpenRouterClient.formatTokens(500)).toBe('500');
    expect(OpenRouterClient.formatTokens(1500)).toBe('1.5K');
    expect(OpenRouterClient.formatTokens(1500000)).toBe('1.5M');
  });

  it('tests API key validity', async () => {
    const mockData = {
      data: {
        total_credits: 100,
        total_usage: 25,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789' });
    const result = await client.testApiKey();

    expect(result.valid).toBe(true);
    expect(result.credits).toBe(100);
    expect(result.usage).toBe(25);
  });

  it('returns invalid when testApiKey fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: { message: 'Invalid API key' } }),
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-invalid' });
    const result = await client.testApiKey();

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  it('handles custom site name and URL', async () => {
    const mockData = {
      data: {
        total_credits: 100,
        total_usage: 25,
      },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new OpenRouterClient({
      apiKey: 'sk-or-test123456789',
      siteName: 'MyApp',
      siteUrl: 'https://myapp.com',
    });
    await client.getCredits();

    const calledOpts = (globalThis.fetch as any).mock.calls[0][1];
    expect(calledOpts.headers['X-Title']).toBe('MyApp');
    expect(calledOpts.headers['HTTP-Referer']).toBe('https://myapp.com');
  });

  it('handles network error with retry', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Network error');
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        text: async () => JSON.stringify({ data: { total_credits: 100, total_usage: 25 } }),
      };
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789', maxRetries: 1, retryDelayMs: 10 });
    const result = await client.getCredits();

    expect(result.totalCredits).toBe(100);
    expect(callCount).toBe(2);
  });

  it('throws after max retries exceeded', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      throw new Error('Network error');
    });

    const client = new OpenRouterClient({ apiKey: 'sk-or-test123456789', maxRetries: 0 });
    await expect(client.getCredits()).rejects.toThrow('Network error');
  });
});
