import { RecResourceActivitiesEditSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/RecResourceActivitiesEditSection';
import { useActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions';
import { useEditActivitiesForm } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm';
import { useLoaderData } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions',
);
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm',
);

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: 'test-resource-123' })),
    useLoaderData: vi.fn(),
  };
});

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ to, children, className }: any) => (
    <a href={to} className={className} data-testid="cancel-link">
      {children}
    </a>
  ),
}));

vi.mock('@/components', () => ({
  MultiSelectField: ({ name, label, placeholder, errors, disabled }: any) => (
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
}));

const mockActivities = [
  {
    recreation_activity_code: 1,
    description: 'Hiking',
  },
];

const mockOptions = [
  { id: '1', label: 'Hiking' },
  { id: '2', label: 'Camping' },
  { id: '3', label: 'Fishing' },
];

const createMockFormReturn = (overrides = {}) => ({
  control: {} as any,
  handleSubmit: vi.fn((fn) => (e: any) => {
    e?.preventDefault?.();
    return fn({ activity_codes: [1, 2] });
  }),
  errors: {},
  isDirty: false,
  updateMutation: {
    isPending: false,
    mutateAsync: vi.fn(),
  },
  onSubmit: vi.fn(),
  ...overrides,
});

describe('RecResourceActivitiesEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLoaderData).mockReturnValue({
      activities: mockActivities,
    } as any);

    vi.mocked(useActivitiesOptions).mockReturnValue({
      options: mockOptions as any,
      isLoading: false,
    });

    vi.mocked(useEditActivitiesForm).mockReturnValue(
      createMockFormReturn() as any,
    );
  });

  describe('rendering', () => {
    it('renders section title, buttons, and form field', () => {
      render(<RecResourceActivitiesEditSection />);

      expect(screen.getByText('Edit Activities')).toBeInTheDocument();

      const cancelLink = screen.getByTestId('cancel-link');
      expect(cancelLink).toBeInTheDocument();
      expect(cancelLink).toHaveTextContent('Cancel');
      expect(cancelLink).toHaveAttribute(
        'href',
        '/rec-resource/$id/activities',
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

      const multiSelectField = screen.getByTestId(
        'multi-select-field-activity_codes',
      );
      expect(multiSelectField).toBeInTheDocument();
      expect(screen.getByText('Activities')).toBeInTheDocument();
      expect(screen.getByTestId('placeholder')).toHaveTextContent(
        'Search and select activities...',
      );
    });
  });

  describe('button states', () => {
    const buttonStateTests = [
      {
        description: 'form is not dirty',
        isDirty: false,
        isPending: false,
        optionsLoading: false,
        expectedText: 'Save',
        shouldBeDisabled: true,
      },
      {
        description: 'form is dirty',
        isDirty: true,
        isPending: false,
        optionsLoading: false,
        expectedText: 'Save',
        shouldBeDisabled: false,
      },
      {
        description: 'mutation is pending',
        isDirty: true,
        isPending: true,
        optionsLoading: false,
        expectedText: 'Saving...',
        shouldBeDisabled: true,
      },
      {
        description: 'options are loading',
        isDirty: true,
        isPending: false,
        optionsLoading: true,
        expectedText: 'Save',
        shouldBeDisabled: true,
      },
    ];

    it.each(buttonStateTests)(
      'should render Save button as "$expectedText" and disabled=$shouldBeDisabled when $description',
      ({
        isDirty,
        isPending,
        optionsLoading,
        expectedText,
        shouldBeDisabled,
      }) => {
        vi.mocked(useEditActivitiesForm).mockReturnValue(
          createMockFormReturn({
            isDirty,
            updateMutation: {
              isPending,
              mutateAsync: vi.fn(),
            },
          }) as any,
        );

        vi.mocked(useActivitiesOptions).mockReturnValue({
          options: optionsLoading ? [] : (mockOptions as any),
          isLoading: optionsLoading,
        });

        render(<RecResourceActivitiesEditSection />);

        const saveButton = screen.getByRole('button', { name: expectedText });
        if (shouldBeDisabled) {
          expect(saveButton).toBeDisabled();
        } else {
          expect(saveButton).not.toBeDisabled();
        }
      },
    );

    it('disables MultiSelectField when options are loading', () => {
      vi.mocked(useActivitiesOptions).mockReturnValue({
        options: [],
        isLoading: true,
      });

      render(<RecResourceActivitiesEditSection />);

      const select = screen.getByTestId('select-activity_codes');
      expect(select).toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('calls handleSubmit when Save button is clicked', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((fn) => (e: any) => {
        e?.preventDefault?.();
        return fn({ activity_codes: [1, 2] });
      });

      vi.mocked(useEditActivitiesForm).mockReturnValue(
        createMockFormReturn({
          isDirty: true,
          handleSubmit,
        }) as any,
      );

      render(<RecResourceActivitiesEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    const edgeCaseTests = [
      {
        description: 'empty activities array',
        activities: [],
      },
      {
        description: 'undefined activities',
        activities: undefined,
      },
    ];

    it.each(edgeCaseTests)('handles $description', ({ activities }) => {
      vi.mocked(useLoaderData).mockReturnValue({
        activities,
      } as any);

      render(<RecResourceActivitiesEditSection />);

      expect(screen.getByText('Edit Activities')).toBeInTheDocument();
    });
  });

  describe('form errors', () => {
    it('displays errors when present', () => {
      vi.mocked(useEditActivitiesForm).mockReturnValue(
        createMockFormReturn({
          errors: {
            activity_codes: {
              message: 'At least one activity is required',
            },
          },
        }) as any,
      );

      render(<RecResourceActivitiesEditSection />);

      expect(screen.getByTestId('error-activity_codes')).toHaveTextContent(
        'At least one activity is required',
      );
    });
  });
});
