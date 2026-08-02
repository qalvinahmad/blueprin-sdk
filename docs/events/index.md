# Events

The event bus provides pub/sub communication between plugins.

## Subscribing to Events

```javascript
// Subscribe
ctx.events.on('blueprin:project:created', (data) => {
  console.log('Project created:', data.project);
});

// Subscribe once
ctx.events.once('blueprin:auth:signed:in', (data) => {
  console.log('First sign-in:', data.user);
});

// Unsubscribe
const unsubscribe = ctx.events.on('blueprin:project:created', handler);
unsubscribe(); // Stop listening
```

## Emitting Events

```javascript
// Emit a built-in event
ctx.events.emit('blueprin:rab:calculated', {
  total: 5000000,
  projectId: 'abc-123',
});

// Emit a custom event
ctx.events.emit('my-plugin:export-completed', {
  format: 'pdf',
  filename: 'report.pdf',
});
```

## Available Events

### Plugin Events
- `blueprin:plugin:registered`
- `blueprin:plugin:activated`
- `blueprin:plugin:deactivated`
- `blueprin:plugin:error`

### Project Events
- `blueprin:project:created`
- `blueprin:project:updated`
- `blueprin:project:deleted`
- `blueprin:project:archived`

### Material Events
- `blueprin:material:created`
- `blueprin:material:updated`
- `blueprin:material:deleted`
- `blueprin:material:imported`

### RAB Events
- `blueprin:rab:item:added`
- `blueprin:rab:item:updated`
- `blueprin:rab:item:removed`
- `blueprin:rab:expanded`
- `blueprin:rab:calculated`

### Schedule Events
- `blueprin:schedule:generated`
- `blueprin:schedule:updated`
- `blueprin:task:created`
- `blueprin:task:updated`
- `blueprin:task:completed`

### Marketplace Events
- `blueprin:marketplace:order:created`
- `blueprin:marketplace:order:updated`
- `blueprin:marketplace:order:completed`
- `blueprin:marketplace:rfq:received`
- `blueprin:marketplace:rfq:quoted`
- `blueprin:marketplace:partner:registered`
- `blueprin:marketplace:partner:verified`

### Auth Events
- `blueprin:auth:signed:in`
- `blueprin:auth:signed:out`
- `blueprin:auth:session:refreshed`

### UI Events
- `blueprin:ui:sidebar:toggle`
- `blueprin:ui:modal:open`
- `blueprin:ui:modal:close`
- `blueprin:ui:theme:changed`
- `blueprin:ui:toast:show`

## Event Priorities

```javascript
// Higher priority = called first
ctx.events.on('blueprin:rab:calculated', handler, { priority: 10 });
```

## Custom Events

You can define and emit your own events:

```javascript
// Define convention: your-plugin:event-name
ctx.events.emit('my-plugin:data-synced', {
  count: 42,
  timestamp: Date.now(),
});

// Other plugins can listen
ctx.events.on('my-plugin:data-synced', (data) => {
  console.log('Data synced:', data.count);
});
```
