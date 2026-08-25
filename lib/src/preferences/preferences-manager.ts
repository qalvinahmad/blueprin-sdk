/**
 * @alvinahmad/blueprin-sdk - PreferencesManager
 *
 * User preferences management, table zebra striping helper,
 * 3-digit number notation formatter (e.g. "340 000", "340.000", "340,000"),
 * and decimal precision handler (e.g. "34.0").
 */

import type {
  UserPreferences,
  TablePreferences,
  TableNumberSeparator,
  LanguagePreference,
} from './types.js';
import { DEFAULT_USER_PREFERENCES, DATE_TIME_LOCALE_MAP } from './types.js';

export interface PreferencesManagerConfig {
  storage?: any;
  events?: any;
  initialPreferences?: Partial<UserPreferences>;
}

export class PreferencesManager {
  private _storage?: any;
  private _events?: any;
  private _preferences: UserPreferences;

  constructor({ storage, events, initialPreferences }: PreferencesManagerConfig = {}) {
    this._storage = storage;
    this._events = events;
    this._preferences = this._deepMerge(DEFAULT_USER_PREFERENCES, initialPreferences || {});
  }

  /**
   * Get the current active user preferences.
   */
  getPreferences(): UserPreferences {
    return JSON.parse(JSON.stringify(this._preferences));
  }

  /**
   * Update preferences with a partial configuration patch and persist if storage adapter is available.
   *
   * @param patch - Partial preferences object to merge
   * @returns Updated UserPreferences
   */
  async updatePreferences(patch: Partial<UserPreferences>): Promise<UserPreferences> {
    this._preferences = this._deepMerge(this._preferences, patch);

    if (this._storage && typeof this._storage.set === 'function') {
      await this._storage.set('user_preferences_v1', this._preferences);
    }

    if (this._events && typeof this._events.emit === 'function') {
      this._events.emit('blueprin:preferences:updated', { preferences: this._preferences });
    }

    return this.getPreferences();
  }

  /**
   * Check whether zebra row striping on data tables is enabled in user preferences.
   *
   * @returns boolean (e.g. true enables alternate row shading)
   */
  isZebraEnabled(): boolean {
    return Boolean(this._preferences.table.zebraRows);
  }

  /**
   * Returns a CSS class for alternating zebra striped table rows.
   *
   * @param index - Zero-based row index (0, 1, 2, ...)
   * @param options - Custom even and odd CSS classes
   * @returns CSS class string
   */
  getTableZebraClass(
    index: number,
    options: { evenClass?: string; oddClass?: string } = {}
  ): string {
    if (!this.isZebraEnabled()) {
      return '';
    }

    const evenClass = options.evenClass ?? 'bg-slate-50/50 dark:bg-neutral-900/50';
    const oddClass = options.oddClass ?? '';

    return index % 2 === 0 ? evenClass : oddClass;
  }

  /**
   * Format a numeric value according to the configured 3-digit separator and decimal preferences.
   *
   * Examples:
   * - Space separator: 340000 -> "340 000", 34 -> "34.0" (with decimals: 1)
   * - Dot separator: 340000 -> "340.000", 34.5 -> "34,50"
   * - Comma separator: 340000 -> "340,000", 34.5 -> "34.50"
   *
   * @param value - Number or numeric string to format (e.g. 340000 or 34.0)
   * @param options - Optional override formatting parameters
   * @returns Formatted string (e.g. "340 000", "34.0", or "340.000")
   */
  formatNumber(
    value: number | string | null | undefined,
    options: {
      decimals?: number;
      showDecimals?: boolean;
      separator?: TableNumberSeparator;
    } = {}
  ): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const num = Number(value);
    if (Number.isNaN(num)) {
      return String(value);
    }

    const separator = options.separator ?? this._preferences.table.numberSeparator;
    const showDecimals = options.showDecimals ?? this._preferences.table.showDecimals;
    const decimalPlaces = options.decimals ?? (showDecimals ? 2 : 0);

    if (separator === 'locale') {
      const localeCode =
        DATE_TIME_LOCALE_MAP[this._preferences.dateTime.formatLocale] || 'en-US';
      return num.toLocaleString(localeCode, {
        minimumFractionDigits: showDecimals ? decimalPlaces : 0,
        maximumFractionDigits: showDecimals ? decimalPlaces : 0,
      });
    }

