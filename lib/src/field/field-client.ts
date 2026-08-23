/**
 * @alvinahmad/blueprin-sdk - FieldClient
 *
 * Domain client for construction field daily logs, K3 safety inspections, and site quality audits.
 */

import { generateId } from '../utils/index.js';
import type { FieldDailyLog, FieldInspection, InspectionChecklistItem } from './types.js';

export class FieldClient {
  private _storage: any;
  private _hooks: any;
  private _events: any;

  constructor({ storage, hooks, events }: { storage: any; hooks: any; events: any }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  // ─── Daily Logs ─────────────────────────────────────────────────────────────

  async listDailyLogs(projectId?: string): Promise<FieldDailyLog[]> {
    const logs: FieldDailyLog[] = (await this._storage.get('field_daily_logs')) || [];
    if (projectId) {
      return logs.filter((l) => l.projectId === projectId);
    }
    return logs;
  }

  async getDailyLog(id: string): Promise<FieldDailyLog | null> {
    const logs = await this.listDailyLogs();
    return logs.find((l) => l.id === id) || null;
  }

  async createDailyLog(input: Omit<FieldDailyLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<FieldDailyLog> {
    const ctx = await this._hooks.executeBefore('blueprin:before:field:dailylog:create', { input });

    const log: FieldDailyLog = {
      id: generateId(),
      ...ctx.input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const logs = await this.listDailyLogs();
    logs.push(log);
    await this._storage.set('field_daily_logs', logs);

    await this._hooks.executeAfter('blueprin:after:field:dailylog:create', { log });
    this._events.emit('blueprin:field:dailylog:created', { log });

    return log;
  }

  // ─── Field Inspections ──────────────────────────────────────────────────────

  async listInspections(projectId?: string): Promise<FieldInspection[]> {
    const list: FieldInspection[] = (await this._storage.get('field_inspections')) || [];
    if (projectId) {
      return list.filter((i) => i.projectId === projectId);
    }
    return list;
  }

  async getInspection(id: string): Promise<FieldInspection | null> {
    const list = await this.listInspections();
    return list.find((i) => i.id === id) || null;
  }

  async createInspection(input: {
    projectId: string;
    title: string;
    type: FieldInspection['type'];
    inspectorName: string;
    items: InspectionChecklistItem[];
    locationGPS?: { latitude: number; longitude: number };
  }): Promise<FieldInspection> {
    const ctx = await this._hooks.executeBefore('blueprin:before:field:inspection:create', { input });

    // Calculate score
    const evaluatedItems = ctx.input.items.filter((i: InspectionChecklistItem) => i.status !== 'na');
    const passedItems = evaluatedItems.filter((i: InspectionChecklistItem) => i.status === 'pass');
    const scorePercent = evaluatedItems.length > 0 ? Math.round((passedItems.length / evaluatedItems.length) * 100) : 100;
    const hasFail = evaluatedItems.some((i: InspectionChecklistItem) => i.status === 'fail');
    const status = hasFail ? 'rejected' : 'approved';

    const inspection: FieldInspection = {
      id: generateId(),
      projectId: ctx.input.projectId,
      title: ctx.input.title,
      type: ctx.input.type,
      inspectorName: ctx.input.inspectorName,
      status,
      scorePercent,
      items: ctx.input.items,
      locationGPS: ctx.input.locationGPS,
      signedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const list = await this.listInspections();
    list.push(inspection);
    await this._storage.set('field_inspections', list);

    await this._hooks.executeAfter('blueprin:after:field:inspection:create', { inspection });
    this._events.emit('blueprin:field:inspection:created', { inspection });

    return inspection;
  }
}
