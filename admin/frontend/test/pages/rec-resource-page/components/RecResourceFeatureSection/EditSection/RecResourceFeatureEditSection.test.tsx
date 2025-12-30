import { RecResourceFeatureEditSection } from '@/pages/rec-resource-page/components/RecResourceFeatureSection/EditSection/RecResourceFeatureEditSection';
import { render, screen } from '@testing-library/react';
import type { FieldErrors } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-select', () => ({
  __esModule: true,
  default: vi.fn(
    ({
      id,
      isMulti,
      placeholder,
      isDisabled,
      className,
      closeMenuOnSelect,
    }: any) => (
      <div data-testid="mock-multi-select">
        <div data-testid="select-id">{id}</div>
        <div data-testid="multi-select-info">
          Multi: {isMulti ? 'true' : 'false'}
          {closeMenuOnSelect !== undefined &&
            `, CloseOnSelect: ${closeMenuOnSelect}`}
        </div>
        <input
          type="text"
          role="combobox"
          placeholder={placeholder}
          disabled={isDisabled}
          data-testid="feature-select-input"
          className={className}
        />
      </div>
    ),
  ),
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
    Controller: ({ name, render }: any) => {
      const field = {
        onChange: vi.fn(),
        value: [],
      };
      return <div data-testid={`controller-${name}`}>{render({ field })}</div>;
    },
  };
});

describe('RecResourceFeatureEditSection', () => {
  it('renders react-select with multi-select configuration', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={
          [
            { id: 'BOAT', label: 'BOAT - Boat Launch' },
            { id: 'CAMP', label: 'CAMP - Camping' },
          ] as any
        }
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('mock-multi-select')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select-info')).toHaveTextContent(
      'Multi: true, CloseOnSelect: false',
    );
  });

  it('renders with correct placeholder text', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(
      screen.getByPlaceholderText('Search and select features...'),
    ).toBeInTheDocument();
  });

  it('disables the field when options are loading', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={true}
      />,
    );

    expect(screen.getByTestId('feature-select-input')).toBeDisabled();
  });

  it('does not disable the field when options are not loading', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('feature-select-input')).not.toBeDisabled();
  });

  it('renders error message when provided', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={
          {
            feature_codes: { message: 'Features are required' },
          } as any
        }
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByText('Features are required')).toBeInTheDocument();
  });

  it('adds invalid class when there are errors', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={
          {
            feature_codes: { message: 'Features are required' },
          } as any
        }
        options={[] as any}
        optionsLoading={false}
      />,
    );

    const input = screen.getByTestId('feature-select-input');
    expect(input).toHaveClass('is-invalid');
  });

  it('does not add invalid class when there are no errors', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={false}
      />,
    );

    const input = screen.getByTestId('feature-select-input');
    expect(input).not.toHaveClass('is-invalid');
  });

  it('uses Controller for form integration', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('controller-feature_codes')).toBeInTheDocument();
  });

  it('renders with correct select ID', () => {
    render(
      <RecResourceFeatureEditSection
        control={{} as any}
        errors={{} as FieldErrors<any>}
        options={[] as any}
        optionsLoading={false}
      />,
    );

    expect(screen.getByTestId('select-id')).toHaveTextContent(
      'feature_codes-select',
    );
  });
});
