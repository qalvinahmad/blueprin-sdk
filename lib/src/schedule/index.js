/**
 * Schedule Module - SDK interface for project scheduling
 */

export class ScheduleClient {
  static PHASES = [
    { code: 'PERSIAPAN', name: 'Persiapan', description: 'Site preparation, clearing, demolition' },
    { code: 'STRUKTUR', name: 'Struktur', description: 'Foundation, columns, beams, slabs' },
    { code: 'DINDING', name: 'Dinding', description: 'Brick walls, partitions' },
    { code: 'ATAP', name: 'Atap', description: 'Roofing structure and covering' },
    { code: 'PLESTERAN', name: 'Plesteran', description: 'Plastering and rendering' },
    { code: 'KERAMIK', name: 'Keramik', description: 'Floor and wall tiles' },
    { code: 'KUSEN', name: 'Kusen', description: 'Door and window frames' },
    { code: 'PINTU', name: 'Pintu', description: 'Door installation' },
    { code: 'JENDELA', name: 'Jendela', description: 'Window installation' },
    { code: 'PLAFON', name: 'Plafon', description: 'Ceiling installation' },
    { code: 'ELEKTRIK', name: 'Elektrik', description: 'Electrical wiring and fixtures' },
    { code: 'PLUMBING', name: 'Plumbing', description: 'Water supply and drainage' },
    { code: 'FINISHING', name: 'Finishing', description: 'Painting, cleanup, handover' },
  ];

  constructor({ storage, hooks, events }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  async get(projectId) {
    return (await this._storage.get(`schedule:${projectId}`)) || {
      projectId,
      phases: [],
      tasks: [],
      createdAt: null,
    };
  }

  async generate(projectId, options = {}) {
    const ctx = await this._hooks.executeBefore('blueprin:before:schedule:generate', { projectId, options });

    const startDate = ctx.options.startDate || new Date();
    const workDaysPerWeek = ctx.options.workDaysPerWeek || 6;

    const phases = ScheduleClient.PHASES.map((phase, index) => ({
      ...phase,
      id: crypto.randomUUID(),
      projectId: ctx.projectId,
      order: index,
      status: 'pending',
      start_date: null,
      end_date: null,
      progress: 0,
    }));

    const schedule = {
      projectId: ctx.projectId,
      phases,
      tasks: [],
      startDate: startDate.toISOString(),
      workDaysPerWeek,
      createdAt: new Date().toISOString(),
    };

    await this._storage.set(`schedule:${ctx.projectId}`, schedule);
    await this._hooks.executeAfter('blueprin:after:schedule:generate', { schedule });
    this._events.emit('blueprin:schedule:generated', { schedule });

    return schedule;
  }

  async createTask(projectId, input) {
    const task = {
      id: crypto.randomUUID(),
      project_id: projectId,
      title: input.title,
      description: input.description || '',
      column: input.column || 'backlog',
      priority: input.priority || 'medium',
      tags: input.tags || [],
      due_date: input.due_date || null,
      start_date: input.start_date || null,
      kategori: input.kategori || '',
      status: input.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const schedule = await this.get(projectId);
    schedule.tasks.push(task);
    await this._storage.set(`schedule:${projectId}`, schedule);
    this._events.emit('blueprin:task:created', { projectId, task });

    return task;
  }

  async updateTask(projectId, taskId, patch) {
    const schedule = await this.get(projectId);
    const idx = schedule.tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`Task "${taskId}" not found`);

    schedule.tasks[idx] = { ...schedule.tasks[idx], ...patch, updated_at: new Date().toISOString() };
    await this._storage.set(`schedule:${projectId}`, schedule);
    this._events.emit('blueprin:task:updated', { projectId, task: schedule.tasks[idx] });

    return schedule.tasks[idx];
  }

  async completeTask(projectId, taskId) {
    const ctx = await this._hooks.executeBefore('blueprin:before:task:complete', { projectId, taskId });

    const task = await this.updateTask(ctx.projectId, ctx.taskId, {
      status: 'completed',
      column: 'done',
      completed_date: new Date().toISOString(),
    });

    await this._hooks.executeAfter('blueprin:after:task:complete', { projectId, task });
    this._events.emit('blueprin:task:completed', { projectId, task });

    return task;
  }
}
