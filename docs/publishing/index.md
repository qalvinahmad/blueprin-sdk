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
    "@blueprin/sdk": ">=0.1.0"
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

1. Create a GitHub repository for your plugin
2. Add the `blueprin-plugin` topic to your repo
3. Fill in the plugin metadata in `package.json`:

```json
{
  "blueprin": {
    "type": "plugin",
    "id": "my-plugin",
    "minSdkVersion": "0.1.0",
    "category": "productivity",
    "icons": {
      "128": "./icon.png"
    },
    "screenshots": ["./screenshot.png"]
  }
}
```

4. Submit a PR to the [awesome-blueprint](https://github.com/qalvinahmad/awesome-blueprint) repository

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
