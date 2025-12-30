import { MultiSelectField } from '@/components';
import { RecResourceActivitiesEditSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/RecResourceActivitiesEditSection';
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

describe('RecResourceActivitiesEditSection', () => {
  it('renders the MultiSelectField with expected label and placeholder', () => {
    render(
      <RecResourceActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={
          [
            { id: '1', label: 'Hiking' },
            { id: '2', label: 'Camping' },
          ] as any
        }
        optionsLoading={false}
      />,
    );

    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByTestId('placeholder')).toHaveTextContent(
      'Search and select activities...',
    );
    expect(screen.getByTestId('select-activity_codes')).not.toBeDisabled();
  });

  it('disables the field when options are loading', () => {
    render(
      <RecResourceActivitiesEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={true}
      />,
    );

    expect(screen.getByTestId('select-activity_codes')).toBeDisabled();
  });

  it('renders errors when provided', () => {
    render(
      <RecResourceActivitiesEditSection
        control={{} as any}
        errors={
          {
            activity_codes: { message: 'At least one activity is required' },
          } as any
        }
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('error-activity_codes')).toHaveTextContent(
      'At least one activity is required',
    );
  });

  it('passes expected props through to MultiSelectField', () => {
    render(
      <RecResourceActivitiesEditSection
        control={{ test: 'control' } as any}
        errors={{} as FieldErrors<any>}
        options={[{ id: '1', label: 'Hiking' }] as any}
        optionsLoading={false}
      />,
    );

    expect(vi.mocked(MultiSelectField)).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'activity_codes',
        label: 'Activities',
        placeholder: 'Search and select activities...',
      }),
      undefined,
    );
  });
});
