# SDK API reference

The published package exposes the root entry point and the subpath modules listed
below. Each entry supports ESM, CommonJS, and TypeScript declarations.

| Import | Browser-oriented scope | Node |
| --- | --- | --- |
| `@alvinahmad/blueprin-sdk` | Core SDK, plugins, domain clients | 18+ |
| `/auth`, `/preferences`, `/storage` | Session and browser persistence | 18+ |
| `/ui` | React components | React 18+ |
| `/collab`, `/field`, `/takeoff`, `/bim` | Browser collaboration and project tools | 18+ |
| `/client`, `/openrouter`, `/connector`, `/webhook` | Network integrations | 18+ |
| `/formula`, `/rab`, `/report`, `/schemas`, `/utils` | Calculation and utility APIs | 18+ |
| `/ikk`, `/license`, `/telemetry` | Platform services | 18+ |
| `/webhook/browser` | Web Crypto webhook verification | Modern browsers |

The generated declaration files in `lib/**/*.d.ts` are the API contract. Run
`npm run build` to regenerate them and `npm run test:package` to verify that
every published export can be loaded by both ESM and CommonJS consumers.

## Browser and SSR notes

- `BlueprinClient` API keys are sent from the browser and must be scoped and
  rate-limited. Use a server-side proxy for privileged credentials.
- Browser persistence uses `localStorage`; applications storing large or
  sensitive data should use the IndexedDB-backed default and provide a
  server-backed adapter for durable synchronization. The SDK reports storage
  failures through the configured logger and `onError` callback.
- WebRTC and WebSocket features require HTTPS (or localhost), browser
  permissions, and an application-provided signaling/STUN/TURN service.
  Configure TURN credentials in `iceServers`; the SDK does not provide a TURN
  relay or signaling backend.
- Telemetry is disabled by default. Enable it only after application consent
  and ensure the ingest endpoint is owned by the application.
- Import `@alvinahmad/blueprin-sdk/webhook/browser` in browser bundles; it uses
  Web Crypto and does not require Node `crypto` or `Buffer`.
- Browser API and collaboration endpoints must use HTTPS/WSS in production.
  Configure CORS on the API/server origin to allow the application origin,
  `Authorization`/`Content-Type` headers, and `OPTIONS` preflight requests.
  Prefer short-lived bearer tokens; WebSocket tokens should also be short-lived
  because browser WebSocket connections cannot send custom authorization
  headers.
- Server-side rendering is supported for modules that do not access browser
  globals during import. Initialize browser-only features after mount.
