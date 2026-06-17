import { MultiSelectField } from '@/components';
import { RecResourceAdaptiveActivitiesEditSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/RecResourceAdaptiveActivitiesEditSection';
import { render, screen } from '@testing-library/react';
import type { FieldErrors } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components', () => ({
  MultiSelectField: vi.fn(
    ({ name, label, placeholder, errors, disabled }: any) => (
      <div data-testid={`multi-select-field-${name}`}>
        <label>{label}</label>
        {placeholder && <div data-testid="placeholder">{placeholder}</div>}
        <select
          multiple
          name={name}
          disabled={disabled}
          data-testid={`select-${name}`}
        />
        {errors?.[name] && (
          <div data-testid={`error-${name}`}>{errors[name].message}</div>
        )}
      </div>
    ),
  ),
}));

describe('RecResourceAdaptiveActivitiesEditSection', () => {
  it('renders the MultiSelectField with the expected label', () => {
    render(
      <RecResourceAdaptiveActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[{ id: '34', label: 'Adaptive Hiking' }] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByText('Accessible activities')).toBeInTheDocument();
  });

  it('renders the expected placeholder text', () => {
    render(
      <RecResourceAdaptiveActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[]}
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('placeholder')).toHaveTextContent(
      'Search and select accessible activities...',
    );
  });

  it('is not disabled when optionsLoading is false', () => {
    render(
      <RecResourceAdaptiveActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[{ id: '34', label: 'Adaptive Hiking' }] as any}
        optionsLoading={false}
      />,
    );

    expect(
      screen.getByTestId('select-adaptive_activity_codes'),
    ).not.toBeDisabled();
  });

  it('disables the field when optionsLoading is true', () => {
    render(
      <RecResourceAdaptiveActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[]}
        optionsLoading={true}
      />,
    );

    expect(screen.getByTestId('select-adaptive_activity_codes')).toBeDisabled();
  });

  it('passes correct name, label, hideLabel, and placeholder to MultiSelectField', () => {
    render(
      <RecResourceAdaptiveActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[]}
        optionsLoading={false}
      />,
    );

    expect(vi.mocked(MultiSelectField)).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'adaptive_activity_codes',
        label: 'Accessible activities',
        hideLabel: true,
        placeholder: 'Search and select accessible activities...',
      }),
      undefined,
    );
  });

  it('renders with an empty options list without throwing', () => {
    expect(() =>
      render(
        <RecResourceAdaptiveActivitiesEditSection
          control={{} as any}
          errors={{} as FieldErrors<any>}
          options={[]}
          optionsLoading={false}
        />,
      ),
    ).not.toThrow();
  });
});
