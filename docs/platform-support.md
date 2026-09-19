# Platform support

The SDK separates platform-neutral services from rendering and transport
capabilities. The supported matrix is:

| Target | Status | Supported surface |
| --- | --- | --- |
| Web/Vite/React | Supported | Core, clients, plugins, connectors, IndexedDB, Web Crypto, WebSocket/WebRTC |
| Next.js/SSR | Supported with boundaries | Initialize browser-only storage, WebRTC, and UI after mount |
| React Native | Supported for headless SDK | Core, clients, plugins, connectors, fetch, WebSocket; provide an async storage driver |
| Browser extension | Supported with host integration | Core, plugins, connectors, extension storage driver, content/background messaging |
| Node.js | Supported | Core, clients, connectors, server webhook verification, filesystem/database adapters supplied by the host |
| React UI components | Web-only | `@alvinahmad/blueprin-sdk/ui` uses DOM elements and Tailwind class names |

## React Native

React Native does not provide `window`, `localStorage`, or IndexedDB. Use an
AsyncStorage-compatible driver instead of persisting SDK data in memory:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';

const prefix = 'blueprin_sdk:';
const storageAdapter = {
  get: (key: string) => AsyncStorage.getItem(key).then(value => value ? JSON.parse(value) : undefined),
  set: (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => AsyncStorage.removeItem(key),
  clear: () => AsyncStorage.clear(),
};

const sdk = new BlueprinSDK({ appId: 'mobile-app', storageAdapter });
```

Use short-lived bearer tokens or `tokenProvider`; do not bundle a privileged
API key in a mobile application. Native voice calling still requires the
platform WebRTC package and an application-owned signaling/STUN/TURN service.

## Plugins, extensions, and connectors

- **Plugins** use `definePlugin` and are host-controlled; they are platform
  neutral unless they render the web UI module.
- **Extensions** use `defineExtension`; browser extension hosts should route
  privileged network calls through the background/service-worker context.
- **Connectors** use `defineConnector`/`BaseConnector`; credentials should be
  supplied by the host at runtime and never embedded in a published plugin.
- **Web UI** and **React Native UI** should be separate presentation layers
  over the same headless SDK clients.
