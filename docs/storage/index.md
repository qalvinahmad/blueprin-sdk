# Storage

The storage adapter provides persistent storage for plugins using localStorage (with optional Supabase sync).

## Basic Usage

```javascript
// Store data
await ctx.storage.set('settings', { theme: 'dark', lang: 'id' });

// Retrieve data
const settings = await ctx.storage.get('settings');
// { theme: 'dark', lang: 'id' }

// Check if key exists
const exists = await ctx.storage.has('settings');

// Remove data
await ctx.storage.remove('settings');
```

## Scoped Storage

Each plugin's storage is automatically scoped:

```javascript
// Plugin "my-plugin" storing data:
await ctx.storage.set('cache', [1, 2, 3]);
// Actually stored at: blueprin_sdk:plugin:my-plugin:cache
```

This prevents conflicts between plugins.

## Common Patterns

### Caching API Responses

```javascript
async function fetchWithCache(ctx, key, fetcher, ttlMs = 60000) {
  const cached = await ctx.storage.get(`cache:${key}`);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }

  const data = await fetcher();
  await ctx.storage.set(`cache:${key}`, {
    data,
    timestamp: Date.now(),
  });

  return data;
}
```

### Plugin Settings

```javascript
// Load settings
const settings = await ctx.storage.get('settings') || {
  autoSync: true,
  notifications: true,
  theme: 'light',
};

// Save settings
async function updateSettings(ctx, patch) {
  const current = await ctx.storage.get('settings') || {};
  const updated = { ...current, ...patch };
  await ctx.storage.set('settings', updated);
  return updated;
}
```

### Data Migration

```javascript
const STORAGE_VERSION = 2;

async function migrateData(ctx) {
  const version = await ctx.storage.get('_version') || 1;

  if (version < STORAGE_VERSION) {
    // Migrate data
    const oldData = await ctx.storage.get('old_key');
    if (oldData) {
      await ctx.storage.set('new_key', transform(oldData));
      await ctx.storage.remove('old_key');
    }

    await ctx.storage.set('_version', STORAGE_VERSION);
  }
}
```

## Limitations

- **localStorage**: ~5MB per origin
- **No binary data**: Use JSON-serializable values only
- **Synchronous API**: localStorage is sync, but our API is async for future-proofing
- **No encryption**: Don't store sensitive data (use Supabase for that)
