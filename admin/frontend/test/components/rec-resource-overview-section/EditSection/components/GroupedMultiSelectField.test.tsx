import { GroupedMultiSelectField } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components';
import type {
  GroupedOption,
  GroupedOptions,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components/GroupedMultiSelectField';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
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
      isMulti,
      closeMenuOnSelect,
    }) => {
      const flatOptions = options?.flatMap((group: any) =>
        group.options ? group.options : [group],
      );
      return (
        <div data-testid="mock-multi-select" className={className}>
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
            readOnly
            data-testid="multi-select-input"
          />
          <div data-testid="selected-values">
            {Array.isArray(value) && value.length > 0
              ? value.map((v: any) => v.label).join(', ')
              : 'none'}
          </div>
          {!isDisabled && (
            <div data-testid="multi-select-options">
              {flatOptions?.length === 0 ? (
                <div>No options available</div>
              ) : (
                flatOptions?.map((opt: any) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const isSelected = currentValues.some(
                        (v: any) => v.value === opt.value,
                      );
                      if (isSelected) {
                        onChange?.(
                          currentValues.filter(
                            (v: any) => v.value !== opt.value,
                          ),
                        );
                      } else {
                        onChange?.([...currentValues, opt]);
                      }
                    }}
                    data-testid={`option-${opt.value}`}
                    data-selected={
                      Array.isArray(value) &&
                      value.some((v: any) => v.value === opt.value)
                    }
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      );
    },
  ),
}));

