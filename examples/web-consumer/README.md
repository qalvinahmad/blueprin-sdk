# Web consumer example

This example shows the recommended browser configuration. Keep privileged API
keys on a server and issue a short-lived token to the browser.

```ts
import { BlueprinClient } from '@alvinahmad/blueprin-sdk/client';
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';

const client = new BlueprinClient({
  baseUrl: import.meta.env.VITE_BLUEPRIN_API_URL,
  tokenProvider: async () => {
    const response = await fetch('/api/blueprin/session');
    if (!response.ok) throw new Error('Unable to obtain Blueprin session');
    return (await response.json()).token;
  },
});

const sdk = new BlueprinSDK({
  appId: 'web-app',
  telemetryEnabled: false,
});

await sdk.init();
const projects = await client.plans.list();
```

For Next.js, create the SDK in a client component or inside `useEffect`; do not
initialize browser-only features during server rendering. For Vite, build with
the production mode and verify the package with `npm run test:package`.
