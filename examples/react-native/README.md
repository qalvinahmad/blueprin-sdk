# React Native consumer example

The SDK's headless core, clients, plugins, and connectors can run in React
Native. The web-only `ui` subpath is not intended for React Native rendering.

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';

const storageAdapter = {
  get: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value === null ? undefined : JSON.parse(value);
  },
  set: (key: string, value: unknown) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),
  remove: (key: string) => AsyncStorage.removeItem(key),
};

export async function createSdk() {
  const sdk = new BlueprinSDK({
    appId: 'blueprin-mobile',
    storageAdapter,
    telemetryEnabled: false,
  });
  await sdk.init();
  return sdk;
}
```

Install `@react-native-async-storage/async-storage` in the app and use
short-lived session tokens for authenticated API calls.
