# Connectors

Connectors bridge Blueprin with external services (WhatsApp, accounting software, payment gateways, etc.).

## Creating a Connector

```javascript
import { defineConnector } from '@alvinahmad/blueprin-sdk';

export default defineConnector({
  id: 'xero-connector',
  name: 'Xero Connector',
  version: '1.0.0',
  description: 'Sync data with Xero accounting',
  protocol: 'rest',

  async connect(config) {
    // Initialize connection
    this.client = new XeroClient(config.clientId, config.clientSecret);
    await this.client.authenticate(config.redirectUri);
    return this;
  },

  async disconnect() {
    this.client = null;
  },

  async onTest() {
    // Test connection
    return this.client.testConnection();
  },
});
```

## Using BaseConnector

For more control, extend `BaseConnector`:

```javascript
import { BaseConnector } from '@alvinahmad/blueprin-sdk';

class FingerprintConnector extends BaseConnector {
  static protocol = 'rest';

  #device;

  async connect(config) {
    this.#device = await FingerprintSDK.init({
      deviceId: config.deviceId,
      apiKey: config.apiKey,
    });

    return this;
  }

  async disconnect() {
    await this.#device?.close();
    this.#device = null;
  }

  async onTest() {
    return this.#device?.isConnected() ?? false;
  }

  // Custom methods
  async capture() {
    if (this.status !== 'connected') {
      throw new Error('Not connected');
    }
    return this.#device.capture();
  }

  async verify(templateId, sample) {
    return this.#device.verify(templateId, sample);
  }
}
```

## Connector Registry

```javascript
import { ConnectorRegistry } from '@alvinahmad/blueprin-sdk';

const registry = new ConnectorRegistry({ storage: sdk.storage });

// Register connector classes
registry.register(WhatsAppConnector);
registry.register(XeroConnector);
registry.register(FingerprintConnector);

// List available connectors
console.log(registry.list());
// [
//   { id: 'WhatsAppConnector', name: 'WhatsAppConnector', protocol: 'rest' },
//   { id: 'XeroConnector', name: 'XeroConnector', protocol: 'rest' },
//   { id: 'FingerprintConnector', name: 'FingerprintConnector', protocol: 'rest' },
// ]

// Create and connect
const xero = await registry.create('XeroConnector', {
  clientId: 'xxx',
  clientSecret: 'yyy',
  redirectUri: 'http://localhost:3000/callback',
});
```

## Connector Lifecycle

1. **Registered** - Connector class is registered
2. **Connecting** - `connect()` is being called
3. **Connected** - Ready to use
4. **Error** - Connection failed
5. **Disconnected** - After `disconnect()`

## Protocols

| Protocol | Description | Use Case |
|----------|-------------|----------|
| `rest` | HTTP/REST API | Most external services |
| `websocket` | WebSocket | Real-time data |
| `grpc` | gRPC | High-performance |
| `graphql` | GraphQL | Flexible queries |
| `custom` | Custom protocol | Specialized hardware |
