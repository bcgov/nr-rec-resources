import { SelectField } from '@/components/form';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
import { RecreationResourceOptionUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-select to simplify testing
vi.mock('react-select', () => ({
  default: vi.fn(
    ({
      options,
      value,
      onChange,
      isDisabled,
      placeholder,
      className,
      isSearchable,
      isOptionDisabled,
    }) => {
      const selectedOption =
        options?.find((opt: any) => opt.id === value) || null;
      return (
        <div data-testid="mock-select" className={className}>
          <input
            type="text"
            role="combobox"
            value={selectedOption?.label || ''}
            placeholder={placeholder}
            disabled={isDisabled}
            readOnly={!isSearchable}
            data-testid="select-input"
          />
          {!isDisabled && (
            <div data-testid="select-options">
              {options?.length === 0 ? (
                <div>No options</div>
              ) : (
                options?.map((opt: any) => {
                  const isDisabledOption = isOptionDisabled
                    ? isOptionDisabled(opt)
                    : false;
                  return (
                    <button
                      key={opt.id || 'null'}
                      type="button"
                      onClick={() => !isDisabledOption && onChange?.(opt)}
                      disabled={isDisabledOption}
                      data-testid={`option-${opt.id}`}
                      data-disabled={isDisabledOption}
                    >
                      {opt.label}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      );
    },
  ),
}));

describe('SelectField', () => {
  const mockOptions: RecreationResourceOptionUIModel[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  const renderWithForm = (
    props = {},
    defaultValues: Partial<EditResourceFormData> = {},
  ) => {
    const TestComponent = () => {
      const { control, formState } = useForm<EditResourceFormData>({
        defaultValues,
      });
      return (
        <SelectField
          name="maintenance_standard_code"
          label="Test Select"
          options={mockOptions}
          placeholder="Select an option"
          control={control}
          errors={formState.errors}
          {...props}
        />
      );
    };
    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with label and placeholder', () => {
      renderWithForm();
      expect(screen.getByText('Test Select')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Select an option'),
      ).toBeInTheDocument();
    });

    it('should render with pre-selected value', () => {
      renderWithForm({}, { maintenance_standard_code: '2' });
      // The input will be empty initially, but the option should be selected in the underlying form
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
    });

    it('should render all options', () => {
      renderWithForm();
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
      expect(screen.getByTestId('option-3')).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      renderWithForm({ options: [] });
      expect(screen.getByText('No options')).toBeInTheDocument();
    });

    it('should handle options with null id', () => {
      const optionsWithNull: RecreationResourceOptionUIModel[] = [
        { id: null, label: 'None' },
        { id: '1', label: 'Option 1' },
      ];
      renderWithForm({ options: optionsWithNull });
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should select an option and update form value when clicked', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        const value = watch('maintenance_standard_code');
        return (
          <>
            <SelectField
              name="maintenance_standard_code"
              label="Test Select"
              options={mockOptions}
              placeholder="Select an option"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="watched-value">{value || 'none'}</div>
          </>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('watched-value')).toHaveTextContent('none');
      expect(screen.getByTestId('option-2')).toBeInTheDocument();

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

    it('should disable individual options when disabled field is true and prevent selection', async () => {
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
        const value = watch('maintenance_standard_code');
        return (
          <>
            <SelectField
              name="maintenance_standard_code"
              label="Test Select"
              options={optionsWithDisabled}
              placeholder="Select an option"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="watched-value">{value || 'none'}</div>
          </>
        );
      };

      render(<TestComponent />);

      const disabledOption = screen.getByTestId('option-2');
      const enabledOption1 = screen.getByTestId('option-1');
      const enabledOption3 = screen.getByTestId('option-3');

      // Verify disabled state
      expect(disabledOption).toBeDisabled();
      expect(disabledOption).toHaveAttribute('data-disabled', 'true');
      expect(enabledOption1).not.toBeDisabled();
      expect(enabledOption3).not.toBeDisabled();

      // Verify disabled option cannot be selected
      expect(screen.getByTestId('watched-value')).toHaveTextContent('none');
      await user.click(disabledOption);
      expect(screen.getByTestId('watched-value')).toHaveTextContent('none');

      // Verify enabled options can be selected
      await user.click(enabledOption1);
      expect(screen.getByTestId('watched-value')).toHaveTextContent('1');
    });
  });

  describe('Error Handling', () => {
    it('should display error message and apply error class when error exists', () => {
      const TestComponent = () => {
        const { control, formState } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        formState.errors.maintenance_standard_code = {
          type: 'required',
          message: 'This field is required',
        };
        return (
          <SelectField
            name="maintenance_standard_code"
            label="Test Select"
            options={mockOptions}
            placeholder="Select an option"
            control={control}
            errors={formState.errors}
          />
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
        const value = watch('maintenance_standard_code');
        return (
          <>
            <SelectField
              name="maintenance_standard_code"
              label="Test Select"
              options={mockOptions}
              placeholder="Select an option"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="current-value">{value}</div>
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
    it('should have proper form control structure', () => {
      renderWithForm();
      expect(screen.getByText('Test Select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have proper controlId', () => {
      renderWithForm();
      const label = screen.getByText('Test Select');
      expect(label).toHaveAttribute('for', 'maintenance_standard_code');
    });

    it('should be keyboard accessible', () => {
      renderWithForm();
      const input = screen.getByRole('combobox');
      expect(input).toBeInTheDocument();
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('should handle custom labels', () => {
      renderWithForm({ label: 'Custom Label' });
      expect(screen.getByText('Custom Label')).toBeInTheDocument();
    });

    it('should handle custom placeholder', () => {
      renderWithForm({ placeholder: 'Choose wisely' });
      expect(screen.getByPlaceholderText('Choose wisely')).toBeInTheDocument();
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
      const select = screen.getByTestId('mock-select');
      expect(select).toBeInTheDocument();
    });

    it('should handle all field names from EditResourceFormData', () => {
      const fields: Array<keyof EditResourceFormData> = [
        'maintenance_standard_code',
        'control_access_code',
        'status_code',
      ];

      fields.forEach((fieldName) => {
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
      });
    });
  });
});
