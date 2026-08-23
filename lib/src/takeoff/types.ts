/**
 * @alvinahmad/blueprin-sdk - Digital Takeoff Types
 *
 * Types for CAD/PDF 2D/3D digital takeoff measurements,
 * scale calibrations, layer markups, and BoQ/RAB integration.
 */

export type TakeoffUnit = 'm' | 'cm' | 'mm' | 'ft' | 'in' | 'yd';

export type TakeoffMeasurementType = 'linear' | 'area' | 'volume' | 'count' | 'deduction';

export interface TakeoffPoint {
  x: number;
  y: number;
}

export interface TakeoffScale {
  pixelsPerUnit: number;
  unit: TakeoffUnit;
  ratio?: string;
  calibrationPoints?: [TakeoffPoint, TakeoffPoint];
  knownDistance?: number;
}

export interface TakeoffDeduction {
  id: string;
  name?: string;
  points: TakeoffPoint[];
  area?: number;
  areaReal?: number;
}

export interface TakeoffItem {
  id: string;
  sheetId: string;
  layerId: string;
  name: string;
  type: TakeoffMeasurementType;
  points: TakeoffPoint[];
  count?: number;
  height?: number; // for linear wall area calculation (m)
  depth?: number; // for area slab volume calculation (m)
  deductions?: TakeoffDeduction[];
  wasteFactorPercent?: number; // e.g. 5 for 5%
  materialId?: string;
  ahsCode?: string;
  unitPrice?: number;
  color?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TakeoffLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  category: string;
}

export interface TakeoffSheet {
  id: string;
  documentId: string;
  pageNumber: number;
  name: string;
  imageUrl?: string;
  pdfUrl?: string;
  width: number;
  height: number;
  scale: TakeoffScale;
  items: TakeoffItem[];
}

export interface TakeoffDocument {
  id: string;
  projectId: string;
  title: string;
  filename: string;
  fileType: 'pdf' | 'dwg' | 'dxf' | 'image';
  sheets: TakeoffSheet[];
  layers: TakeoffLayer[];
  createdAt: string;
  updatedAt: string;
}

export interface TakeoffItemCalculation {
  itemId: string;
  name: string;
  type: TakeoffMeasurementType;
  rawMeasurement: number; // in pixels / pixel^2
  scaledMeasurement: number; // in real units (m, m2, m3, pcs)
  netMeasurement: number; // after deductions
  finalQuantityWithWaste: number; // after waste factor
  unit: string;
  unitPrice: number;
  totalCost: number;
}

export interface TakeoffCategorySummary {
  category: string;
  quantity: number;
  unit: string;
  totalCost: number;
  itemsCount: number;
}

export interface TakeoffSummary {
  sheetId?: string;
  documentId?: string;
  totalItems: number;
  categories: Record<string, TakeoffCategorySummary>;
  totalCost: number;
  items: TakeoffItemCalculation[];
}

export interface BoQExportItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  sourceSheetId?: string;
  sourceItemId?: string;
}
