/**
 * UI Components for Blueprin Plugins
 *
 * These components ensure visual consistency across all plugins.
 * They are lightweight wrappers around standard HTML elements
 * that follow the Blueprin Design System.
 */

/**
 * BlueprintButton - Primary action button
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.disabled
 * @param {boolean} props.loading
 * @param {Function} props.onClick
 * @param {React.ReactNode} props.children
 */
export function BlueprintButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  ...rest
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-[#374BFF] text-white hover:bg-[#2D3FE0] focus:ring-[#374BFF]',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return `<button
    class="${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}"
    disabled="${disabled || loading}"
    onClick="${onClick}"
    ${Object.entries(rest)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')}
  >
    ${loading ? '<span class="spinner mr-2"></span>' : ''}
    ${children}
  </button>`;
}

/**
 * BlueprintCard - Content container
 * @param {Object} props
 * @param {'default'|'elevated'|'outlined'} props.variant
 * @param {string} props.padding
 * @param {React.ReactNode} props.children
 */
export function BlueprintCard({
  variant = 'default',
  padding = 'p-4',
  children,
  className = '',
  onClick,
}) {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-transparent border-2 border-gray-200',
  };

  return `<div
    class="${variants[variant]} rounded-lg ${padding} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''} ${className}"
    ${onClick ? `onClick="${onClick}"` : ''}
  >
    ${children}
  </div>`;
}

/**
 * BlueprintBadge - Status/label badge
 * @param {Object} props
 * @param {'default'|'success'|'warning'|'error'|'info'} props.variant
 * @param {'sm'|'md'} props.size
 */
export function BlueprintBadge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return `<span class="inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}">
    ${children}
  </span>`;
}

/**
 * BlueprintInput - Form input field
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.placeholder
 * @param {string} props.type
 * @param {string} props.value
 * @param {string} props.error
 * @param {boolean} props.required
 */
export function BlueprintInput({
  label,
  placeholder = '',
  type = 'text',
  value = '',
  error = '',
  required = false,
  disabled = false,
  onChange,
  className = '',
}) {
  return `<div class="space-y-1 ${className}">
    ${label ? `<label class="block text-sm font-medium text-gray-700">${label}${required ? ' *' : ''}</label>` : ''}
    <input
      type="${type}"
      value="${value}"
      placeholder="${placeholder}"
      required="${required}"
      disabled="${disabled}"
      onChange="${onChange}"
      class="w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#374BFF] focus:border-transparent ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}"
    />
    ${error ? `<p class="text-xs text-red-500">${error}</p>` : ''}
  </div>`;
}

/**
 * BlueprintSelect - Dropdown select
 * @param {Object} props
 * @param {string} props.label
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.value
 * @param {Function} props.onChange
 */
export function BlueprintSelect({
  label,
  options = [],
  value = '',
  onChange,
  className = '',
}) {
  return `<div class="space-y-1 ${className}">
    ${label ? `<label class="block text-sm font-medium text-gray-700">${label}</label>` : ''}
    <select
      value="${value}"
      onChange="${onChange}"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#374BFF] focus:border-transparent"
    >
      ${options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
  </div>`;
}

/**
 * BlueprintTable - Data table
 * @param {Object} props
 * @param {Array<{key: string, label: string, render?: Function}>} props.columns
 * @param {Array<Object>} props.data
 * @param {string} props.emptyMessage
 */
export function BlueprintTable({
  columns = [],
  data = [],
  emptyMessage = 'Tidak ada data',
  className = '',
}) {
  if (data.length === 0) {
    return `<div class="text-center py-8 text-gray-500 text-sm">${emptyMessage}</div>`;
  }

  return `<div class="overflow-x-auto ${className}">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          ${columns.map((col) => `<th class="text-left py-3 px-4 font-medium text-gray-600">${col.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.map((row, i) => `
          <tr key="${i}" class="border-b border-gray-100 hover:bg-gray-50">
            ${columns.map((col) => `<td class="py-3 px-4">${col.render ? col.render(row[col.key], row) : row[col.key] || '-'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

/**
 * BlueprintModal - Dialog/modal component
 * @param {Object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {Function} props.onClose
 * @param {React.ReactNode} props.children
 */
export function BlueprintModal({
  open = false,
  title = '',
  onClose,
  children,
  className = '',
}) {
  if (!open) return '';

  return `<div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/50" onClick="${onClose}"></div>
    <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 ${className}">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
        <button class="text-gray-400 hover:text-gray-600" onClick="${onClose}">✕</button>
      </div>
      <div class="px-6 py-4">
        ${children}
      </div>
    </div>
  </div>`;
}

/**
 * BlueprintToast - Toast notification
 * @param {Object} props
 * @param {'success'|'error'|'warning'|'info'} props.type
 * @param {string} props.message
 * @param {number} props.duration - Auto-dismiss in ms (0 = no auto-dismiss)
 */
export function BlueprintToast({
  type = 'info',
  message = '',
  duration = 3000,
  onClose,
  className = '',
}) {
  const icons = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return `<div class="flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} ${className}" role="alert">
    <span class="text-lg">${icons[type]}</span>
    <span class="flex-1 text-sm font-medium">${message}</span>
    ${onClose ? `<button class="text-current opacity-50 hover:opacity-100" onClick="${onClose}">✕</button>` : ''}
  </div>`;
}

/**
 * BlueprintSkeleton - Loading skeleton
 * @param {Object} props
 * @param {'text'|'title'|'avatar'|'card'} props.variant
 * @param {number} props.lines - Number of lines for text variant
 */
export function BlueprintSkeleton({ variant = 'text', lines = 1, className = '' }) {
  const base = 'animate-pulse bg-gray-200 rounded';

  switch (variant) {
    case 'title':
      return `<div class="${base} h-6 w-48 ${className}"></div>`;
    case 'avatar':
      return `<div class="${base} h-10 w-10 rounded-full ${className}"></div>`;
    case 'card':
      return `<div class="${base} h-32 w-full rounded-lg ${className}"></div>`;
    default:
      return `<div class="space-y-2 ${className}">
        ${Array(lines).fill(`<div class="${base} h-4 w-full"></div>`).join('')}
      </div>`;
  }
}
