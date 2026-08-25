/**
 * @alvinahmad/blueprin-sdk - User Preferences Types
 *
 * Types for user experience customization, table zebra striping,
 * 3-digit number notation separators (e.g. "340 000", "340.000", "340,000"),
 * decimal precision formatting (e.g. "34.0"), date-time locales, and themes.
 */

export type ThemePreference = 'system' | 'light' | 'dark';

export type LanguagePreference = 'en' | 'id' | 'ar';

export type TableNumberSeparator = 'space' | 'dot' | 'comma' | 'locale';

export type TableNumericFontSize = 's' | 'm' | 'l';

export type UnitSystemPreference = 'metric' | 'imperial';

export interface TablePreferences {
  /**
   * Enable alternating zebra row colors on data tables.
   * Example: true enables background shading on alternate rows (e.g. index % 2 === 0).
   */
  zebraRows: boolean;
  /**
   * 3-digit thousands grouping notation separator.
   * - 'space': e.g. "340 000" (SI / French notation)
   * - 'dot': e.g. "340.000" (Indonesian / European notation)
   * - 'comma': e.g. "340,000" (US / UK notation)
   * - 'locale': uses browser locale setting
   */
  numberSeparator: TableNumberSeparator;
  /** Use tabular numeric monospaced font alignment */
  numericStyle: boolean;
  /** Numeric font size tier ('s' | 'm' | 'l') */
  numericFontSize: TableNumericFontSize;
  /** Default display currency code (e.g. 'IDR', 'USD') */
  currency: string;
  /**
   * Whether to display decimal precision digits.
   * Example: true displays "34.0" or "34.50", false displays integer only.
   */
  showDecimals: boolean;
}

export interface DateTimePreferences {
  /** Date-time formatting locale code ('en' -> 'en-US', 'id' -> 'id-ID', 'ar' -> 'ar-SA') */
  formatLocale: LanguagePreference;
}

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  uiScale: 's' | 'm' | 'l';
  linkHighlight: boolean;
  hideImages: boolean;
  dyslexiaFriendly: boolean;
  largeCursor: boolean;
  readingGuide: boolean;
  pauseAnimations: boolean;
}

export interface AppearancePreferences {
  fontFamily: 'geist' | 'poppins' | 'jakarta' | 'inter';
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface AnimationPreferences {
  backgroundEnabled: boolean;
  backgroundIntensity: 's' | 'm' | 'l';
}

export interface UserPreferences {
  theme: ThemePreference;
  language: LanguagePreference;
  unitSystem: UnitSystemPreference;
  dateTime: DateTimePreferences;
  table: TablePreferences;
  accessibility: AccessibilityPreferences;
  appearance: AppearancePreferences;
  animation: AnimationPreferences;
}

export const DATE_TIME_LOCALE_MAP: Record<LanguagePreference, string> = {
  en: 'en-US',
  id: 'id-ID',
  ar: 'ar-SA',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  unitSystem: 'metric',
  dateTime: {
    formatLocale: 'en',
  },
  table: {
    zebraRows: true,
    numberSeparator: 'space',
    numericStyle: true,
    numericFontSize: 'm',
    currency: 'IDR',
    showDecimals: true,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    uiScale: 'm',
    linkHighlight: false,
    hideImages: false,
    dyslexiaFriendly: false,
    largeCursor: false,
    readingGuide: false,
    pauseAnimations: false,
  },
  appearance: {
    fontFamily: 'geist',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: 0,
  },
  animation: {
    backgroundEnabled: true,
    backgroundIntensity: 's',
  },
};
