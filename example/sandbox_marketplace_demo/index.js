/**
 * Sandbox & Marketplace Demo Plugin
 * 
 * Demonstrates:
 * 1. UI injection via manifest
 * 2. Strict permission declarations
 * 3. Calling the SDK to submit itself to the Blueprin Marketplace
 */

import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'sandbox-marketplace-demo',
  name: 'Store Publisher Demo',
  version: '1.0.0',
  description: 'Demonstrates secure UI injections and marketplace publishing flow',
  author: 'blueprin-dev',
  
  // Explicitly declare what we need to access
  permissions: [
    'events:emit',    // Needed to notify UI components
    'storage:read',   // Needed to check submission history
    'storage:write'   // Needed to save submission history
  ],

  // Inject UI components into the host app
  ui: {
    menus: [
      { label: 'Publish to Store', path: '/publish-demo', icon: 'upload' }
    ],
    panels: [
      { id: 'publish-dashboard', component: 'PublishDashboardWidget' }
    ]
  },

  activate(ctx) {
    ctx.logger.info('Sandbox Marketplace Demo activated');

    return {
      api: {
        /**
         * Simulates a button click from the injected UI widget
         * to publish this plugin to the marketplace
         */
        async triggerPublish() {
          try {
            ctx.logger.info('User initiated marketplace submission...');
            
            // Note: Since we are inside the plugin context, we would normally use 
            // ctx.sdk.plugins.submitToMarketplace(ctx.pluginId).
            // However, the host app usually orchestrates this. 
            // We can still trigger it via our SDK instance if allowed.
            const result = await ctx.sdk.plugins.submitToMarketplace(ctx.pluginId);
            
            // Save to storage (Allowed by our 'storage:write' permission)
            await ctx.storage.set('last_submission', result);
            
            // Notify UI
            ctx.events.emit('demo:publish:success', result);
            
            return result;
          } catch (error) {
            ctx.logger.error('Failed to publish', error);
            throw error;
          }
        },
        
        async checkLastSubmission() {
          // Allowed by our 'storage:read' permission
          return ctx.storage.get('last_submission');
        }
      }
    };
  }
});
