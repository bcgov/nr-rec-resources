import { MultiSelectField } from '@/components/form';
import { RecreationResourceOptionUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock react-select using shared mock from test/__mocks__ directory
vi.mock('react-select');

type TestFormData = {
  activity_codes: number[];
};

describe('MultiSelectField', () => {
  const mockOptions: RecreationResourceOptionUIModel[] = [
    { id: '1', label: 'Option 1' },
    { id: '2', label: 'Option 2' },
    { id: '3', label: 'Option 3' },
  ];

  const renderWithForm = (
    props = {},
    defaultValues: Partial<TestFormData> = {},
  ) => {
    const TestComponent = () => {
      const { control, formState } = useForm<TestFormData>({
        defaultValues,
      });
      return (
        <MultiSelectField
          name="activity_codes"
          label="Test Multi Select"
          options={mockOptions}
          placeholder="Select options"
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
      expect(screen.getByText('Test Multi Select')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Select options')).toBeInTheDocument();
    });

    it('should render as multi-select', () => {
      renderWithForm();
      expect(screen.getByTestId('multi-select-info')).toHaveTextContent(
        'Multi: true',
      );
    });

    it('should not close menu on select', () => {
      renderWithForm();
      expect(screen.getByTestId('multi-select-info')).toHaveTextContent(
        'CloseOnSelect: false',
      );
    });

    it('should render all options', () => {
      renderWithForm();
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-2')).toBeInTheDocument();
      expect(screen.getByTestId('option-3')).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      renderWithForm({ options: [] });
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('should render with pre-selected values', () => {
      renderWithForm({}, { activity_codes: [1, 2] });
      expect(screen.getByTestId('selected-values')).toHaveTextContent(
        'Option 1, Option 2',
      );
    });
  });

  describe('User Interactions', () => {
    it('should select an option when clicked', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        const value = watch('activity_codes');
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="selected-count">
              {Array.isArray(value) ? value.length : 0}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');

      await user.click(screen.getByTestId('option-1'));

      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    });

    it('should select multiple options', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        const value = watch('activity_codes');
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="form-selected-values">
              {Array.isArray(value) ? value.join(', ') : 'none'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1'));
      await user.click(screen.getByTestId('option-2'));

      expect(screen.getByTestId('form-selected-values')).toHaveTextContent(
        '1, 2',
      );
    });

    it('should deselect an option when clicked again', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        const value = watch('activity_codes');
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="selected-count">
              {Array.isArray(value) ? value.length : 0}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      // Select option
      await user.click(screen.getByTestId('option-1'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

      // Deselect same option
      await user.click(screen.getByTestId('option-1'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    });
  });

  describe('Disabled State', () => {
    it('should be enabled by default', () => {
      renderWithForm();
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      renderWithForm({ disabled: true });
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should not show options when disabled', () => {
      renderWithForm({ disabled: true });
      expect(
        screen.queryByTestId('multi-select-options'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message and apply error class', () => {
      const TestComponent = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: {},
        });
        const errors = {
          activity_codes: {
            type: 'required' as const,
            message: 'Please select at least one option',
          },
        };
        return (
          <MultiSelectField
            name="activity_codes"
            label="Test Multi Select"
            options={mockOptions}
            placeholder="Select options"
            control={control}
            errors={errors}
          />
        );
      };

      render(<TestComponent />);
      expect(
        screen.getByText('Please select at least one option'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('mock-multi-select')).toHaveClass('is-invalid');
    });

    it('should not show error when no error exists', () => {
      renderWithForm();
      const errorElement = document.querySelector('.invalid-feedback');
      expect(errorElement).not.toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('should integrate with react-hook-form Controller', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, getValues } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <button
              onClick={() => {
                const values = getValues('activity_codes');
                document.getElementById('result')!.textContent = Array.isArray(
                  values,
                )
                  ? values.join(', ')
                  : '0';
              }}
            >
              Get Values
            </button>
            <div id="result">0</div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1'));
      await user.click(screen.getByTestId('option-2'));
      await user.click(screen.getByText('Get Values'));

      expect(document.getElementById('result')).toHaveTextContent('1, 2');
    });

    it('should handle selection state changes', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        const value = watch('activity_codes');
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="state">
              {Array.isArray(value) && value.length > 0
                ? 'has-values'
                : 'empty'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('state')).toHaveTextContent('empty');

      await user.click(screen.getByTestId('option-2'));
      expect(screen.getByTestId('state')).toHaveTextContent('has-values');

      await user.click(screen.getByTestId('option-2'));
      expect(screen.getByTestId('state')).toHaveTextContent('empty');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form control structure', () => {
      renderWithForm();
      expect(screen.getByText('Test Multi Select')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have proper controlId', () => {
      renderWithForm();
      const label = screen.getByText('Test Multi Select');
      expect(label).toHaveAttribute('for', 'activity_codes');
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
      renderWithForm({ label: 'Custom Multi Label' });
      expect(screen.getByText('Custom Multi Label')).toBeInTheDocument();
    });

    it('should handle custom placeholder', () => {
      renderWithForm({ placeholder: 'Pick multiple' });
      expect(screen.getByPlaceholderText('Pick multiple')).toBeInTheDocument();
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

    it('should handle options with null id', () => {
      const optionsWithNull: RecreationResourceOptionUIModel[] = [
        { id: null, label: 'None' },
        { id: '1', label: 'Option 1' },
      ];
      renderWithForm({ options: optionsWithNull });
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('Value Conversion', () => {
    it('should convert option.id (string) to number for form value', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<TestFormData>({
          defaultValues: { activity_codes: [] },
        });
        const value = watch('activity_codes');
        return (
          <>
            <MultiSelectField
              name="activity_codes"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="value-type">
              {Array.isArray(value) && value.length > 0
                ? typeof value[0] === 'number'
                  ? 'number'
                  : 'not-number'
                : 'empty'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1'));

      expect(screen.getByTestId('value-type')).toHaveTextContent('number');
    });

    it('should preserve string IDs when form value is string array', async () => {
      const user = userEvent.setup();
      type StringFormData = { tags: string[] };
      const stringOptions = [
        { id: 'alpha', label: 'Alpha' },
        { id: 'beta', label: 'Beta' },
      ];

      const TestComponent = () => {
        const { control, formState, watch } = useForm<StringFormData>({
          defaultValues: { tags: ['alpha'] },
        });
        const value = watch('tags');
        return (
          <>
            <MultiSelectField
              name="tags"
              label="Tags"
              options={stringOptions}
              placeholder="Select tags"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="value-type">
              {value?.length
                ? typeof value[0] === 'string'
                  ? 'string'
                  : 'not-string'
                : 'empty'}
            </div>
            <div data-testid="values">{value?.join(', ')}</div>
          </>
        );
      };

      render(<TestComponent />);
      await user.click(screen.getByTestId('option-beta'));

      expect(screen.getByTestId('value-type')).toHaveTextContent('string');
      expect(screen.getByTestId('values')).toHaveTextContent('alpha, beta');
    });
  });
});
