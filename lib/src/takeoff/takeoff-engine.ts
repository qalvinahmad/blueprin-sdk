/**
 * @alvinahmad/blueprin-sdk - TakeoffEngine
 *
 * Mathematical computation engine for Digital Takeoff:
 * - Scale calibration from known distances & ratio presets
 * - Linear perimeter & segment calculations
 * - Polygon area via Shoelace algorithm & deduction holes
 * - Wall surface area & slab volume extrusions
 * - Waste factor allowance and item cost estimation
 */

import type {
  TakeoffPoint,
  TakeoffScale,
  TakeoffUnit,
  TakeoffItem,
  TakeoffSheet,
  TakeoffLayer,
  TakeoffItemCalculation,
  TakeoffSummary,
  TakeoffCategorySummary,
} from './types.js';

// Unit conversion factors relative to meters (m)
const LINEAR_TO_METERS: Record<TakeoffUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  ft: 0.3048,
  in: 0.0254,
  yd: 0.9144,
};

export class TakeoffEngine {
  /**
   * Calculate a scale configuration from 2 points with a known real-world distance.
   */
  static calculateScaleFromKnownDistance(
    p1: TakeoffPoint,
    p2: TakeoffPoint,
    knownDistance: number,
    unit: TakeoffUnit = 'm'
  ): TakeoffScale {
    if (knownDistance <= 0) {
      throw new Error('Known distance must be greater than 0');
    }
    const pixelDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (pixelDistance === 0) {
      throw new Error('Calibration points cannot be identical');
    }

    const pixelsPerUnit = pixelDistance / knownDistance;

    return {
      pixelsPerUnit,
      unit,
      calibrationPoints: [p1, p2],
      knownDistance,
    };
  }

  /**
   * Calculate scale from an architectural ratio preset (e.g. "1:100", "1:50") at a given DPI.
   * Standard PDF rendering is commonly 72 or 300 DPI.
   * 1 inch = 0.0254 meters.
   */
  static calculateScaleFromPreset(
    ratio: string,
    dpi = 72,
    unit: TakeoffUnit = 'm'
  ): TakeoffScale {
    const parts = ratio.split(':');
    if (parts.length !== 2) {
      throw new Error(`Invalid ratio format "${ratio}", expected format "1:100"`);
    }
    const scaleFactor = parseFloat(parts[1]);
    if (isNaN(scaleFactor) || scaleFactor <= 0) {
      throw new Error(`Invalid ratio scale factor in "${ratio}"`);
    }

    // Pixels per meter at 1:1 = dpi / 0.0254
    const pixelsPerMeterAtReal = dpi / 0.0254;
    // At scale 1:N, 1 real meter is represented by (1/N) meters on paper
    const pixelsPerMeter = pixelsPerMeterAtReal / scaleFactor;

    // Convert pixelsPerMeter to requested unit
    const unitInMeters = LINEAR_TO_METERS[unit] || 1;
    const pixelsPerUnit = pixelsPerMeter * unitInMeters;

    return {
      pixelsPerUnit,
      unit,
      ratio,
    };
  }

  /**
   * Convert measurement values between units across dimensions (1 = linear, 2 = area, 3 = volume).
   */
  static convertUnit(
    value: number,
    from: TakeoffUnit,
    to: TakeoffUnit,
    dimension: 1 | 2 | 3 = 1
  ): number {
    if (from === to) return value;
    const fromFactor = LINEAR_TO_METERS[from] || 1;
    const toFactor = LINEAR_TO_METERS[to] || 1;
    const ratio = fromFactor / toFactor;
    return value * Math.pow(ratio, dimension);
  }

  /**
   * Calculate polyline length (in pixels and scaled real-world unit).
   */
  static calculatePolylineLength(
    points: TakeoffPoint[],
    scale?: TakeoffScale
  ): { pixelLength: number; scaledLength: number; unit: string } {
    if (!points || points.length < 2) {
      return { pixelLength: 0, scaledLength: 0, unit: scale?.unit || 'm' };
    }

    let pixelLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      pixelLength += Math.hypot(p2.x - p1.x, p2.y - p1.y);
    }

    const ppu = scale?.pixelsPerUnit || 1;
    const scaledLength = pixelLength / ppu;

