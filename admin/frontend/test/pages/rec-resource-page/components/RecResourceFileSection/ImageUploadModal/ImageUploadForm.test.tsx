import { ImageUploadForm } from '@/pages/rec-resource-page/components/RecResourceFileSection/ImageUploadModal/sections/ImageUploadForm';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/pages/rec-resource-page/store/recResourceFileTransferStore', () => ({
  setUploadFileName: vi.fn(),
  setUploadConsentMetadata: vi.fn(),
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
}: {
  onUpload?: () => void;
  onFormReady?: (handlers: any) => void;
}) => {
  return (
    <ImageUploadForm
      fileName="test-image.jpg"
      onUpload={onUpload}
      onFormReady={onFormReady}
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

      expect(screen.getByText('Date Taken')).toBeInTheDocument();
    });

    it('renders photographer type dropdown', () => {
      render(<TestWrapper />);

      expect(screen.getByText('Photographer Type')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders identifiable information question', () => {
      render(<TestWrapper />);

      expect(
        screen.getByRole('link', {
          name: /personally identifiable information/i,
        }),
      ).toBeInTheDocument();
    });

    it('renders confirmation checkbox', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(
          /by uploading this photo, i confirm that it contains no personally identifiable information/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('staff-specific fields', () => {
    it('shows "working hours" question for staff (default)', () => {
      render(<TestWrapper />);

      expect(
        screen.getByText(/was this photo taken during working hours\?/i),
      ).toBeInTheDocument();
    });

    it('does not show photographer name field for staff', () => {
      render(<TestWrapper />);

      expect(
        screen.queryByPlaceholderText('Enter photographer name'),
      ).not.toBeInTheDocument();
    });

    it('shows consent upload when staff + has PII', async () => {
      render(<TestWrapper />);

      // Click "Yes" for contains identifiable information
      const yesRadio = document.getElementById('containsIdentifiableInfo-yes');
      fireEvent.click(yesRadio!);

      await waitFor(() => {
        expect(
          screen.getByText(/this photo requires a consent and release form/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('non-staff fields (all types behave the same)', () => {
    it.each(NON_STAFF_TYPES)(
      '$label: hides "working hours" question',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.queryByText(/was this photo taken during working hours\?/i),
          ).not.toBeInTheDocument();
        });
      },
    );

    it.each(NON_STAFF_TYPES)(
      '$label: shows photographer name field',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.getByPlaceholderText('Enter photographer name'),
          ).toBeInTheDocument();
        });
      },
    );

    it.each(NON_STAFF_TYPES)(
      '$label: always shows consent upload section',
      async ({ id }) => {
        render(<TestWrapper />);

        const dropdown = screen.getByRole('combobox');
        fireEvent.change(dropdown, { target: { value: id } });

        await waitFor(() => {
          expect(
            screen.getByText(/this photo requires a consent and release form/i),
          ).toBeInTheDocument();
        });
      },
    );
  });
});
