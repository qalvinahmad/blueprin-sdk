/**
 * @alvinahmad/blueprin-sdk - BIM / 3D IFC Types
 *
 * Types for 3D Building Information Modeling (BIM),
 * IFC (Industry Foundation Classes) quantity takeoff, and LOD hierarchy.
 */

export type BimElementType =
  | 'IfcWall'
  | 'IfcWallStandardCase'
  | 'IfcSlab'
  | 'IfcColumn'
  | 'IfcBeam'
  | 'IfcDoor'
  | 'IfcWindow'
  | 'IfcRoof'
  | 'IfcFooting'
  | 'IfcCovering'
  | 'IfcSpace'
  | 'IfcBuildingElementProxy';

export interface BimDimensions {
  length?: number; // meters
  width?: number; // meters
  height?: number; // meters
  thickness?: number; // meters
  grossArea?: number; // m2
  netArea?: number; // m2
  grossVolume?: number; // m3
  netVolume?: number; // m3
  perimeter?: number; // meters
}

export interface BimElement {
  globalId: string; // IFC GUID (22 chars base64)
  name: string;
  type: BimElementType;
  storey: string; // e.g. "Lantai 1", "Lantai 2"
  material?: string;
  dimensions: BimDimensions;
  properties?: Record<string, string | number | boolean>;
  ahsCode?: string;
  unitPrice?: number;
}

export interface BimStoreySummary {
  storey: string;
  elementCount: number;
  totalVolumeM3: number;
  totalAreaM2: number;
  totalCost: number;
  byType: Record<string, { count: number; volumeM3: number; areaM2: number; cost: number }>;
}

export interface BimModelSummary {
  modelId: string;
  name: string;
  totalElements: number;
  totalVolumeM3: number;
  totalAreaM2: number;
  totalCost: number;
  storeys: Record<string, BimStoreySummary>;
  categories: Record<string, { count: number; volumeM3: number; areaM2: number; cost: number }>;
}

export interface BimModel {
  id: string;
  projectId: string;
  name: string;
  filename: string;
  ifcVersion: 'IFC2X3' | 'IFC4' | 'IFC4X3';
  elements: BimElement[];
  schemaLOD?: 'LOD100' | 'LOD200' | 'LOD300' | 'LOD350' | 'LOD400';
  createdAt: string;
  updatedAt: string;
}
