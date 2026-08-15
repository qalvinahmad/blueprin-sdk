# Publishing to Blueprin Marketplace

Blueprin supports two paths to publish plugins — choose whichever fits your workflow.

## Two Paths, One Result

```
Path 1: Code-First (CLI)        Path 2: Drag & Drop (UI)
─────────────────────────       ─────────────────────────
init → code → build             /home/developer
  → create → submit               → fill form → drag bundle
                                      → submit
         ↓                              ↓
    POST /api/plugins/create  ←  same API  →
         ↓
    POST /api/plugins/admin/{id}/submit
         ↓
    Admin review → approved → published
```

Both paths converge to the same API endpoints and database tables.

---

## Path 1: Software Engineer (Code-First via CLI)

This is the recommended path for developers who want full control over their plugin code.

### Prerequisites

- Node.js 18+
- Terminal / command line access
- A CDN or hosting for your plugin bundle (npm, Vercel, Cloudflare R2, etc.)

### Step 1: Scaffold Project

```bash
node scripts/plugin-cli.mjs init
```

This creates an interactive wizard that generates:

```
my-plugin/
├── package.json          # @blueprin/my-plugin, peer dep SDK
├── tsconfig.json
├── build.mjs             # esbuild: ESM + CJS bundles
├── README.md
└── src/
    └── index.ts          # definePlugin() template
```

**Note:** The `init` command requires an interactive terminal (readline). Piped input or non-TTY environments won't work — this is standard behavior for interactive CLI tools.

### Step 2: Develop Your Plugin

```bash
cd my-plugin
npm install
```

Edit `src/index.ts`:

```typescript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  author: 'Your Name',
  description: 'What your plugin does',

  permissions: ['storage:read', 'events:listen'],

  ui: {
    panels: [
      { id: 'my-panel', title: 'My Panel', icon: 'puzzle', position: 'tab' },
    ],
  },

  activate(ctx) {
    ctx.events.on('blueprin:project:created', (data) => {
      ctx.logger.log('Project created:', data.project?.name);
    });

    return { api: { getVersion: () => '1.0.0' } };
  },

  deactivate(instance) {
    // Cleanup
  },
});
```

### Step 3: Build

```bash
npm run build
```

Output goes to `dist/index.mjs` (ESM) and `dist/index.js` (CJS).

### Step 4: Host Bundle

Upload `dist/` to your CDN. Common options:

| Host | Command |
|------|---------|
| npm | `npm publish --access public` |
| Vercel | `vercel deploy dist/` |
| Cloudflare R2 | `wrangler r2 object put plugins/my-plugin.js --file dist/index.mjs` |
| GitHub Pages | Push dist/ to gh-pages branch |
| Any static host | Upload the file, get the URL |

### Step 5: Register to Marketplace

```bash
node scripts/plugin-cli.mjs create
```

Interactive prompts for: name, slug, author, description, version, category, bundle URL, tags.

**No auth required** — rate limited at 10 requests per 15 minutes.

### Step 6: Submit for Review

```bash
node scripts/plugin-cli.mjs submit my-plugin
```

Requires `BLUEPRIN_AUTH_TOKEN` environment variable (your Supabase bearer token).

### Step 7: Check Status

```bash
node scripts/plugin-cli.mjs status my-plugin
```

**No auth required** — uses the public `GET /api/plugins/{slug}` endpoint.

---

## Path 2: Non-Technical (Drag & Drop via UI)

This path is for users who prefer a visual interface without writing code.

### Step 1: Open Developer Portal

Navigate to `/home/developer` in the Blueprin app.

### Step 2: Upload Plugin Bundle

In the **Bundle** step:
- **Drag & drop** your `.js` or `.mjs` file onto the upload zone
- Or **paste a CDN URL** in the URL input field

The upload zone supports:
- File types: `.js`, `.mjs`
- Max size: 10MB
- Animated feedback with Framer Motion

### Step 3: Fill Plugin Info

In the **Info** step:
- Plugin name (auto-generates slug)
- Author name
- Short description
- Category (Productivity, Integration, Analytics, Automation)

### Step 4: Add Details

