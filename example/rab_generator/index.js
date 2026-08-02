/**
 * RAB Generator Plugin - AI-powered RAB generation
 *
 * This example demonstrates:
 * - Using hooks to intercept RAB calculations
 * - Using storage to cache AI results
 * - Using events to notify other plugins
 */

import { definePlugin } from '@blueprin/sdk';

export default definePlugin({
  id: 'rab-generator-pro',
  name: 'RAB Generator Pro',
  version: '1.0.0',
  description: 'Generate RAB items from building specifications using AI',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('RAB Generator Pro activated');

    // Cache for generated RAB items
    const cache = new Map();

    return {
      api: {
        /**
         * Generate RAB items from building specs
         * @param {Object} specs - Building specifications
         * @returns {Promise<Object[]>} Generated RAB items
         */
        async generate(specs) {
          const cacheKey = JSON.stringify(specs);
          if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
          }

          // Hook: before generation
          const input = await ctx.hooks.executeBefore(
            'blueprin:before:rab:calculate',
            { specs }
          );

          // Generate items based on building type
          const items = generateFromSpecs(input.specs);

          // Cache results
          cache.set(cacheKey, items);

          // Emit event for other plugins
          ctx.events.emit('blueprin:rab:generated', {
            itemCount: items.length,
            total: items.reduce((s, i) => s + i.volume * i.unit_price, 0),
          });

          // Store in plugin storage
          await ctx.storage.set('last_generated', {
            items,
            timestamp: new Date().toISOString(),
          });

          return items;
        },

        /**
         * Get generation history
         */
        async getHistory() {
          return (await ctx.storage.get('last_generated')) || null;
        },
      },
    };
  },
});

function generateFromSpecs(specs) {
  const items = [];

  // Foundation
  if (specs.foundation_type) {
    items.push({
      work_name: `Pekerjaan ${specs.foundation_type}`,
      unit: 'm3',
      volume: (specs.building_area_m2 || 100) * 0.3,
      unit_price: 450000,
      kategori: 'STRUKTUR',
    });
  }

  // Columns
  items.push({
    work_name: 'Pekerjaan Kolom Beton',
    unit: 'm3',
    volume: (specs.building_area_m2 || 100) * 0.05,
    unit_price: 850000,
    kategori: 'STRUKTUR',
  });

  // Walls
  items.push({
    work_name: 'Pekerjaan Dinding Bata',
    unit: 'm2',
    volume: (specs.building_area_m2 || 100) * 2.5,
    unit_price: 185000,
    kategori: 'DINDING',
  });

  // Roof
  items.push({
    work_name: `Pekerjaan Atap ${specs.roof_type || 'Metal'}`,
    unit: 'm2',
    volume: (specs.building_area_m2 || 100) * 1.1,
    unit_price: 220000,
    kategori: 'ATAP',
  });

  // Flooring
  items.push({
    work_name: 'Pekerjaan Keramik Lantai',
    unit: 'm2',
    volume: specs.building_area_m2 || 100,
    unit_price: 165000,
    kategori: 'KERAMIK',
  });

  // Electrical
  items.push({
    work_name: 'Pekerjaan Instalasi Listrik',
    unit: 'ls',
    volume: 1,
    unit_price: (specs.building_area_m2 || 100) * 75000,
    kategori: 'ELEKTRIK',
  });

  // Plumbing
  items.push({
    work_name: 'Pekerjaan Instalasi Plumbing',
    unit: 'ls',
    volume: 1,
    unit_price: (specs.building_area_m2 || 100) * 65000,
    kategori: 'PLUMBING',
  });

  return items;
}
