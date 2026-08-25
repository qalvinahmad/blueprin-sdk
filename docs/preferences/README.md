# User Preferences & Table Notation Module (`@alvinahmad/blueprin-sdk/preferences`)

The User Preferences module manages application-wide display settings, including **table zebra row striping**, **3-digit numeric grouping separators** (e.g. `"340 000"`, `"340.000"`, `"340,000"`), **decimal precision formatting** (e.g. `"34.0"`), date-time locales, and theme styles.

---

## Features

- **Table Zebra Striping**: Helper methods (`isZebraEnabled()`, `getTableZebraClass(index)`) for alternating table row background styles.
- **3-Digit Number Notation**:
  - `space`: e.g. `"340 000"` or `"34.0"` (SI / French notation)
  - `dot`: e.g. `"340.000"` (Indonesian / European notation)
  - `comma`: e.g. `"340,000"` (US / UK notation)
  - `locale`: dynamic client browser formatting
- **Decimal Precision Control**: Toggle whether to show decimal values and format fixed decimal points (e.g. `"34.0"`).
- **Currency Formatting**: Format numbers directly with currency symbols and preferred 3-digit notation (e.g. `formatCurrency(340000)` -> `"Rp 340 000"`).
- **Event-Driven Reactivity**: Emits `blueprin:preferences:updated` on configuration change.

---

## Quick Start

```ts
import { BlueprinSDK, formatNumberWithSeparator } from '@alvinahmad/blueprin-sdk';

const sdk = new BlueprinSDK({ appId: 'my-construction-app' });
await sdk.init();

// 1. Format numbers using user preferences
console.log(sdk.preferences.formatNumber(340000)); // "340 000"
console.log(sdk.preferences.formatNumber(34.0, { decimals: 1 })); // "34.0"
console.log(sdk.preferences.formatCurrency(340000)); // "Rp 340 000"

// 2. Table Zebra Striping in React/UI
const rows = ['Item 1', 'Item 2', 'Item 3'];
rows.map((item, index) => {
  const zebraClass = sdk.preferences.getTableZebraClass(index);
  // Row 0: "bg-slate-50/50 dark:bg-neutral-900/50"
  // Row 1: ""
});

// 3. Update User Preferences
await sdk.preferences.updatePreferences({
  theme: 'dark',
  table: {
    zebraRows: true,
    numberSeparator: 'space',
    showDecimals: true,
    currency: 'IDR',
    numericStyle: true,
    numericFontSize: 'm',
  },
});

// 4. Standalone utility
console.log(formatNumberWithSeparator(340000, 'space')); // "340 000"
console.log(formatNumberWithSeparator(34, 'space', 1)); // "34.0"
```

---

## API Reference

### `PreferencesManager`

| Method / Property | Description |
|---|---|
| `getPreferences()` | Returns current active `UserPreferences` object. |
| `updatePreferences(patch)` | Merges partial configuration, persists to storage, and emits update event. |
| `isZebraEnabled()` | Returns boolean flag whether zebra striping on tables is active. |
| `getTableZebraClass(index, options?)` | Returns alternating CSS class for row index. |
| `formatNumber(value, options?)` | Formats a number with 3-digit notation (e.g. `"340 000"` or `"34.0"`). |
| `formatCurrency(value, currency?, options?)` | Formats currency with symbol (e.g. `"Rp 340 000"`). |
| `formatDateTime(date, options?)` | Formats date-time using preferred locale. |
| `splitFormattedNumber(str)` | Splits formatted string into integer main part and decimal part. |
| `reset()` | Resets all settings to `DEFAULT_USER_PREFERENCES`. |