In the **Details** step:
- Full description (Markdown)
- Features (tag input)
- Permission requirements (tag input)
- Tags (tag input)
- Repository URL, Homepage URL
- Icon URL
- Pricing (Free / Premium / Subscription)

### Step 5: Review & Submit

In the **Review** step:
- Review all information
- Click **Submit Plugin**

The plugin is created via `POST /api/plugins/create` and appears in **My Plugins** tab.

### My Plugins Dashboard

The Developer Portal includes a **My Plugins** tab that shows:
- All plugins with their review status (Draft, Pending Review, Approved, Rejected)
- Download counts
- Verification status
- Filter by status

---

## API Reference

### POST /api/plugins/create

**Public endpoint** — no auth required, rate limited.

```
POST /api/plugins/create
Content-Type: application/json

{
  "slug": "my-plugin",
  "name": "My Plugin",
  "author": "Author Name",
  "description": "What it does",
  "version": "1.0.0",
  "category": "productivity",
  "bundle_url": "https://cdn.example.com/plugin.js",
  "features": ["Feature 1", "Feature 2"],
  "requirements": ["storage:read"],
  "tags": ["rab", "automation"],
  "pricing_type": "free"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "plugin_id": "uuid",
    "slug": "my-plugin",
    "name": "My Plugin",
    "status": "draft",
    "message": "Plugin berhasil dibuat dalam status draft.",
    "next_steps": [
      "Upload bundle plugin ke CDN dan update bundle_url",
      "Submit untuk review: POST /api/plugins/admin/{id}/submit"
    ]
  }
}
```

### GET /api/plugins/[slug]

**Public endpoint** — no auth required.

```
GET /api/plugins/my-plugin
GET /api/plugins/my-plugin?full=true    // includes review_status, bundle_url, etc.
```

### POST /api/plugins/admin/[id]/submit

**Requires auth** — plugin owner.

```
POST /api/plugins/admin/{plugin_id}/submit
Authorization: Bearer <token>

{
  "submission_notes": "Optional notes for admin"
}
```

### POST /api/plugins/admin/[id]/review

**Requires admin auth.**

```
POST /api/plugins/admin/{plugin_id}/review
Authorization: Bearer <admin_token>

{
  "action": "approved",    // or "rejected"
  "notes": "Optional notes"
}
```

When approved, the plugin is automatically signed with HMAC-SHA256.

### POST /api/plugins/verify

**Public endpoint** — verify plugin signature.

```
POST /api/plugins/verify
Content-Type: application/json

{
  "plugin_id": "uuid",
  "payload": { ... },
  "signature": "hex_string"
}
```

---

## CLI Commands Reference

| Command | Auth | Description |
|---------|------|-------------|
| `init` | None | Scaffold a new plugin project |
| `create` | None | Register plugin to marketplace |
| `upload <slug>` | Admin | Update plugin bundle URL |
| `submit <slug>` | Owner | Submit plugin for review |
| `status <slug>` | None | Check plugin status |
| `list` | Admin | List all plugins |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BLUEPRIN_API_URL` | No | API base URL (default: `http://localhost:3000`) |
| `BLUEPRIN_AUTH_TOKEN` | For submit/upload | Bearer token for authenticated endpoints |

---

## Plugin Lifecycle

```
┌─────────┐    create     ┌───────┐    submit     ┌────────────────┐
│  (new)  │ ────────────→ │ draft │ ────────────→ │ pending_review │
└─────────┘               └───────┘               └────────────────┘
                               ↑                        │
                               │                   admin review
                               │                        │
                          rejected ←─────────────────────┤
                               ↑                        ↓
                               └────────────────── approved
                                                       │
                                                  admin publish
                                                       │
                                                       ↓
                                                  ┌─────────┐
                                                  │ active  │
                                                  └─────────┘
```

---

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

---

## Checklist

Before publishing:

- [ ] Plugin code tested locally
- [ ] Bundle built and hosted on CDN
- [ ] `bundle_url` is accessible and valid
- [ ] Plugin manifest has `author` and `description`
- [ ] Version bumped in `package.json`
- [ ] README.md with usage examples
- [ ] No secrets or API keys in plugin code
- [ ] Plugin registered via CLI or Developer Portal
- [ ] Submitted for review
