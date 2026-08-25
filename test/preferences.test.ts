import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import {
  PreferencesManager,
  DEFAULT_USER_PREFERENCES,
  formatNumberWithSeparator,
} from '../lib/src/index.ts';

describe('User Preferences & Table 3-Digit Notation Suite', () => {
  let sdk: BlueprinSDK;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'test-prefs' });
    await sdk.init();
  });

  describe('1. Default Preferences & Initialization', () => {
    it('initializes PreferencesManager with default values', () => {
      expect(sdk.preferences).toBeInstanceOf(PreferencesManager);
      const prefs = sdk.preferences.getPreferences();

      expect(prefs.table.zebraRows).toBe(true);
      expect(prefs.table.numberSeparator).toBe('space');
      expect(prefs.table.showDecimals).toBe(true);
      expect(prefs.table.currency).toBe('IDR');
      expect(prefs.theme).toBe('system');
    });
  });

  describe('2. Table Zebra Row Striping', () => {
    it('generates zebra striped classes for alternate rows', () => {
      expect(sdk.preferences.isZebraEnabled()).toBe(true);

      const row0Class = sdk.preferences.getTableZebraClass(0);
      const row1Class = sdk.preferences.getTableZebraClass(1);

      expect(row0Class).toBe('bg-slate-50/50 dark:bg-neutral-900/50');
      expect(row1Class).toBe('');
    });

    it('disables zebra striping when table.zebraRows is false', async () => {
      await sdk.preferences.updatePreferences({
        table: {
          ...DEFAULT_USER_PREFERENCES.table,
          zebraRows: false,
        },
      });

      expect(sdk.preferences.isZebraEnabled()).toBe(false);
      expect(sdk.preferences.getTableZebraClass(0)).toBe('');
    });
  });

  describe('3. 3-Digit Number Notation & Decimals', () => {
    it('formats numbers with space separator (e.g. "340 000" and "34.0")', () => {
      // 340 000 thousands grouping
      const formattedThousands = sdk.preferences.formatNumber(340000, { showDecimals: false });
      expect(formattedThousands).toBe('340 000');

      // 34.0 decimal precision
      const formattedDecimal = sdk.preferences.formatNumber(34, { decimals: 1, showDecimals: true });
      expect(formattedDecimal).toBe('34.0');

      // 340 000.50
      const formattedMixed = sdk.preferences.formatNumber(340000.5, { decimals: 2 });
      expect(formattedMixed).toBe('340 000.50');
    });

    it('formats numbers with dot separator (e.g. "340.000")', () => {
      const formattedDot = sdk.preferences.formatNumber(340000, {
        separator: 'dot',
        showDecimals: false,
      });
      expect(formattedDot).toBe('340.000');

      const formattedDotDecimal = sdk.preferences.formatNumber(34.5, {
        separator: 'dot',
        decimals: 2,
      });
      expect(formattedDotDecimal).toBe('34,50');
    });

    it('formats numbers with comma separator (e.g. "340,000")', () => {
      const formattedComma = sdk.preferences.formatNumber(340000, {
        separator: 'comma',
        showDecimals: false,
      });
      expect(formattedComma).toBe('340,000');
    });

    it('splits formatted numbers into integer and decimal components', () => {
      const splitRes = sdk.preferences.splitFormattedNumber('340 000.50');
      expect(splitRes.main).toBe('340 000');
      expect(splitRes.decimal).toBe('50');
    });
  });

  describe('4. Currency & Date-Time Formatting', () => {
    it('formats currency with symbol and 3-digit notation', () => {
      const formattedIDR = sdk.preferences.formatCurrency(340000, 'IDR', { showDecimals: false });
      expect(formattedIDR).toBe('Rp 340 000');

      const formattedUSD = sdk.preferences.formatCurrency(340000, 'USD', { showDecimals: false });
      expect(formattedUSD).toBe('$ 340 000');
    });

    it('formats date-time according to locale', () => {
      const testDate = new Date('2026-08-25T10:00:00Z');
      const formatted = sdk.preferences.formatDateTime(testDate);
      expect(formatted).toBeDefined();
      expect(formatted).not.toBe('-');
    });
  });

  describe('5. Utility helper formatNumberWithSeparator', () => {
    it('formats standalone values with space, dot, or comma', () => {
      expect(formatNumberWithSeparator(340000, 'space')).toBe('340 000');
      expect(formatNumberWithSeparator(34, 'space', 1)).toBe('34.0');
      expect(formatNumberWithSeparator(340000, 'dot')).toBe('340.000');
      expect(formatNumberWithSeparator(340000, 'comma')).toBe('340,000');
    });
  });

  describe('6. Preferences Persistence and Events', () => {
    it('emits event and updates preferences in memory and storage', async () => {
      let eventPayload: any = null;
      sdk.events.on('blueprin:preferences:updated', (data) => {
        eventPayload = data.preferences;
      });

      const updated = await sdk.preferences.updatePreferences({
        theme: 'dark',
        table: {
          ...DEFAULT_USER_PREFERENCES.table,
          numberSeparator: 'dot',
          currency: 'USD',
        },
      });

      expect(updated.theme).toBe('dark');
      expect(updated.table.numberSeparator).toBe('dot');
      expect(eventPayload?.theme).toBe('dark');
    });
  });
});
