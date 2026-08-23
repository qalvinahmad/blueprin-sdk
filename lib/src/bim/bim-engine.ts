/**
 * @alvinahmad/blueprin-sdk - BimEngine
 *
 * Computational engine for extracting 3D quantities from BIM/IFC models:
 * - Aggregation of gross/net volume, surface area, and linear lengths
 * - Storey / floor breakdown and category grouping
 * - Automatic BoQ item generation linking to AHSP unit rates
 */

import type { BimModel, BimElement, BimModelSummary, BimStoreySummary } from './types.js';

export class BimEngine {
  /**
   * Calculate aggregated 3D quantity takeoff metrics across an entire BIM model.
   */
  static calculateSummary(model: BimModel): BimModelSummary {
    const storeys: Record<string, BimStoreySummary> = {};
    const categories: Record<string, { count: number; volumeM3: number; areaM2: number; cost: number }> = {};
    let totalVolumeM3 = 0;
    let totalAreaM2 = 0;
    let totalCost = 0;

    for (const el of model.elements || []) {
      const vol = el.dimensions.netVolume || el.dimensions.grossVolume || 0;
      const area = el.dimensions.netArea || el.dimensions.grossArea || 0;
      const unitCost = el.unitPrice || 0;
      const cost = vol > 0 ? vol * unitCost : area > 0 ? area * unitCost : unitCost;

      totalVolumeM3 += vol;
      totalAreaM2 += area;
      totalCost += cost;

      // Storey breakdown
      const storeyKey = el.storey || 'Unassigned';
      if (!storeys[storeyKey]) {
        storeys[storeyKey] = {
          storey: storeyKey,
          elementCount: 0,
          totalVolumeM3: 0,
          totalAreaM2: 0,
          totalCost: 0,
          byType: {},
        };
      }
      const st = storeys[storeyKey];
      st.elementCount += 1;
      st.totalVolumeM3 += vol;
      st.totalAreaM2 += area;
      st.totalCost += cost;

      if (!st.byType[el.type]) {
        st.byType[el.type] = { count: 0, volumeM3: 0, areaM2: 0, cost: 0 };
      }
      st.byType[el.type].count += 1;
      st.byType[el.type].volumeM3 += vol;
      st.byType[el.type].areaM2 += area;
      st.byType[el.type].cost += cost;

      // Category breakdown
      if (!categories[el.type]) {
        categories[el.type] = { count: 0, volumeM3: 0, areaM2: 0, cost: 0 };
      }
      categories[el.type].count += 1;
      categories[el.type].volumeM3 += vol;
      categories[el.type].areaM2 += area;
      categories[el.type].cost += cost;
    }

    // Round metrics
    totalVolumeM3 = Math.round(totalVolumeM3 * 1000) / 1000;
    totalAreaM2 = Math.round(totalAreaM2 * 1000) / 1000;
    totalCost = Math.round(totalCost);

    return {
      modelId: model.id,
      name: model.name,
      totalElements: model.elements.length,
      totalVolumeM3,
      totalAreaM2,
      totalCost,
      storeys,
      categories,
    };
  }

  /**
   * Filter elements by storey, type, or material.
   */
  static filterElements(
    elements: BimElement[],
    filters: { storey?: string; type?: string; material?: string }
  ): BimElement[] {
    return elements.filter((el) => {
      if (filters.storey && el.storey !== filters.storey) return false;
      if (filters.type && el.type !== filters.type) return false;
      if (filters.material && el.material !== filters.material) return false;
      return true;
    });
  }

  /**
   * Convert BIM elements into Bill of Quantities (BoQ) items.
   */
  static exportToBoQ(model: BimModel): Array<{
    globalId: string;
    description: string;
    storey: string;
    category: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }> {
    return model.elements.map((el) => {
      let quantity = 1;
      let unit = 'unit';

      if (el.dimensions.netVolume || el.dimensions.grossVolume) {
        quantity = el.dimensions.netVolume || el.dimensions.grossVolume || 0;
        unit = 'm3';
      } else if (el.dimensions.netArea || el.dimensions.grossArea) {
        quantity = el.dimensions.netArea || el.dimensions.grossArea || 0;
        unit = 'm2';
      } else if (el.dimensions.length) {
        quantity = el.dimensions.length;
        unit = 'm';
      }

      const unitPrice = el.unitPrice || 0;
      const totalPrice = Math.round(quantity * unitPrice);

      return {
        globalId: el.globalId,
        description: el.name,
        storey: el.storey,
        category: el.type.replace(/^Ifc/, ''),
        quantity: Math.round(quantity * 1000) / 1000,
        unit,
        unitPrice,
        totalPrice,
      };
    });
  }
}
