/**
 * @alvinahmad/blueprin-sdk - Takeoff Module
 *
 * Digital Takeoff (PDF/CAD measurement) engine & domain client:
 * - Scale calibration (known distance & ratio presets)
 * - Measurement calculations (linear, area, volume, count, deductions)
 * - Layer markup & BoQ/RAB cost integration
 */

export { TakeoffEngine } from './takeoff-engine.js';
export { TakeoffClient } from './takeoff-client.js';
export type {
  TakeoffUnit,
  TakeoffMeasurementType,
  TakeoffPoint,
  TakeoffScale,
  TakeoffDeduction,
  TakeoffItem,
  TakeoffLayer,
  TakeoffSheet,
  TakeoffDocument,
  TakeoffItemCalculation,
  TakeoffCategorySummary,
  TakeoffSummary,
  BoQExportItem,
} from './types.js';
