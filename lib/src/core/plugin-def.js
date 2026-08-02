/**
 * Plugin Definition Helpers
 *
 * Convenience functions for defining plugins, connectors, and extensions.
 */

/**
 * Define a Blueprin plugin
 *
 * @example
 * export default definePlugin({
 *   id: 'my-plugin',
 *   name: 'My Plugin',
 *   version: '1.0.0',
 *   description: 'A cool plugin for Blueprin',
 *   activate(ctx) {
 *     ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
 *       console.log('RAB calculated:', data.total);
 *     });
 *
 *     ctx.events.emit('blueprin:plugin:ready', { pluginId: 'my-plugin' });
 *
 *     return { api: { getSomething: () => 'something' } };
 *   },
 *   deactivate(instance) {
 *     console.log('Plugin deactivated');
 *   },
 * });
 *
 * @param {Object} manifest
 * @returns {Object} Plugin manifest
 */
export function definePlugin(manifest) {
  return {
    type: 'plugin',
    ...manifest,
  };
}

/**
 * Define a Blueprin connector
 *
 * Connectors bridge Blueprin with external services (e.g., WhatsApp, Xero, BCA).
 *
 * @example
 * export default defineConnector({
 *   id: 'whatsapp-connector',
 *   name: 'WhatsApp Connector',
 *   version: '1.0.0',
 *   description: 'Send notifications via WhatsApp',
 *   protocol: 'rest',
 *   async connect(config) {
 *     return { sendMessage: async (to, msg) => { ... } };
 *   },
 *   async disconnect(instance) {
 *     // cleanup
 *   },
 * });
 *
 * @param {Object} manifest
 * @returns {Object} Connector manifest
 */
export function defineConnector(manifest) {
  return {
    type: 'connector',
    protocol: manifest.protocol || 'rest',
    ...manifest,
  };
}

/**
 * Define a Blueprin extension
 *
 * Extensions add UI panels, routes, or features to the Blueprin app.
 *
 * @example
 * export default defineExtension({
 *   id: 'my-extension',
 *   name: 'My Extension',
 *   version: '1.0.0',
 *   description: 'Adds a custom dashboard panel',
 *   routes: [
 *     { path: '/my-panel', component: MyPanel },
 *   ],
 *   sidebar: {
 *     label: 'My Panel',
 *     icon: 'chart-bar',
 *     path: '/my-panel',
 *   },
 *   activate(ctx) {
 *     return { api: {} };
 *   },
 * });
 *
 * @param {Object} manifest
 * @returns {Object} Extension manifest
 */
export function defineExtension(manifest) {
  return {
    type: 'extension',
    routes: manifest.routes || [],
    sidebar: manifest.sidebar || null,
    ...manifest,
  };
}
