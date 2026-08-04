# Permissions & Sandbox Model

Blueprin SDK introduces a strict Sandbox and Permissions model to ensure third-party plugins cannot maliciously or accidentally access data, modify state, or listen to events they shouldn't.

By default, plugins have **zero permissions**. To access SDK features like Storage, Events, or Hooks, a plugin must explicitly declare its required scopes in the manifest's `permissions` array.

## Available Permission Scopes

| Scope | Capability | API Access |
|---|---|---|
| `storage:read` | Can read data from its scoped storage | `ctx.storage.get`, `ctx.storage.has` |
| `storage:write` | Can write and delete data from its scoped storage | `ctx.storage.set`, `ctx.storage.remove` |
| `events:listen` | Can subscribe to events emitted by the host or other plugins | `ctx.events.on` |
| `events:emit` | Can broadcast events to the host or other plugins | `ctx.events.emit` |
| `hooks:register` | Can register interceptors for core calculation/data flows | `ctx.hooks.register` |

*(Note: Executing hooks via `ctx.hooks.execute` does not require permissions as it is scoped internally, but registering an interceptor into the global chain does).*

## Manifest Declaration

When defining your plugin, include the `permissions` array:

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-secure-plugin',
  name: 'Secure Plugin',
  version: '1.0.0',
  permissions: ['storage:read', 'storage:write', 'events:listen'],
  activate(ctx) {
    // Activation logic
  }
});
```

## Security Enforcement

The SDK enforces these permissions using a strict **Proxy** layer applied to the plugin context (`ctx`). 

If your plugin attempts to use an API without the corresponding permission scope, the SDK will throw a hard `Error` and block the execution.

### Example Violation

```javascript
export default definePlugin({
  id: 'rogue-plugin',
  name: 'Rogue Plugin',
  version: '1.0.0',
  permissions: ['storage:read'], // Forgot storage:write!

  async activate(ctx) {
    // ❌ This will throw: Error: Permission denied: "storage:write" required
    await ctx.storage.set('secret', '12345'); 
  }
});
```

## Why Sandbox?

1. **Security**: Users can install plugins with confidence, knowing a simple "UI Theme" plugin cannot secretly read their RAB calculations (`events:listen`) or export their budget data.
2. **Stability**: Prevents accidental data overwrites or endless event loops caused by poorly written third-party code.
3. **Marketplace Trust**: When submitting to the Blueprin Marketplace, the required permissions are displayed to the user prior to installation (e.g. "This plugin wants to: Read your storage, Listen to your events").
