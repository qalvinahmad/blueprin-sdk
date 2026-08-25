/**
 * @alvinahmad/blueprin-sdk - PreferencesManager
 *
 * User preferences management, table zebra striping helper,
 * 3-digit number notation formatter (e.g. "340 000", "340.000", "340,000"),
 * and decimal precision handler (e.g. "34.0").
 */
import type { UserPreferences, TableNumberSeparator } from './types.js';
export interface PreferencesManagerConfig {
    storage?: any;
    events?: any;
    initialPreferences?: Partial<UserPreferences>;
}
export declare class PreferencesManager {
    private _storage?;
    private _events?;
    private _preferences;
    constructor({ storage, events, initialPreferences }?: PreferencesManagerConfig);
    /**
     * Get the current active user preferences.
     */
    getPreferences(): UserPreferences;
    /**
     * Update preferences with a partial configuration patch and persist if storage adapter is available.
     *
     * @param patch - Partial preferences object to merge
     * @returns Updated UserPreferences
     */
    updatePreferences(patch: Partial<UserPreferences>): Promise<UserPreferences>;
    /**
     * Check whether zebra row striping on data tables is enabled in user preferences.
     *
     * @returns boolean (e.g. true enables alternate row shading)
     */
    isZebraEnabled(): boolean;
    /**
     * Returns a CSS class for alternating zebra striped table rows.
     *
     * @param index - Zero-based row index (0, 1, 2, ...)
     * @param options - Custom even and odd CSS classes
     * @returns CSS class string
     */
    getTableZebraClass(index: number, options?: {
        evenClass?: string;
        oddClass?: string;
    }): string;
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
    formatNumber(value: number | string | null | undefined, options?: {
        decimals?: number;
        showDecimals?: boolean;
        separator?: TableNumberSeparator;
    }): string;
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
    formatCurrency(value: number | string | null | undefined, currency?: string, options?: {
        showDecimals?: boolean;
    }): string;
    /**
     * Format date-time values using the preferred locale.
     *
     * @param value - Date instance, timestamp number, or ISO string
     * @param options - Intl.DateTimeFormatOptions configuration
     * @returns Formatted date-time string
     */
    formatDateTime(value: string | Date | number | null | undefined, options?: Intl.DateTimeFormatOptions): string;
    /**
     * Split a formatted number string into its integer main part and decimal precision part.
     * Useful for styling decimal digits in smaller or muted typography (e.g. "340 000.00" -> { main: "340 000", decimal: "00" }).
     *
     * @param formattedValue - Pre-formatted number string (e.g. "340 000.50" or "34.0")
     * @returns { main: string; decimal: string }
     */
    splitFormattedNumber(formattedValue: string): {
        main: string;
        decimal: string;
    };
    /**
     * Reset all user preferences back to default values.
     */
    reset(): Promise<UserPreferences>;
    private _deepMerge;
    private _isObject;
}