    return {
      pixelLength: Math.round(pixelLength * 100) / 100,
      scaledLength: Math.round(scaledLength * 1000) / 1000,
      unit: scale?.unit || 'm',
    };
  }

  /**
   * Calculate polygon area using the Shoelace (Gauss's area) formula.
   */
  static calculatePolygonArea(
    points: TakeoffPoint[],
    scale?: TakeoffScale
  ): { pixelArea: number; scaledArea: number; unit: string } {
    if (!points || points.length < 3) {
      return { pixelArea: 0, scaledArea: 0, unit: `${scale?.unit || 'm'}2` };
    }

    let s = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      s += a.x * b.y - b.x * a.y;
    }

    const pixelArea = Math.abs(s) / 2;
    const ppu = scale?.pixelsPerUnit || 1;
    const scaledArea = pixelArea / (ppu * ppu);

    return {
      pixelArea: Math.round(pixelArea * 100) / 100,
      scaledArea: Math.round(scaledArea * 1000) / 1000,
      unit: `${scale?.unit || 'm'}2`,
    };
  }

  /**
   * Calculate net polygon area with deduction holes subtracted.
   */
  static calculateNetPolygonArea(
    outerPoints: TakeoffPoint[],
    deductions: TakeoffPoint[][] = [],
    scale?: TakeoffScale
  ): { grossArea: number; deductionsArea: number; netArea: number; unit: string } {
    const gross = this.calculatePolygonArea(outerPoints, scale);
    let deductionsArea = 0;

    for (const hole of deductions) {
      const holeArea = this.calculatePolygonArea(hole, scale);
      deductionsArea += holeArea.scaledArea;
    }

    const netArea = Math.max(0, gross.scaledArea - deductionsArea);

    return {
      grossArea: gross.scaledArea,
      deductionsArea: Math.round(deductionsArea * 1000) / 1000,
      netArea: Math.round(netArea * 1000) / 1000,
      unit: gross.unit,
    };
  }

  /**
   * Calculate vertical wall surface area (Linear perimeter * wall height - openings).
   */
  static calculateWallSurfaceArea(
    points: TakeoffPoint[],
    height: number,
    deductions: { width: number; height: number }[] = [],
    scale?: TakeoffScale
  ): { wallLength: number; grossArea: number; deductionsArea: number; netArea: number; unit: string } {
    const { scaledLength } = this.calculatePolylineLength(points, scale);
    const grossArea = scaledLength * Math.max(0, height);

    let deductionsArea = 0;
    for (const d of deductions) {
      deductionsArea += d.width * d.height;
    }

    const netArea = Math.max(0, grossArea - deductionsArea);

    return {
      wallLength: scaledLength,
      grossArea: Math.round(grossArea * 1000) / 1000,
      deductionsArea: Math.round(deductionsArea * 1000) / 1000,
      netArea: Math.round(netArea * 1000) / 1000,
      unit: `${scale?.unit || 'm'}2`,
    };
  }

  /**
   * Calculate slab / volume extrusion (Net Area * depth/thickness).
   */
  static calculateSlabVolume(
    points: TakeoffPoint[],
    depth: number,
    deductions: TakeoffPoint[][] = [],
    scale?: TakeoffScale
  ): { netArea: number; volume: number; unit: string } {
    const { netArea } = this.calculateNetPolygonArea(points, deductions, scale);
    const volume = netArea * Math.max(0, depth);

    return {
      netArea,
      volume: Math.round(volume * 1000) / 1000,
      unit: `${scale?.unit || 'm'}3`,
    };
  }

  /**
   * Check if a 2D point lies inside a polygon (Ray Casting algorithm).
   */
  static pointInPolygon(pt: TakeoffPoint, poly: TakeoffPoint[]): boolean {
    if (!poly || poly.length < 3) return false;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect =
        yi > pt.y !== yj > pt.y &&
        pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Calculate complete item metrics including deductions, waste factor, and total cost.
   */
  static calculateItem(item: TakeoffItem, scale?: TakeoffScale): TakeoffItemCalculation {
    const unitPrice = item.unitPrice || 0;
    const wasteFactor = 1 + (item.wasteFactorPercent || 0) / 100;
    const baseUnit = scale?.unit || 'm';

    let rawMeasurement = 0;
    let scaledMeasurement = 0;
    let netMeasurement = 0;
    let unit: string = baseUnit;

    switch (item.type) {
      case 'count': {
        const count = item.count !== undefined ? item.count : (item.points?.length || 1);
        rawMeasurement = count;
        scaledMeasurement = count;
        netMeasurement = count;
        unit = 'pcs';
        break;
      }

      case 'linear': {
        const lengthResult = this.calculatePolylineLength(item.points, scale);
        rawMeasurement = lengthResult.pixelLength;
        scaledMeasurement = lengthResult.scaledLength;

        if (item.height && item.height > 0) {
          // Extrude wall height -> area
          const grossArea = scaledMeasurement * item.height;
          let dedArea = 0;
          if (item.deductions) {
            for (const d of item.deductions) {
              if (d.areaReal) dedArea += d.areaReal;
            }
          }
          netMeasurement = Math.max(0, grossArea - dedArea);
          unit = `${baseUnit}2`;
        } else {
          netMeasurement = scaledMeasurement;
          unit = baseUnit;
        }
        break;
      }

      case 'area': {
        const deductionPoints = (item.deductions || []).map((d) => d.points);
        const areaResult = this.calculateNetPolygonArea(item.points, deductionPoints, scale);
        rawMeasurement = (item.points?.length || 0);
        scaledMeasurement = areaResult.grossArea;
        netMeasurement = areaResult.netArea;
        unit = `${baseUnit}2`;
        break;
      }

      case 'volume': {
        const depth = item.depth || 1;
        const deductionPoints = (item.deductions || []).map((d) => d.points);
        const slabResult = this.calculateSlabVolume(item.points, depth, deductionPoints, scale);
        rawMeasurement = (item.points?.length || 0);
        scaledMeasurement = slabResult.netArea;
        netMeasurement = slabResult.volume;
        unit = `${baseUnit}3`;
        break;
      }

      case 'deduction': {
        const areaResult = this.calculatePolygonArea(item.points, scale);
        rawMeasurement = areaResult.pixelArea;
        scaledMeasurement = areaResult.scaledArea;
        netMeasurement = -areaResult.scaledArea;
        unit = `${baseUnit}2`;
        break;
      }
    }

    const finalQuantityWithWaste = Math.round(netMeasurement * wasteFactor * 1000) / 1000;
    const totalCost = Math.round(finalQuantityWithWaste * unitPrice);

    return {
      itemId: item.id,
      name: item.name,
      type: item.type,
      rawMeasurement: Math.round(rawMeasurement * 100) / 100,
      scaledMeasurement: Math.round(scaledMeasurement * 1000) / 1000,
      netMeasurement: Math.round(netMeasurement * 1000) / 1000,
      finalQuantityWithWaste,
      unit,
      unitPrice,
      totalCost,
    };
  }

  /**
   * Compute aggregate summary across all sheet items, grouped by category/layer.
   */
  static calculateSummary(
    sheet: TakeoffSheet,
    layers: TakeoffLayer[] = []
  ): TakeoffSummary {
    const layerMap = new Map<string, TakeoffLayer>();
    layers.forEach((l) => layerMap.set(l.id, l));

    const itemCalculations: TakeoffItemCalculation[] = [];
    const categories: Record<string, TakeoffCategorySummary> = {};
    let totalCost = 0;

    for (const item of sheet.items || []) {
      const calc = this.calculateItem(item, sheet.scale);
      itemCalculations.push(calc);
      totalCost += calc.totalCost;

      const layer = layerMap.get(item.layerId);
      const categoryName = layer?.category || layer?.name || 'General';

      if (!categories[categoryName]) {
        categories[categoryName] = {
          category: categoryName,
          quantity: 0,
          unit: calc.unit,
          totalCost: 0,
          itemsCount: 0,
        };
      }

      categories[categoryName].quantity += calc.finalQuantityWithWaste;
      categories[categoryName].totalCost += calc.totalCost;
      categories[categoryName].itemsCount += 1;
    }

    // Round category totals
    for (const cat of Object.values(categories)) {
      cat.quantity = Math.round(cat.quantity * 1000) / 1000;
    }

    return {
      sheetId: sheet.id,
      documentId: sheet.documentId,
      totalItems: itemCalculations.length,
      categories,
      totalCost,
      items: itemCalculations,
    };
  }
}
