/**
 * UI Components for Blueprin Plugins
 *
 * React components following the Blueprin Design System.
 * Uses React.createElement for maximum compatibility (no JSX required).
 *
 * @example
 * import { BlueprintButton, BlueprintCard } from '@alvinahmad/blueprin-sdk/ui';
 *
 * function MyPluginPanel() {
 *   return React.createElement(BlueprintCard, { variant: 'elevated' },
 *     React.createElement('h2', null, 'My Plugin'),
 *     React.createElement(BlueprintButton, { variant: 'primary', onClick: handleSave }, 'Simpan')
 *   );
 * }
 */

import React from 'react';

const h = React.createElement;

/**
 * BlueprintButton - Primary action button
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
}: any) {
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

  const cls = [
    baseStyles,
    variants[variant],
    sizes[size],
    disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  return h('button', {
    className: cls,
    disabled: disabled || loading,
    onClick,
    ...rest,
  }, loading && h('span', { className: 'spinner mr-2' }), children);
}

/**
 * BlueprintCard - Content container
 */
export function BlueprintCard({
  variant = 'default',
  padding = 'p-4',
  children,
  className = '',
  onClick,
}: any) {
  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    outlined: 'bg-transparent border-2 border-gray-200',
  };

  const cls = [
    variants[variant],
    'rounded-lg',
    padding,
    onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : '',
    className,
  ].filter(Boolean).join(' ');

  return h('div', {
    className: cls,
    onClick,
    role: onClick ? 'button' : undefined,
    tabIndex: onClick ? 0 : undefined,
  }, children);
}

/**
 * BlueprintBadge - Status/label badge
 */
export function BlueprintBadge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}: any) {
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

  return h('span', {
    className: `inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`,
  }, children);
}

/**
 * BlueprintInput - Form input field
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
}: any) {
  return h('div', { className: `space-y-1 ${className}` },
    label && h('label', { className: 'block text-sm font-medium text-gray-700' },
      label, required && ' *'
    ),
    h('input', {
      type,
      value,
      placeholder,
      required,
      disabled,
      onChange,
      className: `w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#374BFF] focus:border-transparent ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`,
    }),
    error && h('p', { className: 'text-xs text-red-500' }, error)
  );
}

/**
 * BlueprintSelect - Dropdown select
 */
export function BlueprintSelect({
  label,
  options = [],
  value = '',
  onChange,
  className = '',
}: any) {
  return h('div', { className: `space-y-1 ${className}` },
    label && h('label', { className: 'block text-sm font-medium text-gray-700' }, label),
    h('select', {
      value,
      onChange,
      className: 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#374BFF] focus:border-transparent',
    }, options.map((opt) =>
      h('option', { key: opt.value, value: opt.value }, opt.label)
    ))
  );
}

/**
 * BlueprintTable - Data table
 */
export function BlueprintTable({
  columns = [],
  data = [],
  emptyMessage = 'Tidak ada data',
  className = '',
}: any) {
  if (data.length === 0) {
    return h('div', { className: 'text-center py-8 text-gray-500 text-sm' }, emptyMessage);
  }

  return h('div', { className: `overflow-x-auto ${className}` },
    h('table', { className: 'w-full text-sm' },
      h('thead', null,
        h('tr', { className: 'border-b border-gray-200' },
          columns.map((col) =>
            h('th', { key: col.key, className: 'text-left py-3 px-4 font-medium text-gray-600' }, col.label)
          )
        )
      ),
      h('tbody', null,
        data.map((row, i) =>
          h('tr', { key: row.id || i, className: 'border-b border-gray-100 hover:bg-gray-50' },
            columns.map((col: any) =>
              h('td', { key: col.key, className: 'py-3 px-4' },
                col.render ? col.render(row[col.key], row) : row[col.key] || '-'
              )
            )
          )
        )
      )
    )
  );
}

/**
 * BlueprintModal - Dialog/modal component
 */
export function BlueprintModal({
  open = false,
  title = '',
  onClose,
  children,
  className = '',
}: any) {
  if (!open) return null;

  return h('div', { className: 'fixed inset-0 z-50 flex items-center justify-center' },
    h('div', { className: 'fixed inset-0 bg-black/50', onClick: onClose }),
    h('div', { className: `relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 ${className}` },
      h('div', { className: 'flex items-center justify-between px-6 py-4 border-b border-gray-200' },
        h('h3', { className: 'text-lg font-semibold text-gray-900' }, title),
        h('button', { className: 'text-gray-400 hover:text-gray-600', onClick: onClose }, '\u2715')
      ),
      h('div', { className: 'px-6 py-4' }, children)
    )
  );
}

/**
 * BlueprintToast - Toast notification
 */
export function BlueprintToast({
  type = 'info',
  message = '',
  onClose,
  className = '',
}: any) {
  const icons = { success: '\u2714', error: '\u2716', warning: '\u26A0', info: '\u2139' };
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return h('div', {
    className: `flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} ${className}`,
    role: 'alert',
  },
    h('span', { className: 'text-lg' }, icons[type]),
    h('span', { className: 'flex-1 text-sm font-medium' }, message),
    onClose && h('button', { className: 'text-current opacity-50 hover:opacity-100', onClick: onClose }, '\u2715')
  );
}

/**
 * BlueprintSkeleton - Loading skeleton
 */
export function BlueprintSkeleton({ variant = 'text', lines = 1, className = '' }: any) {
  const base = 'animate-pulse bg-gray-200 rounded';

  switch (variant) {
    case 'title':
      return h('div', { className: `${base} h-6 w-48 ${className}` });
    case 'avatar':
      return h('div', { className: `${base} h-10 w-10 rounded-full ${className}` });
    case 'card':
      return h('div', { className: `${base} h-32 w-full rounded-lg ${className}` });
    default:
      return h('div', { className: `space-y-2 ${className}` },
        Array.from({ length: lines }).map((_, i) =>
          h('div', { key: i, className: `${base} h-4 w-full` })
        )
      );
  }
}
