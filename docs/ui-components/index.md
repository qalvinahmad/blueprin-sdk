# UI Components

Blueprin SDK provides lightweight UI components that follow the Blueprin Design System.

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#374BFF` | Primary actions, links |
| Accent | `#FF923F` | Highlights, badges |
| Success | `#22C55E` | Positive states |
| Warning | `#F59E0B` | Caution states |
| Error | `#EF4444` | Error states |
| Border | `#E5E7EB` | Borders, dividers |
| Surface | `#FFFFFF` | Card backgrounds |
| Background | `#F4F4F4` | Page background |

## Components

### BlueprintButton

```javascript
import { BlueprintButton } from '@alvinahmad/blueprin-sdk/ui';

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg

BlueprintButton({
  variant: 'primary',
  size: 'md',
  onClick: handleClick,
  children: 'Simpan',
});
```

### BlueprintCard

```javascript
import { BlueprintCard } from '@alvinahmad/blueprin-sdk/ui';

// Variants: default, elevated, outlined

BlueprintCard({
  variant: 'default',
  padding: 'p-4',
  children: 'Card content',
});
```

### BlueprintBadge

```javascript
import { BlueprintBadge } from '@alvinahmad/blueprin-sdk/ui';

// Variants: default, success, warning, error, info
// Sizes: sm, md

BlueprintBadge({
  variant: 'success',
  children: 'Aktif',
});
```

### BlueprintInput

```javascript
import { BlueprintInput } from '@alvinahmad/blueprin-sdk/ui';

BlueprintInput({
  label: 'Nama Material',
  placeholder: 'Masukkan nama material',
  required: true,
  error: '', // Error message
  onChange: handleChange,
});
```

### BlueprintSelect

```javascript
import { BlueprintSelect } from '@alvinahmad/blueprin-sdk/ui';

BlueprintSelect({
  label: 'Kategori',
  options: [
    { value: 'BAHAN', label: 'Bahan' },
    { value: 'ALAT', label: 'Alat' },
    { value: 'UPAH', label: 'Upah' },
  ],
  value: 'BAHAN',
  onChange: handleChange,
});
```

### BlueprintTable

```javascript
import { BlueprintTable } from '@alvinahmad/blueprin-sdk/ui';

BlueprintTable({
  columns: [
    { key: 'name', label: 'Nama' },
    { key: 'unit', label: 'Satuan' },
    { key: 'price', label: 'Harga', render: (v) => formatIDR(v) },
  ],
  data: materials,
  emptyMessage: 'Belum ada material',
});
```

### BlueprintModal

```javascript
import { BlueprintModal } from '@alvinahmad/blueprin-sdk/ui';

BlueprintModal({
  open: isOpen,
  title: 'Tambah Material',
  onClose: () => setOpen(false),
  children: '<div>Form content</div>',
});
```

### BlueprintToast

```javascript
import { BlueprintToast } from '@alvinahmad/blueprin-sdk/ui';

BlueprintToast({
  type: 'success',
  message: 'Material berhasil ditambahkan',
  duration: 3000,
});
```

### BlueprintSkeleton

```javascript
import { BlueprintSkeleton } from '@alvinahmad/blueprin-sdk/ui';

// Variants: text, title, avatar, card

BlueprintSkeleton({ variant: 'text', lines: 3 });
BlueprintSkeleton({ variant: 'card' });
```