    const fixedStr = showDecimals ? num.toFixed(decimalPlaces) : num.toFixed(0);
    const parts = fixedStr.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 && showDecimals ? parts[1] : '';

    let thousandsSep = ' ';
    let decimalSep = '.';

    if (separator === 'dot') {
      thousandsSep = '.';
      decimalSep = ',';
    } else if (separator === 'comma') {
      thousandsSep = ',';
      decimalSep = '.';
    } else if (separator === 'space') {
      thousandsSep = ' ';
      decimalSep = '.';
    }

    // 3-digit regex grouping for thousands (e.g. 340000 -> "340 000" or "340.000")
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);

    return decimalPart ? `${integerPart}${decimalSep}${decimalPart}` : integerPart;
  }

  /**
   * Format currency values using the preferred 3-digit notation and currency symbol.
   *
   * Example:
   * - formatCurrency(340000) -> "Rp 340 000" (when separator is "space")
   * - formatCurrency(340000, "USD") -> "$ 340 000"
   *
   * @param value - Numeric monetary value (e.g. 340000 or 34.0)
   * @param currency - Optional currency code (defaults to preferences currency e.g. 'IDR')
   * @returns Formatted currency string
   */
  formatCurrency(
    value: number | string | null | undefined,
    currency?: string,
    options?: { showDecimals?: boolean }
  ): string {
    const curr = currency || this._preferences.table.currency || 'IDR';
    const formattedNum = this.formatNumber(value, options);

    if (formattedNum === '-') return '-';

    const symbolMap: Record<string, string> = {
      IDR: 'Rp',
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
      MYR: 'RM',
      AUD: 'A$',
      JPY: '¥',
    };

    const symbol = symbolMap[curr] || curr;
    return `${symbol} ${formattedNum}`;
  }

  /**
   * Format date-time values using the preferred locale.
   *
   * @param value - Date instance, timestamp number, or ISO string
   * @param options - Intl.DateTimeFormatOptions configuration
   * @returns Formatted date-time string
   */
  formatDateTime(
    value: string | Date | number | null | undefined,
    options: Intl.DateTimeFormatOptions = {}
  ): string {
    if (!value) return '-';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    const localeCode =
      DATE_TIME_LOCALE_MAP[this._preferences.dateTime.formatLocale] || 'en-US';

    return date.toLocaleString(localeCode, {
      dateStyle: options.dateStyle || 'medium',
      timeStyle: options.timeStyle,
      ...options,
    });
  }

  /**
   * Split a formatted number string into its integer main part and decimal precision part.
   * Useful for styling decimal digits in smaller or muted typography (e.g. "340 000.00" -> { main: "340 000", decimal: "00" }).
   *
   * @param formattedValue - Pre-formatted number string (e.g. "340 000.50" or "34.0")
   * @returns { main: string; decimal: string }
   */
  splitFormattedNumber(formattedValue: string): { main: string; decimal: string } {
    if (!formattedValue || typeof formattedValue !== 'string') {
      return { main: formattedValue || '', decimal: '' };
    }

    const separator = this._preferences.table.numberSeparator;
    let decimalSep = '.';

    if (separator === 'dot') {
      decimalSep = ',';
    } else if (separator === 'locale') {
      const localeCode =
        DATE_TIME_LOCALE_MAP[this._preferences.dateTime.formatLocale] || 'en-US';
      const sample = (1.1).toLocaleString(localeCode);
      decimalSep = sample.includes(',') ? ',' : '.';
    }

    const parts = formattedValue.split(decimalSep);
    if (parts.length > 1) {
      return { main: parts[0], decimal: parts[1] };
    }

    return { main: formattedValue, decimal: '' };
  }

  /**
   * Reset all user preferences back to default values.
   */
  async reset(): Promise<UserPreferences> {
    return this.updatePreferences(DEFAULT_USER_PREFERENCES);
  }

  private _deepMerge(target: any, source: any): any {
    const output = { ...target };
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this._deepMerge(target[key], source[key]);
          }
        } else if (source[key] !== undefined) {
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  private _isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}
