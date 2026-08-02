/**
 * Logger - Configurable logging with prefix and debug support
 */

export class Logger {
  #prefix;
  #debug;

  constructor({ prefix = '[BlueprinSDK]', debug = false }) {
    this.#prefix = prefix;
    this.#debug = debug;
  }

  info(...args) {
    console.log(this.#prefix, ...args);
  }

  warn(...args) {
    console.warn(this.#prefix, '⚠', ...args);
  }

  error(...args) {
    console.error(this.#prefix, '✖', ...args);
  }

  debug(...args) {
    if (this.#debug) {
      console.log(this.#prefix, '🔍', ...args);
    }
  }

  success(...args) {
    console.log(this.#prefix, '✔', ...args);
  }
}
