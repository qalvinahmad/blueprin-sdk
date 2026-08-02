/**
 * Hello Plugin - Simplest possible Blueprin plugin
 *
 * This example demonstrates the basics of creating a plugin.
 */

import { definePlugin } from '@blueprin/sdk';

export default definePlugin({
  id: 'hello-plugin',
  name: 'Hello Plugin',
  version: '1.0.0',
  description: 'A simple hello world plugin for Blueprin',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('Hello Plugin activated!');

    // Listen to project events
    ctx.events.on('blueprin:project:created', (data) => {
      ctx.logger.info('New project created:', data.project.name);
    });

    // Register a hook
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      ctx.logger.info('RAB calculated, total:', data.result?.total);
      return data;
    });

    // Return plugin API
    return {
      api: {
        greet: () => `Hello from ${ctx.pluginId}!`,
      },
    };
  },

  deactivate(instance) {
    console.log('Hello Plugin deactivated');
  },
});