describe('GroupedMultiSelectField', () => {
  const mockOptions: GroupedOptions[] = [
    {
      label: 'Group 1',
      options: [
        {
          label: 'Option 1A',
          value: '1a',
          group: 'group1',
          groupLabel: 'Group 1',
        },
        {
          label: 'Option 1B',
          value: '1b',
          group: 'group1',
          groupLabel: 'Group 1',
        },
      ],
    },
    {
      label: 'Group 2',
      options: [
        {
          label: 'Option 2A',
          value: '2a',
          group: 'group2',
          groupLabel: 'Group 2',
        },
        {
          label: 'Option 2B',
          value: '2b',
          group: 'group2',
          groupLabel: 'Group 2',
        },
      ],
    },
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
        <GroupedMultiSelectField
          name="selected_access_options"
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

    it('should render all options from all groups', () => {
      renderWithForm();
      expect(screen.getByTestId('option-1a')).toBeInTheDocument();
      expect(screen.getByTestId('option-1b')).toBeInTheDocument();
      expect(screen.getByTestId('option-2a')).toBeInTheDocument();
      expect(screen.getByTestId('option-2b')).toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      renderWithForm({ options: [] });
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('should render with pre-selected values', () => {
      const preSelectedValues: GroupedOption[] = [
        {
          label: 'Option 1A',
          value: '1a',
          group: 'group1',
          groupLabel: 'Group 1',
        },
      ];
      renderWithForm({}, { selected_access_options: preSelectedValues });
      expect(screen.getByTestId('selected-values')).toHaveTextContent(
        'Option 1A',
      );
    });

    it('should display helper text when provided', () => {
      renderWithForm({ helperText: 'Select one or more options' });
      expect(
        screen.getByText('Select one or more options'),
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should select an option when clicked', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
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

      await user.click(screen.getByTestId('option-1a'));

      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');
    });

    it('should select multiple options', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="selected-labels">
              {Array.isArray(value)
                ? value.map((v) => v.label).join(', ')
                : 'none'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1a'));
      await user.click(screen.getByTestId('option-2a'));

      expect(screen.getByTestId('selected-labels')).toHaveTextContent(
        'Option 1A, Option 2A',
      );
    });

    it('should deselect an option when clicked again', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
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
      await user.click(screen.getByTestId('option-1a'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('1');

      // Deselect same option
      await user.click(screen.getByTestId('option-1a'));
      expect(screen.getByTestId('selected-count')).toHaveTextContent('0');
    });

    it('should select options from different groups', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="groups">
              {Array.isArray(value)
                ? [...new Set(value.map((v) => v.group))].join(', ')
                : 'none'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1a'));
      await user.click(screen.getByTestId('option-2b'));

      expect(screen.getByTestId('groups')).toHaveTextContent('group1, group2');
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
    it('should display error message', () => {
      const TestComponent = () => {
        const { control, formState } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        formState.errors.selected_access_options = {
          type: 'required',
          message: 'Please select at least one option',
        };
        return (
          <GroupedMultiSelectField
            name="selected_access_options"
            label="Test Multi Select"
            options={mockOptions}
            placeholder="Select options"
            control={control}
            errors={formState.errors}
          />
        );
      };

      render(<TestComponent />);
      expect(
        screen.getByText('Please select at least one option'),
      ).toBeInTheDocument();
    });

    it('should apply error class when error exists', () => {
      const TestComponent = () => {
        const { control, formState } = useForm<EditResourceFormData>({
          defaultValues: {},
        });
        formState.errors.selected_access_options = {
          type: 'required',
          message: 'Error',
        };
        return (
          <GroupedMultiSelectField
            name="selected_access_options"
            label="Test Multi Select"
            options={mockOptions}
            placeholder="Select options"
            control={control}
            errors={formState.errors}
          />
        );
      };

      render(<TestComponent />);
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
        const { control, formState, getValues } = useForm<EditResourceFormData>(
          { defaultValues: { selected_access_options: [] } },
        );
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <button
              onClick={() => {
                const values = getValues('selected_access_options');
                document.getElementById('result')!.textContent = Array.isArray(
                  values,
                )
                  ? values.length.toString()
                  : '0';
              }}
            >
              Get Count
            </button>
            <div id="result">0</div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1a'));
      await user.click(screen.getByTestId('option-1b'));
      await user.click(screen.getByText('Get Count'));

      expect(document.getElementById('result')).toHaveTextContent('2');
    });

    it('should handle selection state changes', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
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

      await user.click(screen.getByTestId('option-2a'));
      expect(screen.getByTestId('state')).toHaveTextContent('has-values');

      await user.click(screen.getByTestId('option-2a'));
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
      expect(label).toHaveAttribute('for', 'selected_access_options');
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
      const manyOptions: GroupedOptions[] = Array.from(
        { length: 10 },
        (_, i) => ({
          label: `Group ${i + 1}`,
          options: Array.from({ length: 10 }, (_, j) => ({
            label: `Option ${i + 1}-${j + 1}`,
            value: `${i + 1}-${j + 1}`,
            group: `group${i + 1}`,
            groupLabel: `Group ${i + 1}`,
          })),
        }),
      );
      renderWithForm({ options: manyOptions });
      expect(screen.getByTestId('option-1-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-10-10')).toBeInTheDocument();
    });

    it('should handle empty groups', () => {
      const emptyGroupOptions: GroupedOptions[] = [
        {
          label: 'Empty Group',
          options: [],
        },
      ];
      renderWithForm({ options: emptyGroupOptions });
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });
  });

  describe('Option Structure', () => {
    it('should handle grouped options correctly', () => {
      renderWithForm();
      // All options from both groups should be rendered
      const allOptions = screen.getAllByRole('button');
      expect(allOptions.length).toBe(4); // 2 options per group * 2 groups
    });

    it('should track selected state correctly', async () => {
      const user = userEvent.setup();
      renderWithForm();

      const option1a = screen.getByTestId('option-1a');
      expect(option1a).toHaveAttribute('data-selected', 'false');

      await user.click(option1a);
      expect(option1a).toHaveAttribute('data-selected', 'true');
    });

    it('should preserve option metadata', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const { control, formState, watch } = useForm<EditResourceFormData>({
          defaultValues: { selected_access_options: [] },
        });
        const value = watch('selected_access_options');
        return (
          <>
            <GroupedMultiSelectField
              name="selected_access_options"
              label="Test Multi Select"
              options={mockOptions}
              placeholder="Select options"
              control={control}
              errors={formState.errors}
            />
            <div data-testid="metadata">
              {Array.isArray(value) && value.length > 0
                ? `${value[0].value}|${value[0].group}|${value[0].groupLabel}`
                : 'none'}
            </div>
          </>
        );
      };

      render(<TestComponent />);

      await user.click(screen.getByTestId('option-1a'));

      expect(screen.getByTestId('metadata')).toHaveTextContent(
        '1a|group1|Group 1',
      );
    });
  });

  describe('Props Validation', () => {
    it('should pass correct props to react-select', () => {
      renderWithForm();
      const select = screen.getByTestId('mock-multi-select');
      expect(select).toBeInTheDocument();
    });

    it('should handle different field name types', () => {
      const TestComponent = () => {
        const { control, formState } = useForm<EditResourceFormData>();
        return (
          <GroupedMultiSelectField
            name="selected_access_options"
            label="Test Field"
            options={mockOptions}
            placeholder="Select"
            control={control}
            errors={formState.errors}
          />
        );
      };
      expect(() => render(<TestComponent />)).not.toThrow();
    });
  });
});
