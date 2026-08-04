# Hooks

Hooks allow you to intercept and modify data at specific points in the Blueprin lifecycle.

## Registering Hooks

```javascript
// In your plugin's activate() function
ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
  console.log('RAB calculated:', data.result.total);
  return data; // Must return data (or modified data)
});
```

## Before Hooks

Before hooks run before an action and can modify or cancel it:

```javascript
ctx.hooks.register('blueprin:before:project:create', (data) => {
  // Validate input
  if (!data.input.name) {
    throw new Error('Project name is required');
  }

  // Modify input
  return {
    ...data,
    input: {
      ...data.input,
      name: data.input.name.trim(),
    },
  };
});
```

## After Hooks

After hooks run after an action for side effects:

```javascript
ctx.hooks.register('blueprin:after:material:create', (data) => {
  // Log, sync, notify, etc.
  console.log('Material created:', data.material.name);

  // No need to return data for after hooks
});
```

## Hook Priorities

```javascript
// Higher priority = called first
ctx.hooks.register(hookName, handler, { priority: 10 });
```

## Available Hooks

### Project Hooks
- `blueprin:before:project:create`
- `blueprin:after:project:create`
- `blueprin:before:project:update`
- `blueprin:after:project:update`
- `blueprin:before:project:delete`
- `blueprin:after:project:delete`

### Material Hooks
- `blueprin:before:material:create`
- `blueprin:after:material:create`
- `blueprin:before:material:update`
- `blueprin:after:material:update`

### RAB Hooks
- `blueprin:before:rab:calculate`
- `blueprin:after:rab:calculate`
- `blueprin:before:rab:expand`
- `blueprin:after:rab:expand`

### Schedule Hooks
- `blueprin:before:schedule:generate`
- `blueprin:after:schedule:generate`
- `blueprin:before:task:complete`
- `blueprin:after:task:complete`

### Marketplace Hooks
- `blueprin:before:order:create`
- `blueprin:after:order:create`
- `blueprin:before:checkout`
- `blueprin:after:checkout`

### Export Hooks
- `blueprin:before:export`
- `blueprin:after:export`
- `blueprin:customize:report`

## Hook Patterns

### Validation

```javascript
import { HookPatterns } from '@alvinahmad/blueprin-sdk';

ctx.hooks.register(
  'blueprin:before:rab:calculate',
  HookPatterns.validator(
    (data) => data.projectId,
    'Project ID is required'
  )
);
```

### Rate Limiting

```javascript
ctx.hooks.register(
  'blueprin:after:rab:calculate',
  HookPatterns.rateLimit(5000) // Max once per 5 seconds
);
```

### Data Transformation

```javascript
ctx.hooks.register(
  'blueprin:after:rab:calculate',
  HookPatterns.transformer((data) => ({
    result: {
      ...data.result,
      totalFormatted: formatIDR(data.result.total),
    },
  }))
);
```
