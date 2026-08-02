# Getting Started

## Prerequisites

- Node.js 18+
- npm, pnpm, or yarn

## Installation

```bash
npm install @blueprin/sdk
```

## Basic Setup

```javascript
import { BlueprinSDK } from '@blueprin/sdk';

// Initialize the SDK
const sdk = new BlueprinSDK({
  appId: 'my-app',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  debug: true,
});

await sdk.init();
```

## Registering a Plugin

```javascript
import { definePlugin } from '@blueprin/sdk';

await sdk.plugins.register(
  definePlugin({
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    activate(ctx) {
      ctx.logger.info('Plugin activated!');
      return { api: {} };
    },
  })
);

// Activate all registered plugins
await sdk.plugins.activateAll();
```

## Using Events

```javascript
// Subscribe to events
sdk.events.on('blueprin:project:created', (data) => {
  console.log('New project:', data.project.name);
});

// Emit custom events
sdk.events.emit('my-plugin:data-updated', { count: 42 });
```

## Using Hooks

```javascript
// Register a hook
sdk.hooks.register('blueprin:after:rab:calculate', (data) => {
  console.log('RAB calculated:', data.result.total);
  return data; // Return modified data
});
```

## Using Storage

```javascript
// Store data
await sdk.storage.set('my-key', { hello: 'world' });

// Retrieve data
const data = await sdk.storage.get('my-key');
```

## Using Domain Clients

```javascript
// Project operations
const projects = await sdk.plugins.getActiveInstances();

// Material operations (requires plugin context)
const materials = await materialClient.list(projectId, { category: 'BAHAN' });

// RAB calculations
const rabResult = await rabClient.calculate(projectId);
console.log('Total:', rabResult.total);
```

## Next Steps

- [Plugin Development](../plugin-development/) - Build your first plugin
- [Hooks & Events](../hooks/) - Understand the event system
- [UI Components](../ui-components/) - Build consistent plugin UIs
- [Storage](../storage/) - Persist plugin data
- [Connectors](../connectors/) - Integrate external services
