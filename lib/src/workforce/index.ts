/**
 * Workforce Module - SDK interface for workers, attendance, and payroll
 */

import { generateId } from '../utils/index.js';

export interface WorkerInput {
  name: string;
  role?: string;
  daily_rate?: number;
  overtime_rate?: number;
  phone?: string;
}

export interface AttendanceInput {
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
  overtime_hours?: number;
  notes?: string;
}

export class WorkforceClient {
  private _storage: any;
  private _hooks: any;
  private _events: any;

  constructor({ storage, hooks, events }: { storage: any; hooks: any; events: any }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  async listWorkers(projectId: string, filters: any = {}) {
    const all = (await this._storage.get(`workers:${projectId}`)) || [];
    return all.filter((w: any) => {
      if (filters.role && w.role !== filters.role) return false;
      if (filters.search && !w.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  async addWorker(projectId: string, input: WorkerInput) {
    const ctx = await this._hooks.executeBefore('blueprin:before:worker:add', { projectId, input });

    const worker = {
      id: generateId(),
      project_id: projectId,
      name: ctx.input.name,
      role: ctx.input.role || 'Tukang',
      daily_rate: ctx.input.daily_rate || 0,
      overtime_rate: ctx.input.overtime_rate || 0,
      phone: ctx.input.phone || '',
      created_at: new Date().toISOString(),
    };

    const workers = (await this._storage.get(`workers:${projectId}`)) || [];
    workers.push(worker);
    await this._storage.set(`workers:${projectId}`, workers);

    await this._hooks.executeAfter('blueprin:after:worker:add', { worker });
    this._events.emit('blueprin:worker:added', { projectId, worker });

    return worker;
  }

  async logAttendance(projectId: string, workerId: string, input: AttendanceInput) {
    const ctx = await this._hooks.executeBefore('blueprin:before:attendance:log', { projectId, workerId, input });

    const attendance = {
      id: generateId(),
      project_id: projectId,
      worker_id: workerId,
      date: ctx.input.date,
      status: ctx.input.status || 'PRESENT',
      overtime_hours: ctx.input.overtime_hours || 0,
      notes: ctx.input.notes || '',
      logged_at: new Date().toISOString(),
    };

    const records = (await this._storage.get(`attendance:${projectId}:${workerId}`)) || [];
    records.push(attendance);
    await this._storage.set(`attendance:${projectId}:${workerId}`, records);

    await this._hooks.executeAfter('blueprin:after:attendance:log', { attendance });
    this._events.emit('blueprin:attendance:logged', { projectId, workerId, attendance });

    return attendance;
  }

  async listAttendance(projectId: string, workerId: string) {
    return (await this._storage.get(`attendance:${projectId}:${workerId}`)) || [];
  }

  async calculateWages(projectId: string, workerId: string, periodStart: string, periodEnd: string) {
    const workers = await this.listWorkers(projectId);
    const worker = workers.find((w: any) => w.id === workerId);
    if (!worker) throw new Error(`Worker "${workerId}" not found`);

    const records = await this.listAttendance(projectId, workerId);
    const filtered = records.filter((r: any) => {
      const d = new Date(r.date);
      return d >= new Date(periodStart) && d <= new Date(periodEnd);
    });

    let totalWages = 0;
    let totalOvertime = 0;

    for (const r of filtered) {
      if (r.status === 'PRESENT') {
        totalWages += worker.daily_rate;
      } else if (r.status === 'HALF_DAY') {
        totalWages += worker.daily_rate / 2;
      }
      
      if (r.overtime_hours) {
        totalOvertime += r.overtime_hours * worker.overtime_rate;
      }
    }

    return {
      workerId,
      periodStart,
      periodEnd,
      baseWages: totalWages,
      overtimeWages: totalOvertime,
      total: totalWages + totalOvertime,
      daysPresent: filtered.filter((r: any) => r.status === 'PRESENT' || r.status === 'HALF_DAY').length
    };
  }
}
