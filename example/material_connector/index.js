/**
 * Material Connector - Sync materials from external suppliers
 *
 * This example demonstrates:
 * - Extending BaseConnector for supplier integration
 * - Using hooks to validate material data
 * - Batch operations
 */

import { definePlugin, defineConnector } from '@blueprin/sdk';

/**
 * Supplier Material Connector
 */
class SupplierConnector {
  static protocol = 'rest';

  #baseUrl;
  #apiKey;

  async connect(config) {
    this.#baseUrl = config.baseUrl;
    this.#apiKey = config.apiKey;
    return this;
  }

  async disconnect() {
    this.#baseUrl = null;
    this.#apiKey = null;
  }

  async fetchCatalog() {
    // Simulate API call
    return [
      { name: 'Semen Portland 50kg', category: 'BAHAN', unit: 'sak', price: 65000 },
      { name: 'Besi Beton 10mm', category: 'BAHAN', unit: 'btg', price: 85000 },
      { name: 'Pasir Pantai', category: 'BAHAN', unit: 'm3', price: 350000 },
      { name: 'Bata Merah', category: 'BAHAN', unit: 'btg', price: 1200 },
      { name: 'Cat Tembok Putih', category: 'BAHAN', unit: 'liter', price: 85000 },
    ];
  }

  async getPrice(materialName) {
    const catalog = await this.fetchCatalog();
    return catalog.find((m) => m.name === materialName);
  }
}

/**
 * Material Connector Plugin
 */
export default definePlugin({
  id: 'material-connector',
  name: 'Material Connector',
  version: '1.0.0',
  description: 'Sync material prices from external suppliers',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('Material Connector activated');

    const connector = new SupplierConnector();
    let connected = false;

    return {
      api: {
        async connectToSupplier(config) {
          await connector.connect(config);
          connected = true;
          ctx.logger.info('Connected to supplier');
        },

        async syncMaterials(projectId) {
          if (!connected) throw new Error('Not connected to supplier');

          const catalog = await connector.fetchCatalog();

          // Hook: validate before import
          const validated = await ctx.hooks.executeBefore(
            'blueprin:before:material:create',
            { materials: catalog }
          );

          ctx.events.emit('blueprin:material:imported', {
            projectId,
            count: catalog.length,
            source: 'supplier',
          });

          return catalog;
        },

        async getPrice(materialName) {
          if (!connected) throw new Error('Not connected to supplier');
          return connector.getPrice(materialName);
        },

        isConnected: () => connected,
      },
    };
  },
});
