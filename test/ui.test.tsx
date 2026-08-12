import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  BlueprintButton,
  BlueprintCard,
  BlueprintBadge,
  BlueprintInput,
  BlueprintSelect,
  BlueprintTable,
  BlueprintModal,
  BlueprintToast,
  BlueprintSkeleton,
} from '../lib/src/ui/index.tsx';

// Helper to extract rendered output from React.createElement
function render(element) {
  if (!element) return null;
  const { type, props } = element;
  if (typeof type === 'string') {
    return { type, props: { ...props, children: renderChildren(props.children) } };
  }
  if (typeof type === 'function') {
    return render(type(props));
  }
  return element;
}

function renderChildren(children) {
  if (!children) return undefined;
  if (typeof children === 'string' || typeof children === 'number') return children;
  if (Array.isArray(children)) return children.map(render);
  return render(children);
}

describe('BlueprintButton', () => {
  it('should render with default props', () => {
    const el = BlueprintButton({ children: 'Click me' });
    const rendered = render(el);
    expect(rendered.type).toBe('button');
    // Children may be [null, 'Click me'] due to loading spinner
    const childText = Array.isArray(rendered.props.children)
      ? rendered.props.children.find(c => typeof c === 'string')
      : rendered.props.children;
    expect(childText).toBe('Click me');
  });

  it('should render with primary variant', () => {
    const el = BlueprintButton({ variant: 'primary', children: 'Submit' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('#374BFF');
  });

  it('should render with secondary variant', () => {
    const el = BlueprintButton({ variant: 'secondary', children: 'Cancel' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-gray-100');
  });

  it('should render with danger variant', () => {
    const el = BlueprintButton({ variant: 'danger', children: 'Delete' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-red-500');
  });

  it('should render with ghost variant', () => {
    const el = BlueprintButton({ variant: 'ghost', children: 'Ghost' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-transparent');
  });

  it('should render with small size', () => {
    const el = BlueprintButton({ size: 'sm', children: 'Small' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('text-xs');
  });

  it('should render with large size', () => {
    const el = BlueprintButton({ size: 'lg', children: 'Large' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('text-base');
  });

  it('should be disabled when disabled prop is true', () => {
    const el = BlueprintButton({ disabled: true, children: 'Disabled' });
    const rendered = render(el);
    expect(rendered.props.disabled).toBe(true);
    expect(rendered.props.className).toContain('opacity-50');
  });

  it('should be disabled when loading', () => {
    const el = BlueprintButton({ loading: true, children: 'Loading' });
    const rendered = render(el);
    expect(rendered.props.disabled).toBe(true);
  });

  it('should call onClick when clicked', () => {
    const onClick = () => {};
    const el = BlueprintButton({ onClick, children: 'Click' });
    const rendered = render(el);
    expect(rendered.props.onClick).toBe(onClick);
  });
});

describe('BlueprintCard', () => {
  it('should render with default variant', () => {
    const el = BlueprintCard({ children: 'Content' });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
    expect(rendered.props.className).toContain('bg-white');
    expect(rendered.props.className).toContain('border-gray-200');
  });

  it('should render with elevated variant', () => {
    const el = BlueprintCard({ variant: 'elevated', children: 'Content' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('shadow-md');
  });

  it('should render with outlined variant', () => {
    const el = BlueprintCard({ variant: 'outlined', children: 'Content' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('border-2');
  });

  it('should be clickable when onClick provided', () => {
    const onClick = () => {};
    const el = BlueprintCard({ onClick, children: 'Clickable' });
    const rendered = render(el);
    expect(rendered.props.onClick).toBe(onClick);
    expect(rendered.props.role).toBe('button');
  });
});

describe('BlueprintBadge', () => {
  it('should render with default variant', () => {
    const el = BlueprintBadge({ children: 'Badge' });
    const rendered = render(el);
    expect(rendered.type).toBe('span');
    expect(rendered.props.className).toContain('bg-gray-100');
  });

  it('should render with success variant', () => {
    const el = BlueprintBadge({ variant: 'success', children: 'OK' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-green-100');
  });

  it('should render with error variant', () => {
    const el = BlueprintBadge({ variant: 'error', children: 'Error' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-red-100');
  });

  it('should render with warning variant', () => {
    const el = BlueprintBadge({ variant: 'warning', children: 'Warn' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-yellow-100');
  });

  it('should render with info variant', () => {
    const el = BlueprintBadge({ variant: 'info', children: 'Info' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-blue-100');
  });

  it('should render with medium size', () => {
    const el = BlueprintBadge({ size: 'md', children: 'Badge' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('text-sm');
  });
});

describe('BlueprintInput', () => {
  it('should render input', () => {
    const el = BlueprintInput({});
    const rendered = render(el);
    expect(rendered.type).toBe('div');
  });

  it('should render with label', () => {
    const el = BlueprintInput({ label: 'Name' });
    const rendered = render(el);
    // Children is [labelElement, inputElement, null]
    const labelEl = rendered.props.children[0];
    expect(labelEl).toBeTruthy();
    const labelText = Array.isArray(labelEl.props.children)
      ? labelEl.props.children[0]
      : labelEl.props.children;
    expect(labelText).toBe('Name');
  });

  it('should render with error', () => {
    const el = BlueprintInput({ error: 'Required' });
    const rendered = render(el);
    // Children is [null, inputElement, errorElement]
    const errorEl = rendered.props.children[2];
    expect(errorEl).toBeTruthy();
    expect(errorEl.props.children).toBe('Required');
  });

  it('should render required indicator', () => {
    const el = BlueprintInput({ label: 'Email', required: true });
    const rendered = render(el);
    const label = rendered.props.children[0];
    expect(label.props.children).toContain(' *');
  });

  it('should be disabled', () => {
    const el = BlueprintInput({ disabled: true });
    const rendered = render(el);
    const input = rendered.props.children[1];
    expect(input.props.disabled).toBe(true);
  });
});

describe('BlueprintSelect', () => {
  it('should render select with options', () => {
    const options = [{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }];
    const el = BlueprintSelect({ options });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
  });

  it('should render with label', () => {
    const el = BlueprintSelect({ label: 'Category', options: [] });
    const rendered = render(el);
    // Children is [labelElement, selectElement]
    const labelEl = rendered.props.children[0];
    expect(labelEl).toBeTruthy();
    expect(labelEl.props.children).toBe('Category');
  });
});

describe('BlueprintTable', () => {
  it('should render empty message when no data', () => {
    const el = BlueprintTable({ columns: [], data: [] });
    const rendered = render(el);
    expect(rendered.props.children).toBe('Tidak ada data');
  });

  it('should render custom empty message', () => {
    const el = BlueprintTable({ columns: [], data: [], emptyMessage: 'Kosong' });
    const rendered = render(el);
    expect(rendered.props.children).toBe('Kosong');
  });

  it('should render table with data', () => {
    const columns = [{ key: 'name', label: 'Name' }];
    const data = [{ id: 1, name: 'Test' }];
    const el = BlueprintTable({ columns, data });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
  });

  it('should render custom render function', () => {
    const columns = [{ key: 'name', label: 'Name', render: (val) => `Custom: ${val}` }];
    const data = [{ id: 1, name: 'Test' }];
    const el = BlueprintTable({ columns, data });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
  });
});

describe('BlueprintModal', () => {
  it('should return null when not open', () => {
    const el = BlueprintModal({ open: false, title: 'Test' });
    expect(el).toBeNull();
  });

  it('should render when open', () => {
    const el = BlueprintModal({ open: true, title: 'Test', children: 'Content' });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
    expect(rendered.props.className).toContain('fixed');
  });
});

describe('BlueprintToast', () => {
  it('should render success toast', () => {
    const el = BlueprintToast({ type: 'success', message: 'Done!' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-green-50');
  });

  it('should render error toast', () => {
    const el = BlueprintToast({ type: 'error', message: 'Failed!' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-red-50');
  });

  it('should render warning toast', () => {
    const el = BlueprintToast({ type: 'warning', message: 'Warning!' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-yellow-50');
  });

  it('should render info toast', () => {
    const el = BlueprintToast({ type: 'info', message: 'Info' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('bg-blue-50');
  });

  it('should render close button when onClose provided', () => {
    const onClose = () => {};
    const el = BlueprintToast({ type: 'info', message: 'Test', onClose });
    const rendered = render(el);
    expect(rendered.props.className).toContain('flex');
  });
});

describe('BlueprintSkeleton', () => {
  it('should render text skeleton', () => {
    const el = BlueprintSkeleton({ variant: 'text' });
    const rendered = render(el);
    expect(rendered.type).toBe('div');
    // Text variant uses space-y-2 by default
    expect(rendered.props.className).toContain('space-y-2');
  });

  it('should render title skeleton', () => {
    const el = BlueprintSkeleton({ variant: 'title' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('h-6');
  });

  it('should render avatar skeleton', () => {
    const el = BlueprintSkeleton({ variant: 'avatar' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('rounded-full');
  });

  it('should render card skeleton', () => {
    const el = BlueprintSkeleton({ variant: 'card' });
    const rendered = render(el);
    expect(rendered.props.className).toContain('h-32');
  });

  it('should render multiple lines', () => {
    const el = BlueprintSkeleton({ variant: 'text', lines: 3 });
    const rendered = render(el);
    expect(rendered.props.children.length).toBe(3);
  });
});
