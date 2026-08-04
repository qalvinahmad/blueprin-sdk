/**
 * Hook Registry - Before/after lifecycle hooks for extensibility
 */

export class HookRegistry {
  private _logger: any;
  private _hooks: any;
  constructor({ logger }) {
    this._logger = logger;
    this._hooks = new Map();
  }

  register(hookName, callback, options: any = {}) {
    if (!this._hooks.has(hookName)) {
      this._hooks.set(hookName, []);
    }

    const entry = {
      callback,
      pluginId: options.pluginId || 'anonymous',
      priority: options.priority || 0,
    };

    const list = this._hooks.get(hookName);
    list.push(entry);
    list.sort((a, b) => b.priority - a.priority);

    this._logger.debug(`Hook registered: ${hookName} by ${entry.pluginId}`);

    return () => this.unregister(hookName, callback);
  }

  unregister(hookName, callback) {
    const list = this._hooks.get(hookName);
    if (!list) return;

    const idx = list.findIndex((entry) => entry.callback === callback);
    if (idx !== -1) {
      list.splice(idx, 1);
    }

    if (list.length === 0) {
      this._hooks.delete(hookName);
    }
  }

  async execute(hookName, context) {
    const list = this._hooks.get(hookName);
    if (!list || list.length === 0) return context;

    let data = { ...context };
    this._logger.debug(`Executing hook: ${hookName} (${list.length} callbacks)`);

    for (const entry of list) {
      try {
        // Enforce a 200ms timeout for runtime sandboxing to prevent infinite loops/hangs
        const result: any = await Promise.race([
          Promise.resolve(entry.callback(data)),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Hook execution timed out (200ms limit)')), 200)
          )
        ]);

        if (result !== undefined) {
          data = { ...data, ...result };
        }
      } catch (error) {
        this._logger.error(`Hook "${hookName}" error in plugin "${entry.pluginId}":`, error);
      }
    }

    return data;
  }

  async executeBefore(hookName, context) {
    return this.execute(hookName, context);
  }

  async executeAfter(hookName, context) {
    return this.execute(hookName, context);
  }

  removePluginHooks(pluginId) {
    for (const [hookName, list] of this._hooks) {
      const filtered = list.filter((entry) => entry.pluginId !== pluginId);
      if (filtered.length === 0) {
        this._hooks.delete(hookName);
      } else {
        this._hooks.set(hookName, filtered);
      }
    }
  }

  clear() {
    this._hooks.clear();
  }

  count(hookName) {
    if (hookName) {
      return this._hooks.get(hookName)?.length ?? 0;
    }
    let total = 0;
    for (const list of this._hooks.values()) {
      total += list.length;
    }
    return total;
  }

  createScoped(pluginId) {
    return {
      register: (hookName, callback, options: any = {}) =>
        this.register(hookName, callback, { ...options, pluginId }),
      unregister: (hookName, callback) => this.unregister(hookName, callback),
      execute: (hookName, context) => this.execute(hookName, context),
      executeBefore: (hookName, context) => this.executeBefore(hookName, context),
      executeAfter: (hookName, context) => this.executeAfter(hookName, context),
    };
  }
}
