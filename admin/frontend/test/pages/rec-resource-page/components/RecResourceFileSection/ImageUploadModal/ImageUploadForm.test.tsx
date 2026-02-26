import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections/ImageUploadForm';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
  setUploadConsentData: vi.fn(),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
  () => ({
    useGetRecreationResourceOptions: () => ({
      data: [
        {
          type: 'photographerType',
          options: [
            { id: 'STAFF', label: 'Staff' },
            { id: 'CONTRACTOR', label: 'Contractor' },
            { id: 'VOLUNTEER', label: 'Volunteer' },
            { id: 'PHOTOGRAPHER', label: 'Photographer' },
            { id: 'OTHER', label: 'Other' },
          ],
        },
      ],
      isLoading: false,
      error: null,
    }),
  }),
);

const NON_STAFF_TYPES = [
  { id: 'CONTRACTOR', label: 'Contractor' },
  { id: 'VOLUNTEER', label: 'Volunteer' },
  { id: 'PHOTOGRAPHER', label: 'Photographer' },
  { id: 'OTHER', label: 'Other' },
];

const TestWrapper = ({
  onUpload = vi.fn(),
  onFormReady = vi.fn(),
  initialValues,
  formKey,
}: {
  onUpload?: () => void;
  onFormReady?: (handlers: any) => void;
  initialValues?: Record<string, unknown>;
  formKey?: string;
}) => {
  return (
    <ImageUploadForm
      key={formKey}
      fileName="test-image.jpg"
      onUpload={onUpload}
      onFormReady={onFormReady}
      initialValues={initialValues}
    />
  );
};

describe('ImageUploadForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('component setup', () => {
    it('calls onFormReady with form handlers on mount', async () => {
      const onFormReady = vi.fn();
      render(<TestWrapper onFormReady={onFormReady} />);

      await waitFor(() => {
        expect(onFormReady).toHaveBeenCalledWith(
          expect.objectContaining({
            resetForm: expect.any(Function),
            isValid: expect.any(Boolean),
            isDirty: expect.any(Boolean),
            submitForm: expect.any(Function),
          }),
        );
      });
    });
  });

  describe('common fields (always visible)', () => {
    it('renders display name input', () => {
      render(<TestWrapper />);

      expect(
        screen.getByPlaceholderText('Enter a display name'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/briefly describe the location or feature/i),
      ).toBeInTheDocument();
    });

    it('renders date taken section', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Date taken')).toBeInTheDocument();
    });

    it('renders photographer type dropdown', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Photographer type')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('resets form values when component remounts', async () => {
      const { rerender } = render(
        <TestWrapper
          formKey="image-a"
          initialValues={{
            displayName: 'Image A',
            dateCreated: new Date('2024-01-01'),
          }}
        />,
      );

      await waitFor(() => {
        expect(
          (
            screen.getByPlaceholderText(
              'Enter a display name',
            ) as HTMLInputElement
          ).value,
        ).toBe('Image A');
        expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
      });

      rerender(
        <TestWrapper
          formKey="image-b"
          initialValues={{
            displayName: 'Image B',
            dateCreated: new Date('2024-02-02'),
          }}
        />,
      );

      await waitFor(() => {
        expect(
          (
            screen.getByPlaceholderText(
              'Enter a display name',
            ) as HTMLInputElement
          ).value,
        ).toBe('Image B');
        expect(screen.getByDisplayValue('2024-02-02')).toBeInTheDocument();
      });
    });
  });

  describe('staff-specific fields', () => {
    it('shows "staff during regular duties" question for staff (default)', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(/was this taken by staff during regular duties\?/i),
      ).toBeInTheDocument();
    });

    it('does not show photographer name field for staff', () => {
      render(<TestWrapper />);

      expect(
        screen.queryByPlaceholderText('Enter photographer name'),
      ).not.toBeInTheDocument();
    });

    it('shows identifiable information question for staff (default)', () => {
      render(<TestWrapper />);

      expect(
        screen.getByRole('link', {
          name: /personally identifiable information/i,
        }),
      ).toBeInTheDocument();
    });

    it('renders confirmation checkbox for staff (default)', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(
          /by uploading this photo, i confirm that it contains no personally identifiable information/i,
        ),
      ).toBeInTheDocument();
    });

    it('shows consent upload when staff + has PII', async () => {
      render(<TestWrapper />);

      // Answer "Yes" to staff question first
      const staffYes = document.getElementById('didYouTakePhoto-yes');
      fireEvent.click(staffYes!);

      // Click "Yes" for contains identifiable information
      const yesRadio = document.getElementById('containsIdentifiableInfo-yes');
      fireEvent.click(yesRadio!);

      await waitFor(() => {
        expect(
          screen.getByText(/this photo requires a consent and release form/i),
        ).toBeInTheDocument();
      });
    });

    it('shows warning alert when staff answers "No" to regular duties', async () => {
      render(<TestWrapper />);

      const noRadio = document.getElementById('didYouTakePhoto-no');
      fireEvent.click(noRadio!);

      await waitFor(() => {
        expect(
          screen.getByText(
            /currently accepting photos only taken during working hours/i,
          ),
        ).toBeInTheDocument();
      });
    });

    it('hides PII question and confirmation when staff answers "No"', async () => {
      render(<TestWrapper />);

      const noRadio = document.getElementById('didYouTakePhoto-no');
      fireEvent.click(noRadio!);

      await waitFor(() => {
        expect(
          screen.queryByRole('link', {
            name: /personally identifiable information/i,
          }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/by uploading this photo, i confirm/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('not-accepted fields (all types behave the same)', () => {
    it.each(NON_STAFF_TYPES)(
      '$label: hides "staff during regular duties" question',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.queryByText(
              /was this taken by staff during regular duties\?/i,
            ),
          ).not.toBeInTheDocument();
        });
      },
    );

    it.each(NON_STAFF_TYPES)(
      '$label: shows not-accepted warning alert',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.getByText(/currently accepting photos only taken by staff/i),
          ).toBeInTheDocument();
        });
      },
    );

    it.each(NON_STAFF_TYPES)(
      '$label: hides PII question, consent upload, and confirmation',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.queryByRole('link', {
              name: /personally identifiable information/i,
            }),
          ).not.toBeInTheDocument();
          expect(
            screen.queryByPlaceholderText('Enter photographer name'),
          ).not.toBeInTheDocument();
          expect(
            screen.queryByText(/by uploading this photo, i confirm/i),
          ).not.toBeInTheDocument();
        });
      },
    );
  });
});
