# UI Injection

Blueprin SDK provides a declarative way for plugins to inject user interface components into the main Blueprin Web App. Instead of manipulating the DOM directly (which is insecure and error-prone), plugins declare their UI components in their manifest. 

The Host App (Blueprin App) reads this manifest and safely renders the components using its own design system and routing engine.

## The `ui` Object

The `ui` object in your plugin manifest supports three primary arrays: `menus`, `panels`, and `widgets`.

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-ui-plugin',
  name: 'My UI Plugin',
  version: '1.0.0',
  ui: {
    // 1. Navigation Menus
    menus: [
      { 
        label: 'Advanced Settings', 
        path: '/settings/advanced', 
        icon: 'gear' // Relies on Host App icon set
      }
    ],
    // 2. Full-page Panels
    panels: [
      { 
        id: 'reporting-panel', 
        component: 'ReportingPanelComponent' // String identifier for the React/Vue component 
      }
    ],
    // 3. Small Widgets (e.g. Dashboard cards)
    widgets: [
      { 
        id: 'quick-stats', 
        component: 'StatsWidget',
        position: 'dashboard-top-right' 
      }
    ]
  },
  activate(ctx) {
    // Logic
  }
});
```

## How it works

1. **Registration**: When your plugin is registered via `sdk.plugins.register()`, the SDK parses and stores your `ui` manifest.
2. **Extraction**: The Host App uses the `PluginManager` to extract all active UI components:
   ```javascript
   const menus = sdk.plugins.getUiComponents('menus');
   // Returns: [{ label: '...', path: '...', icon: '...', pluginId: 'my-ui-plugin' }]
   ```
3. **Rendering**: The Host App dynamically maps these extracted configurations to its internal routing table or dashboard grid. Because the Host App handles the rendering, your injected menus will automatically match Blueprin's exact design system (dark mode, typography, animations) without you writing a single line of CSS!

## Best Practices

- **Component Mapping**: Since plugins run in an isolated environment, you usually cannot pass actual React or Vue instances directly through the manifest. Pass a string identifier (e.g. `ReportingPanelComponent`) and ensure your plugin exports or registers that component in a way the Host App can dynamically import it.
- **Keep it minimal**: Do not clutter the user's dashboard. Use `menus` for deep links and `widgets` sparingly.
