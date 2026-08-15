# CLI Tool

The `plugin-cli.mjs` is a Node.js CLI tool for building, registering, and submitting Blueprin plugins from the command line.

## Quick Start

```bash
# Scaffold a new plugin
node scripts/plugin-cli.mjs init

# Register to marketplace
node scripts/plugin-cli.mjs create

# Submit for review
node scripts/plugin-cli.mjs submit my-plugin

# Check status
node scripts/plugin-cli.mjs status my-plugin
```

## Installation

No installation needed — the CLI is bundled with the Blueprin SDK at `scripts/plugin-cli.mjs`.

```bash
# Run directly with Node
node scripts/plugin-cli.mjs <command>

# Or make it executable
chmod +x scripts/plugin-cli.mjs
./scripts/plugin-cli.mjs <command>
```

## Commands

### `init` — Scaffold New Plugin

Interactive wizard that generates a new plugin project with TypeScript, esbuild, and proper package.json.

```bash
node scripts/plugin-cli.mjs init
```

**Prompts:**
| Prompt | Default | Description |
|--------|---------|-------------|
| Plugin name | `my-blueprin-plugin` | Display name (slug auto-generated) |
| Author | `Developer` | Author name |
| Description | `A Blueprin plugin` | Short description |
| Version | `1.0.0` | Semver version |
| Category | `productivity` | Productivity, Integration, Analytics, Automation |

**Generated structure:**

```
my-plugin/
├── package.json          # @blueprin/my-plugin
├── tsconfig.json         # TypeScript config
├── build.mjs             # esbuild: ESM + CJS
├── README.md             # Generated docs
└── src/
    └── index.ts          # definePlugin() template
```

**Note:** Requires an interactive terminal (readline). Piped input or non-TTY environments won't work.

---

### `create` — Register Plugin to Marketplace

Registers a new plugin entry in the database via `POST /api/plugins/create`.

```bash
node scripts/plugin-cli.mjs create
```

**Auth:** None (public, rate-limited)

**Prompts:**
| Prompt | Default | Description |
|--------|---------|-------------|
| Plugin name | — | Display name |
| Slug | auto-generated | URL-safe identifier |
| Author | — | Author name |
| Description | — | What the plugin does |
| Version | `1.0.0` | Semver version |
| Category | `productivity` | Category |
| Bundle URL | `https://cdn.example.com/plugin.js` | Where your built plugin is hosted |
| Features | — | Comma-separated features |
| Requirements | — | Comma-separated permissions |
| Tags | — | Comma-separated tags |

**Example output:**
```
✅ Plugin created successfully!
   Plugin ID:    abc12345-uuid
   Slug:         my-plugin
   Status:       draft
   Bundle URL:   https://cdn.example.com/plugin.js

   Next steps:
   • Host your built plugin at: https://cdn.example.com/plugin.js
   • Submit for review: node scripts/plugin-cli.mjs submit my-plugin
```

---

### `upload` — Update Plugin Bundle URL

Updates the `bundle_url` and optionally `version` of an existing plugin.

```bash
node scripts/plugin-cli.mjs upload my-plugin
```

**Auth:** Admin token (`BLUEPRIN_AUTH_TOKEN`)

**Prompts:**
| Prompt | Default | Description |
|--------|---------|-------------|
| New bundle URL | — | New URL for the built plugin |
| New version | (unchanged) | Optional version bump |

---

### `submit` — Submit Plugin for Review

Submits a draft plugin for admin review.

```bash
node scripts/plugin-cli.mjs submit my-plugin
```

**Auth:** Plugin owner token (`BLUEPRIN_AUTH_TOKEN`)

**Prompts:**
| Prompt | Default | Description |
|--------|---------|-------------|
| Submission notes | (empty) | Notes for the admin reviewer |

**Example output:**
```
✅ Plugin submitted for review!
   Slug:    my-plugin
   Status:  pending_review

   The admin will review your plugin.
   Check status: node scripts/plugin-cli.mjs status my-plugin
```

---

### `status` — Check Plugin Status

Shows current review status and metadata for a plugin.

```bash
node scripts/plugin-cli.mjs status my-plugin
```

**Auth:** None (public endpoint)

**Example output:**
```
Plugin Status: my-plugin
─────────────────────────────────────
Name:        My Plugin
Author:      John Doe
Version:     1.0.0
Status:      approved
Category:    productivity
Created:     2026-08-15

Submission Notes:
- Ready for production use
- Tested with 3 active projects
```

**Status values:**
| Status | Description |
|--------|-------------|
| `draft` | Plugin created but not yet submitted |
| `pending_review` | Submitted, waiting for admin review |
| `approved` | Reviewed and signed — ready to publish |
| `rejected` | Not approved — check submission_notes |
| `active` | Published in the marketplace |
| `suspended` | Temporarily disabled |

---

### `list` — List All Plugins

Lists all plugins with filtering options.

```bash
node scripts/plugin-cli.mjs list                # all
node scripts/plugin-cli.mjs list --status draft  # filter by status
```

**Auth:** Admin token (`BLUEPRIN_AUTH_TOKEN`)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLUEPRIN_API_URL` | No | API base URL. Default: `http://localhost:3000` |
| `BLUEPRIN_AUTH_TOKEN` | For submit/upload/list | Bearer token for authenticated endpoints |

### Getting Your Auth Token

1. Sign in to Blueprin
2. Open browser DevTools → Application → Cookies
3. Copy the Supabase auth token, or

```bash
# Via Supabase CLI
supabase projects list
# Or via curl with your API key
curl https://your-project.supabase.co/auth/v1/token \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `Rate limited` | Too many requests | Wait 15 minutes |
| `Plugin already exists` | Slug taken | Use a different slug |
| `Invalid semver` | Bad version format | Use `X.Y.Z` format |
| `Authentication required` | Missing token | Set `BLUEPRIN_AUTH_TOKEN` |
| `Plugin not found` | Wrong slug | Check with `list` command |
| `Only owner can submit` | Wrong token | Use the owner's auth token |

---

## CI/CD Integration

The CLI can be automated in CI pipelines:

```yaml
# GitHub Actions example
- name: Build plugin
  run: npm run build

- name: Upload to CDN
  run: |
    wrangler r2 object put plugins/my-plugin.js \
      --file dist/index.mjs

- name: Submit for review
  env:
    BLUEPRIN_AUTH_TOKEN: ${{ secrets.BLUEPRIN_TOKEN }}
  run: |
    node scripts/plugin-cli.mjs upload my-plugin \
      --url "https://r2.example.com/plugins/my-plugin.js"
    node scripts/plugin-cli.mjs submit my-plugin \
      --notes "Automated release v${{ github.ref_name }}"
```

---

## Troubleshooting

### CLI hangs on `init`

The `init` command uses readline for interactive input. If it hangs:
- Make sure you're running in a real terminal (not piped input)
- Try `TERM=xterm node scripts/plugin-cli.mjs init`

### Auth token expired

Supabase tokens expire after 1 hour. Refresh by signing in again and copying the new token.

### Rate limited

The `/api/plugins/create` endpoint is rate-limited to 10 requests per 15 minutes. If you hit the limit, wait and try again. This prevents spam in the marketplace.
