# Developer Portal

The Developer Portal is a visual interface for creating and managing Blueprin plugins without writing code. It lives at `/home/developer` in the Blueprin app.

## Overview

The portal provides a 4-step wizard for plugin creation and a dashboard for tracking submission status.

```
┌──────────────────────────────────────────────────────┐
│  Developer Portal                                     │
├──────────────────────────────────────────────────────┤
│  [Submit Plugin]  [My Plugins]                        │
│                                                       │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │
│  │ 1.   │→│ 2.   │→│ 3.   │→│ 4.   │                │
│  │Bundle│ │ Info │ │Detail│ │Review│                │
│  └──────┘ └──────┘ └──────┘ └──────┘                │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │  [drag & drop zone]                              │  │
│  │  ┌───────────────────────────────────────────┐  │  │
│  │  │  Drop your plugin bundle here             │  │  │
│  │  │  or paste a URL below                      │  │  │
│  │  └───────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │  ── or paste a CDN URL ──                        │  │
│  │  [________________________]                      │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Accessing the Portal

Navigate to `/home/developer` in the Blueprin app. The page is protected — you must be signed in.

## Submit Plugin Wizard

### Step 1: Bundle Upload

Upload your plugin bundle via:

**Option A — Drag & Drop:**
- Drag a `.js` or `.mjs` file onto the upload zone
- File is validated for type and size (max 10MB)
- Animated feedback with Framer Motion
- File name and size shown on success

**Option B — CDN URL:**
- Paste a URL in the input field below the drop zone
- URL is stored as `bundle_url` in the database
- The actual bundle is hosted by you (npm, Vercel, R2, etc.)

**Supported formats:**
| Format | Extension | Max Size |
|--------|-----------|----------|
| JavaScript Module | `.js`, `.mjs` | 10MB |

### Step 2: Plugin Info

| Field | Required | Description |
|-------|----------|-------------|
| Plugin name | Yes | Display name (e.g., "RAB Calculator Pro") |
| Slug | Auto-generated | URL-safe identifier (auto-filled from name) |
| Author | Yes | Your name or organization |
| Description | Yes | Short description (shown in marketplace cards) |
| Category | Yes | Productivity, Integration, Analytics, or Automation |

### Step 3: Details

| Field | Type | Description |
|-------|------|-------------|
| Full description | Textarea | Markdown supported — detailed docs |
| Features | Tag input | Comma-separated feature list |
| Requirements | Tag input | Permission scopes needed |
| Tags | Tag input | Searchable keywords |
| Repository URL | URL | GitHub/GitLab source |
| Homepage URL | URL | Documentation or landing page |
| Icon URL | URL | Plugin icon (PNG/SVG, 512x512 recommended) |
| Pricing | Select | Free / Premium / Subscription |

**Tag input behavior:**
- Type text, press Enter or comma to add
- Click × on tag to remove
- Tags are stored as JSON array

### Step 4: Review

Summary of all fields. Two actions:

- **Back** — Return to previous step to edit
- **Submit Plugin** — Creates the plugin via `POST /api/plugins/create`

**After submission:**
- Plugin is created with status `draft`
- Success notification shown
- `bundle_url` is preserved (even if it's a placeholder)
- Next step: Submit for review via CLI or wait for My Plugins integration

---

## My Plugins Dashboard

The **My Plugins** tab shows all plugins created through the portal or CLI.

### Plugin Card

Each plugin shows:
- **Name** and **slug**
- **Status badge** (Draft / Pending Review / Approved / Rejected)
- **Download count**
- **Verification badge** (if signed by admin)
- **Created date**
- **Last updated date**

### Status Badges

| Status | Badge Color | Description |
|--------|-------------|-------------|
| `draft` | Gray | Created but not submitted |
| `pending_review` | Yellow | Awaiting admin review |
| `approved` | Green | Signed and approved |
| `rejected` | Red | Not approved — check notes |
| `active` | Blue | Published in marketplace |
| `suspended` | Orange | Temporarily disabled |

### Filtering

Filter plugins by status using the status filter buttons above the plugin list.

---

## Technical Details

### API Endpoints Used

| Action | Endpoint | Auth |
|--------|----------|------|
| Create plugin | `POST /api/plugins/create` | None (rate-limited) |
| List plugins | `GET /api/plugins/admin` | Admin only |
| Submit for review | `POST /api/plugins/admin/{id}/submit` | Owner |
| Check status | `GET /api/plugins/{slug}` | None |

### State Management

The portal uses React state with `useState` hooks:

```javascript
const [step, setStep] = useState(0);           // 0-3: wizard steps
const [bundleFile, setBundleFile] = useState(null);
const [bundleUrl, setBundleUrl] = useState('');
const [formData, setFormData] = useState({...});
const [submitting, setSubmitting] = useState(false);
const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'plugins'
```

### File Handling

Files are validated client-side before submission:
- Type check: `.js` or `.mjs` only
- Size check: Max 10MB
- File info displayed: name, size (formatted to human-readable)

### Animations

Built with Framer Motion:
- Step transitions: fade + slide (200ms)
- Upload zone: spring animations on drag enter/leave
- Success: scale bounce (0 → 1)
- Tags: layout animations for add/remove
- Notifications: slide-in from top-right

---

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| `> 768px` | Side-by-side: left panel (form) + right panel (live preview) |
| `≤ 768px` | Stacked: form on top, preview below |
| `≤ 480px` | Full-width, compact spacing |

---

## Error States

| Error | UI Response |
|-------|-------------|
| File too large | Red border + "Max file size is 10MB" message |
| Invalid file type | Red border + "Only .js and .mjs files are supported" |
| API error | Toast notification with error message |
| Rate limited | "Too many requests. Try again in a few minutes." |
| Network error | "Connection failed. Check your network." |

---

## Integration with CLI

The Developer Portal and CLI are **two interfaces to the same system**:

```
Developer Portal ──→ POST /api/plugins/create ──→ Supabase
CLI create      ──→ POST /api/plugins/create ──→ Supabase

Developer Portal ──→ POST /api/plugins/admin/{id}/submit ──→ Supabase
CLI submit      ──→ POST /api/plugins/admin/{id}/submit ──→ Supabase

Developer Portal ──→ GET /api/plugins/{slug} ──→ Supabase
CLI status      ──→ GET /api/plugins/{slug} ──→ Supabase
```

Plugins created via either path appear in both the CLI `list` output and the Developer Portal's **My Plugins** dashboard.

---

## Future Improvements

Potential enhancements (not yet implemented):

- **Bundle diffing**: Show code changes between versions
- **Live preview**: Run plugin in sandbox before submitting
- **Analytics dashboard**: View usage stats, downloads, ratings
- **Collaboration**: Invite team members to manage plugins
- **Webhooks**: Notify on status changes
- **Auto-signing**: Sign plugins automatically via CI/CD
