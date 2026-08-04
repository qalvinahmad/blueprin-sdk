# Publishing

## Package Setup

Your plugin should be an npm package:

```json
{
  "name": "@blueprin/my-plugin",
  "version": "1.0.0",
  "description": "My Blueprin plugin",
  "main": "index.js",
  "keywords": ["blueprin", "plugin"],
  "peerDependencies": {
    "@alvinahmad/blueprin-sdk": ">=0.1.0"
  }
}
```

## Publishing to npm

```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

## Publishing to Blueprin Marketplace

Blueprin now supports automated marketplace submissions directly via the SDK. You can build a UI element in your plugin to publish itself, or use a script during your CI/CD pipeline.

### Step 1: Prepare Manifest

Ensure your `package.json` contains valid metadata and your `definePlugin` manifest has `author` and `description` defined:

```javascript
export default definePlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  author: 'your-name',
  description: 'A great plugin'
  // ...
});
```

### Step 2: Trigger Submission

Your plugin (if it has `storage:write` and `events:emit` permissions) or the host application can trigger the submission:

```javascript
// Triggers validation and the pre-submission hook
const payload = await sdk.plugins.submitToMarketplace('my-plugin');
```

### Step 3: Pre-submission Hook (Optional)

If you need to sign your code or inject compiled assets before it hits the database, register a listener for `blueprin:before:plugin:submit`:

```javascript
ctx.hooks.register('blueprin:before:plugin:submit', (payload) => {
  payload.signature = myCryptoLibrary.sign(payload.manifest);
  return payload;
});
```

### Step 4: Host App Upload

The SDK does not talk to Supabase/REST APIs directly to keep the bundle small. Instead, it emits an event. The Blueprin Host Application listens to this event and performs the final upload:

```javascript
// (This happens in the host app, not your plugin)
sdk.events.on('blueprin:marketplace:plugin:submitted', async (payload) => {
  await supabase.from('marketplace_plugins').insert(payload);
});
```

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Changelog

Maintain a CHANGELOG.md:

```markdown
# Changelog

## [1.1.0] - 2026-08-02
### Added
- New feature X

### Fixed
- Bug Y

## [1.0.0] - 2026-07-01
### Added
- Initial release
```

## Checklist

Before publishing:

- [ ] Version bumped in `package.json`
- [ ] CHANGELOG.md updated
- [ ] README.md with usage examples
- [ ] Tests passing (`npm test`)
- [ ] No console.log in production code
- [ ] Peer dependencies specified
- [ ] License file included
