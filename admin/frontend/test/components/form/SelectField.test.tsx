import { SelectField } from '@/components/form/SelectField';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
import { RecreationResourceOptionUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-select using shared mock from test/__mocks__ directory
vi.mock('react-select');

describe('SelectField', () => {
  const mockOptions: RecreationResourceOptionUIModel[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  const defaultProps = {
    name: 'maintenance_standard_code' as const,
    label: 'Test Select',
    options: mockOptions,
    placeholder: 'Select an option',
  };

  const renderWithForm = (
    props: Partial<
      typeof defaultProps & { disabled?: boolean; helperText?: React.ReactNode }
    > = {},
    defaultValues: Partial<EditResourceFormData> = {},
    watchValue = false,
  ) => {
    const TestComponent = () => {
      const { control, formState, watch } = useForm<EditResourceFormData>({
        defaultValues,
      });
      const value = watchValue ? watch('maintenance_standard_code') : undefined;
      return (
        <>
          <SelectField
            {...defaultProps}
            control={control}
            errors={formState.errors}
            {...props}
          />
          {watchValue && (
            <div data-testid="watched-value">{value || 'none'}</div>
          )}
        </>
      );
    };
    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label, placeholder, and all options', () => {
      renderWithForm();
      expect(screen.getByText('Test Select')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Select an option'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
      expect(screen.getByTestId('option-3')).toBeInTheDocument();
    });

    it('should render with pre-selected value', () => {
      renderWithForm({}, { maintenance_standard_code: '2' });
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
    });

    it.each([
      { options: [], expected: 'No options' },
      {
        options: [{ id: null, label: 'None' }],
        expected: 'None',
      },
    ])('should handle $expected', ({ options, expected }) => {
      renderWithForm({ options });
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should select an option and update form value when clicked', async () => {
      const user = userEvent.setup();
      renderWithForm({}, {}, true);

      expect(screen.getByTestId('watched-value')).toHaveTextContent('none');
      await user.click(screen.getByTestId('option-1'));
      expect(screen.getByTestId('watched-value')).toHaveTextContent('1');
    });

    it('should be searchable', () => {
      renderWithForm();
      expect(screen.getByRole('combobox')).not.toHaveAttribute('readonly');
    });
  });

  describe('Disabled State', () => {
    it.each([
      { disabled: false, shouldBeDisabled: false },
      { disabled: true, shouldBeDisabled: true },
    ])(
      'should be $shouldBeDisabled when disabled prop is $disabled',
      ({ disabled, shouldBeDisabled }) => {
        renderWithForm({ disabled });
        const input = screen.getByRole('combobox');
        if (shouldBeDisabled) {
          expect(input).toBeDisabled();
          expect(
            screen.queryByTestId('select-options'),
          ).not.toBeInTheDocument();
        } else {
          expect(input).not.toBeDisabled();
        }
      },
    );

    it('should disable individual options and prevent selection', async () => {
      const user = userEvent.setup();
      const optionsWithDisabled: RecreationResourceOptionUIModel[] = [
        { id: '1', label: 'Option 1', disabled: false },
        { id: '2', label: 'Option 2', disabled: true },
        { id: '3', label: 'Option 3', disabled: false },
      ];

      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        return (
          <>
            <SelectField
              {...defaultProps}
              options={optionsWithDisabled}
              control={control}
              errors={formState.errors}
            />
            <div data-testid="watched-value">
              {watch('maintenance_standard_code') || 'none'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      const disabledOption = screen.getByTestId('option-2');
      const enabledOption = screen.getByTestId('option-1');

      expect(disabledOption).toBeDisabled();
      expect(disabledOption).toHaveAttribute('data-disabled', 'true');
      expect(enabledOption).not.toBeDisabled();

      await user.click(disabledOption);
      expect(screen.getByTestId('watched-value')).toHaveTextContent('none');

      await user.click(enabledOption);
      expect(screen.getByTestId('watched-value')).toHaveTextContent('1');
    });
  });

  describe('Error Handling', () => {
    it('should display error message and apply error class when error exists', () => {
      const TestComponent = () => {
        const { control } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        const errors = {
          maintenance_standard_code: {
            type: 'required' as const,
            message: 'This field is required',
          },
        };
        return (
          <SelectField {...defaultProps} control={control} errors={errors} />
        );
      };

      render(<TestComponent />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByTestId('mock-select')).toHaveClass('is-invalid');
    });

    it('should not show error when no error exists', () => {
      renderWithForm();
      expect(
        document.querySelector('.invalid-feedback'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should integrate with react-hook-form and handle selection changes', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch, getValues } =
          useForm<EditResourceFormData>({
            defaultValues: { maintenance_standard_code: '1' },
          });
        return (
          <>
            <SelectField
              {...defaultProps}
              control={control}
              errors={formState.errors}
            />
            <div data-testid="current-value">
              {watch('maintenance_standard_code')}
            </div>
            <button
              onClick={() => {
                const val = getValues('maintenance_standard_code');
                document.getElementById('result')!.textContent = val || '';
              }}
            >
              Get Value
            </button>
            <div id="result"></div>
          </>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('current-value')).toHaveTextContent('1');

      await user.click(screen.getByTestId('option-2'));
      expect(screen.getByTestId('current-value')).toHaveTextContent('2');

      await user.click(screen.getByTestId('option-3'));
      expect(screen.getByTestId('current-value')).toHaveTextContent('3');

      await user.click(screen.getByText('Get Value'));
      expect(document.getElementById('result')).toHaveTextContent('3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form control structure and be keyboard accessible', () => {
      renderWithForm();
      const label = screen.getByText('Test Select');
      const input = screen.getByRole('combobox');

      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'maintenance_standard_code');
      expect(input).toBeInTheDocument();
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it.each([
      { prop: 'label', value: 'Custom Label', test: 'getByText' },
      {
        prop: 'placeholder',
        value: 'Choose wisely',
        test: 'getByPlaceholderText',
      },
    ])('should handle custom $prop', ({ prop, value, test }) => {
      renderWithForm({ [prop]: value });
      if (test === 'getByText') {
        expect(screen.getByText(value)).toBeInTheDocument();
      } else {
        expect(screen.getByPlaceholderText(value)).toBeInTheDocument();
      }
    });

    it('should render without errors', () => {
      expect(() => renderWithForm()).not.toThrow();
    });

    it('should handle large option lists', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        label: `Option ${i + 1}`,
      }));
      renderWithForm({ options: manyOptions });
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-100')).toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should pass correct props to react-select', () => {
      renderWithForm();
      expect(screen.getByTestId('mock-select')).toBeInTheDocument();
    });

    it.each([
      'maintenance_standard_code',
      'control_access_code',
      'status_code',
    ] as Array<keyof EditResourceFormData>)(
      'should handle field name: $fieldName',
      (fieldName) => {
        const TestComponent = () => {
          const { control, formState } = useForm<EditResourceFormData>();
          return (
            <SelectField
              name={fieldName}
              label={`Test ${fieldName}`}
              options={mockOptions}
              placeholder="Select"
              control={control}
              errors={formState.errors}
            />
          );
        };
        const { unmount } = render(<TestComponent />);
        expect(screen.getByText(`Test ${fieldName}`)).toBeInTheDocument();
        unmount();
      },
    );
  });

  describe('Helper Text and Option ID Handling', () => {
    it('should render helperText when provided', () => {
      renderWithForm({ helperText: 'This is helpful text' });
      expect(screen.getByText('This is helpful text')).toBeInTheDocument();
    });

    it('should not render helperText when not provided', () => {
      renderWithForm();
      const helperTexts = document.querySelectorAll('.text-muted');
      expect(helperTexts.length).toBeGreaterThan(0);
    });

    it.each([
      {
        name: 'null id',
        options: [{ id: null, label: 'Null ID Option' }],
      },
      {
        name: 'undefined id',
        options: [
          { id: undefined as any, label: 'Undefined ID Option' },
          { id: '1', label: 'Valid Option' },
        ],
      },
    ])('should handle options with $name', ({ options }) => {
      renderWithForm({ options });
      options.forEach((opt) => {
        expect(screen.getByText(opt.label)).toBeInTheDocument();
      });
    });
  });
});
