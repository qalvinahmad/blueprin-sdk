/**
 * WhatsApp Sync Plugin - Send notifications via WhatsApp
 *
 * This example demonstrates:
 * - Using the Connector SDK
 * - Hooking into order and RFQ events
 * - Using storage for notification logs
 */

import { definePlugin, defineConnector } from '@alvinahmad/blueprin-sdk';

/**
 * WhatsApp Connector using the BaseConnector pattern
 */
const WhatsAppConnector = defineConnector({
  id: 'whatsapp-connector',
  name: 'WhatsApp Connector',
  version: '1.0.0',
  description: 'Send messages via WhatsApp Business API',
  protocol: 'rest',

  async connect(config) {
    this.apiKey = config.apiKey;
    this.phoneNumberId = config.phoneNumberId;
    return this;
  },

  async disconnect() {
    this.apiKey = null;
    this.phoneNumberId = null;
  },

  async sendMessage(to, message) {
    // In real implementation, call WhatsApp Business API
    console.log(`[WhatsApp] Sending to ${to}: ${message}`);
    return { success: true, messageId: crypto.randomUUID() };
  },
});

/**
 * WhatsApp Sync Plugin
 */
export default definePlugin({
  id: 'whatsapp-sync',
  name: 'WhatsApp Sync Bot',
  version: '1.0.0',
  description: 'Send WhatsApp notifications for project updates',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('WhatsApp Sync activated');

    const notifications = [];

    // Notify when order is created
    ctx.events.on('blueprin:marketplace:order:created', async (data) => {
      const order = data.order;
      notifications.push({
        type: 'order_created',
        orderId: order.id,
        buyer: order.buyer_name,
        total: order.grand_total,
        timestamp: new Date().toISOString(),
      });

      ctx.logger.info(`Order ${order.id} notification queued`);
    });

    // Notify when RFQ is received
    ctx.events.on('blueprin:marketplace:rfq:received', async (data) => {
      const rfq = data.rfq;
      notifications.push({
        type: 'rfq_received',
        rfqId: rfq.id,
        buyer: rfq.buyer_name,
        itemCount: rfq.items.length,
        timestamp: new Date().toISOString(),
      });

      ctx.logger.info(`RFQ ${rfq.id} notification queued`);
    });

    // Log notification history
    ctx.hooks.register('blueprin:after:order:create', async (data) => {
      await ctx.storage.set('notification_log', notifications.slice(-50));
      return data;
    });

    return {
      api: {
        getNotifications: () => [...notifications],
        getNotificationCount: () => notifications.length,
        clearNotifications: () => {
          notifications.length = 0;
        },
      },
    };
  },
});
