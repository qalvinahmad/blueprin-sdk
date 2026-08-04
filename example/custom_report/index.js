/**
 * Custom Report Plugin - Generate custom reports and exports
 *
 * This example demonstrates:
 * - Using hooks to customize report output
 * - Using UI components for report preview
 * - Export to multiple formats
 */

import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'custom-report',
  name: 'Custom Report Generator',
  version: '1.0.0',
  description: 'Generate custom reports with multiple export formats',
  author: 'blueprin-dev',

  activate(ctx) {
    ctx.logger.info('Custom Report Generator activated');

    return {
      api: {
        /**
         * Generate a RAB summary report
         * @param {string} projectId
         * @returns {Promise<Object>}
         */
        async generateRabReport(projectId) {
          // Hook: before export
          const reportData = await ctx.hooks.executeBefore('blueprin:before:export', {
            projectId,
            type: 'rab_summary',
          });

          const report = {
            id: crypto.randomUUID(),
            projectId: reportData.projectId,
            type: 'rab_summary',
            generatedAt: new Date().toISOString(),
            sections: [
              { title: 'Ringkasan RAB', items: [] },
              { title: 'Breakdown per Kategori', items: [] },
              { title: 'Analisa Harga Satuan', items: [] },
            ],
          };

          // Hook: after export
          await ctx.hooks.executeAfter('blueprin:after:export', {
            report,
            format: 'json',
          });

          return report;
        },

        /**
         * Export report to different formats
         * @param {Object} report
         * @param {'json'|'csv'|'pdf'} format
         * @returns {Promise<string|Object>}
         */
        async export(report, format = 'json') {
          switch (format) {
            case 'csv':
              return convertToCSV(report);
            case 'json':
            default:
              return report;
          }
        },

        /**
         * Get available report templates
         */
        getTemplates() {
          return [
            { id: 'rab_summary', name: 'Ringkasan RAB', description: 'Summary of all budget items' },
            { id: 'material_list', name: 'Daftar Material', description: 'Material requirements list' },
            { id: 'schedule_gantt', name: 'Jadwal Gantt', description: 'Project timeline chart' },
            { id: 'cost_breakdown', name: 'Breakdown Biaya', description: 'Detailed cost breakdown' },
          ];
        },
      },
    };
  },
});

function convertToCSV(report) {
  const rows = [['Section', 'Item', 'Value']];

  for (const section of report.sections) {
    for (const item of section.items || []) {
      rows.push([section.title, item.name || '', item.value || '']);
    }
  }

  return rows.map((row) => row.join(',')).join('\n');
}
