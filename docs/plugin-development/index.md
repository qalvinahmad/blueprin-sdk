# Plugin Development

## Plugin Structure

A Blueprin plugin is a JavaScript module that exports a manifest object:

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  // Required
  id: 'unique-plugin-id',
  name: 'My Plugin',
  version: '1.0.0',

  // Optional Metadata
  description: 'What my plugin does',
  author: 'your-name',
  
  // Dependencies (Plugin IDs required before this plugin activates)
  dependencies: ['core-plugin', 'rab-advanced'],
  
  // Permissions (Requested access scopes)
  permissions: ['storage:write', 'rab:read'],

  // UI Entry Points (Rendered by host app)
  ui: {
    menus: [{ label: 'My Settings', path: '/settings/my-plugin', icon: 'gear' }],
    panels: [{ id: 'dashboard-widget', component: 'DashboardWidget' }]
  },

  // Required: activation function
  activate(ctx) {
    // ctx provides: sdk, pluginId, hooks, events, storage, logger, config

    // Return plugin API
    return {
      api: {
        myMethod: () => 'result',
      },
    };
  },

  // Optional: deactivation cleanup
  deactivate(instance) {
    // Cleanup resources
  },
});
```

## Plugin Context

The `ctx` object passed to `activate()` provides:

| Property | Type | Description |
|----------|------|-------------|
| `sdk` | `BlueprinSDK` | SDK instance |
| `pluginId` | `string` | Your plugin's ID |
| `hooks` | `HookRegistry` | Scoped hook registry |
| `events` | `EventBus` | Scoped event bus |
| `storage` | `StorageAdapter` | Scoped storage |
| `logger` | `Logger` | Plugin logger |
| `config` | `Object` | Plugin configuration |

## Plugin Lifecycle

1. **Registered** - Plugin manifest is stored
2. **Initializing** - `activate()` is being called
3. **Active** - Plugin is running
4. **Suspended** - Plugin is deactivated
5. **Error** - Plugin failed to activate
6. **Destroyed** - Plugin is removed

## Best Practices

### Always clean up in deactivate()

```javascript
activate(ctx) {
  const interval = setInterval(() => {
    // periodic task
  }, 5000);

  return {
    api: {},
    // Store cleanup reference
    _cleanup: () => clearInterval(interval),
  };
},

deactivate(instance) {
  instance._cleanup?.();
}
```

### Use scoped storage

```javascript
// Storage is automatically scoped to your plugin
await ctx.storage.set('settings', { theme: 'dark' });
// Stored at: blueprin_sdk:plugin:my-plugin:settings
```

### Register hooks with priorities

```javascript
// Higher priority = called first
ctx.hooks.register('blueprin:after:rab:calculate', handler, {
  priority: 10, // Called before default (0) handlers
});
```

### Use events for loose coupling

```javascript
// Emit events instead of calling other plugins directly
ctx.events.emit('blueprin:rab:calculated', { total: 5000000 });

// Other plugins can listen
ctx.events.on('blueprin:rab:calculated', (data) => {
  // React to the event
});
```
