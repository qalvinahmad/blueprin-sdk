/**
 * Advanced Formula Plugin
 * 
 * Demonstrates intercepting the RAB calculation engine to inject
 * custom overhead logic (e.g. Jasa Pemborong + PPN) using the new Pipeline API.
 */

import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'formula-advanced-overhead',
  name: 'Overhead & Tax Calculator',
  version: '1.0.0',
  description: 'Automatically injects Jasa Pemborong (10%) and PPN (11%) into every RAB calculation',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('Advanced Formula plugin activated');

    // Register 10% Jasa Pemborong
    ctx.sdk.rab.formulas.registerOverhead('jasa-pemborong', (formulaCtx) => {
      // Return the accumulated amount
      return formulaCtx.currentValue + (formulaCtx.baseTotal * 0.10);
    });

    // Register 11% PPN Tax
    ctx.sdk.rab.formulas.registerTax('ppn-11', (formulaCtx) => {
      // The tax is applied on the current total (base + overhead + profit)
      return formulaCtx.currentValue + (formulaCtx.currentTotal * 0.11);
    });

    return { api: {} };
  }
});
