/**
 * Project Module - SDK interface for Blueprin projects
 */

export class ProjectClient {
  constructor({ storage, hooks, events }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  async getCurrent() {
    return this._storage.get('current_project');
  }

  async setCurrent(project) {
    await this._storage.set('current_project', project);
    this._events.emit('blueprin:project:updated', { project });
  }

  async list() {
    return (await this._storage.get('projects')) || [];
  }

  async create(input) {
    const ctx = await this._hooks.executeBefore('blueprin:before:project:create', { input });

    const project = {
      id: crypto.randomUUID(),
      name: ctx.input.name,
      location: ctx.input.location || '',
      deadline: ctx.input.deadline || null,
      client_name: ctx.input.client_name || '',
      building_area_m2: ctx.input.building_area_m2 || 0,
      budget: ctx.input.budget || 0,
      jenis_bangunan: ctx.input.jenis_bangunan || '',
      status_proyek: ctx.input.status_proyek || 'baru',
      meta: ctx.input.meta || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const projects = await this.list();
    projects.push(project);
    await this._storage.set('projects', projects);

    await this._hooks.executeAfter('blueprin:after:project:create', { project });
    this._events.emit('blueprin:project:created', { project });

    return project;
  }

  async update(projectId, patch) {
    const ctx = await this._hooks.executeBefore('blueprin:before:project:update', { projectId, patch });

    const projects = await this.list();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) throw new Error(`Project "${projectId}" not found`);

    projects[idx] = { ...projects[idx], ...ctx.patch, updated_at: new Date().toISOString() };
    await this._storage.set('projects', projects);

    await this._hooks.executeAfter('blueprin:after:project:update', { project: projects[idx] });
    this._events.emit('blueprin:project:updated', { project: projects[idx] });

    return projects[idx];
  }

  async delete(projectId) {
    const ctx = await this._hooks.executeBefore('blueprin:before:project:delete', { projectId });

    const projects = await this.list();
    const filtered = projects.filter((p) => p.id !== ctx.projectId);
    await this._storage.set('projects', filtered);

    await this._hooks.executeAfter('blueprin:after:project:delete', { projectId: ctx.projectId });
    this._events.emit('blueprin:project:deleted', { projectId: ctx.projectId });
  }
}
